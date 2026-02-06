import type { KeyEvent, KeySequenceState } from "@bunvim/sdk";
import {
	activePicker,
	bufferActions,
	bufferStore,
	createInitialState,
	editorUiActions,
	editorUiStore,
	normal,
	processKey,
	setActivePicker,
	setSize,
	terminalState,
	windowActions,
	windowStore,
} from "@bunvim/sdk";
import { useKeyboard, useTerminalDimensions } from "@opentui/solid";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { registerDefaultKeymaps } from "../keymaps";
import { Statusline } from "./statusline";

interface EditorViewProps {
	initialFile?: string;
}

export function EditorView(props: EditorViewProps) {
	const termDims = useTerminalDimensions();
	const width = () => termDims().width;
	const height = () => termDims().height;
	const [keySequenceState, setKeySequenceState] =
		createSignal<KeySequenceState>(createInitialState());

	onMount(() => {
		setSize(width(), height());
		registerDefaultKeymaps();

		const existingBuffers = bufferStore.buffers;
		let bufId: string;

		if (existingBuffers.length > 0 && existingBuffers[0]) {
			bufId = existingBuffers[0].id;
		} else {
			const buf = bufferActions.emptyState({
				type: "scratch",
				name: "[No Name]",
			});
			bufId = buf.id;
		}

		const win = windowActions.create(bufId);
		windowActions.setActive(win.id);

		const hasFile = existingBuffers.some((b) => b.props.type === "file");
		editorUiActions.setIsHomeBuffer(!hasFile);
	});

	const activeWindow = createMemo(() => {
		return windowStore.windows.find((w) => w.id === windowStore.activeWindowId);
	});

	const activeBuffer = createMemo(() => {
		const win = activeWindow();
		if (!win) return undefined;
		return bufferStore.buffers.find((b) => b.id === win.bufId);
	});

	const editorHeight = createMemo(() => height() - 1);

	const openFile = async (filePath: string) => {
		try {
			const content = await Bun.file(filePath).text();
			const normalizedContent = content
				.replace(/\r\n/g, "\n")
				.replace(/\r/g, "\n")
				.replace(/\n$/, "");

			const existingBuffer = bufferStore.buffers.find(
				(b) => b.props.path === filePath,
			);

			if (existingBuffer) {
				const win = activeWindow();
				if (win) {
					windowActions.setBuffer(win.id, existingBuffer.id);
				}
			} else {
				const newBuffer = bufferActions.createState(normalizedContent, {
					type: "file",
					path: filePath,
					name: filePath.split("/").pop(),
				});

				const win = activeWindow();
				if (win) {
					windowActions.setBuffer(win.id, newBuffer.id);
					windowActions.setCursor(win.id, 0, 0);
					windowActions.setScroll(win.id, 0, 0);
				}
			}

			editorUiActions.setIsHomeBuffer(false);
			editorUiActions.setMode(normal());
		} catch (e) {
			console.error("Failed to open file:", e);
		}
	};

	const handleKeyResult = (result: import("@bunvim/sdk").KeyHandlerResult) => {
		editorUiActions.clearPendingKeys();

		switch (result.type) {
			case "callback":
				result.callback();
				break;
			case "mode-change":
				editorUiActions.setMode(result.mode);
				if (result.mode.type === "visual") {
					const win = activeWindow();
					if (win) {
						editorUiActions.setVisualAnchor(win.cursor.line, win.cursor.column);
					}
				}
				break;
			case "command-update":
				if (
					editorUiStore.mode.type === "command" ||
					editorUiStore.mode.type === "search"
				) {
					editorUiActions.setMode({
						...editorUiStore.mode,
						input: result.input,
					});
				}
				break;
			case "command-execute":
				executeCommand(result.command);
				break;
			case "command-cancel":
				editorUiActions.setMode(normal());
				break;
		}
	};

	const executeCommand = (command: string) => {
		const trimmed = command.trim();

		if (trimmed === "q" || trimmed === "quit") {
			process.exit(0);
		}

		if (trimmed === "q!") {
			process.exit(0);
		}

		if (trimmed.startsWith("e ")) {
			const filePath = trimmed.slice(2).trim();
			openFile(filePath);
			return;
		}

		if (/^\d+$/.test(trimmed)) {
			const lineNum = Number.parseInt(trimmed, 10) - 1;
			const win = activeWindow();
			if (win) {
				windowActions.setCursor(win.id, lineNum, 0);
			}
			editorUiActions.setMode(normal());
			return;
		}

		editorUiActions.setMode(normal());
	};

	const insertChar = (char: string) => {
		const win = activeWindow();
		if (!win) return;

		const buf = activeBuffer();
		if (!buf) return;

		const pos = win.cursor;
		const newBuffer = bufferActions.insertAt(buf.id, pos, char);

		if (newBuffer) {
			windowActions.setCursor(win.id, pos.line, pos.column + char.length);
		}
	};

	useKeyboard((key) => {
		if (activePicker()) return;

		let actualKey =
			key.name || (key.sequence?.length === 1 ? key.sequence : "");
		if (actualKey === "space") actualKey = " ";

		const keyEvent: KeyEvent = {
			key: actualKey,
			ctrl: key.ctrl ?? false,
			meta: key.meta ?? false,
			shift: key.shift ?? false,
			sequence: key.sequence ?? "",
		};

		if (editorUiStore.mode.type === "insert") {
			if (
				key.name === "escape" ||
				key.sequence === "\x1b" ||
				(key.ctrl && key.name === "c")
			) {
				handleKeyResult({ type: "mode-change", mode: normal() });
				const win = activeWindow();
				if (win && win.cursor.column > 0) {
					windowActions.setCursor(
						win.id,
						win.cursor.line,
						win.cursor.column - 1,
					);
				}
			} else if (key.name === "backspace") {
				const win = activeWindow();
				if (win && (win.cursor.column > 0 || win.cursor.line > 0)) {
					windowActions.setCursor(
						win.id,
						win.cursor.line,
						Math.max(0, win.cursor.column - 1),
					);
				}
			} else if (key.name === "return") {
				insertChar("\n");
				const win = activeWindow();
				if (win) {
					windowActions.setCursor(win.id, win.cursor.line + 1, 0);
				}
			} else if (
				key.sequence &&
				key.sequence.length === 1 &&
				!key.ctrl &&
				!key.meta
			) {
				insertChar(key.sequence);
			}
			return;
		}

		const { result, newState } = processKey({
			state: keySequenceState(),
			key: keyEvent,
			mode: editorUiStore.mode,
			onTimeout: (timeoutResult) => {
				setKeySequenceState(createInitialState());
				handleKeyResult(timeoutResult);
			},
		});

		setKeySequenceState(newState);

		if (result.type === "pending") {
			const pendingDisplay = [newState.count, ...newState.keys].join("");
			editorUiActions.setPendingKeys(pendingDisplay);
			editorUiActions.setClueScrollTop(0);
		} else {
			handleKeyResult(result);
		}
	});

	const renderBufferContent = () => {
		const buf = activeBuffer();
		if (!buf) return null;

		const lines = bufferActions.getText(buf)?.split("\n") ?? [];
		const win = activeWindow();
		const startLine = win?.scrollTop ?? 0;
		const endLine = Math.min(startLine + editorHeight(), lines.length);

		return (
			<For each={lines.slice(startLine, endLine)}>
				{(line) => (
					<box flexDirection="row">
						<text fg="#c0caf5">{line || " "}</text>
					</box>
				)}
			</For>
		);
	};

	return (
		<box flexDirection="column" flexGrow={1}>
			<Show
				when={!editorUiStore.isHomeBuffer}
				fallback={
					<box flexGrow={1} style={{ backgroundColor: "#1a1b26" }}>
						<box flexDirection="column" padding={2}>
							<text fg="#7aa2f7" style={{ marginBottom: 1 }}>
								Welcome to Bunvim!
							</text>
							<text fg="#c0caf5">Press : to enter commands</text>
							<text fg="#c0caf5">Use :e filename to open a file</text>
							<text fg="#c0caf5">Press i to enter insert mode</text>
							<text fg="#c0caf5">Press Esc to return to normal mode</text>
						</box>
					</box>
				}
			>
				<box flexGrow={1} flexDirection="column" style={{ padding: 0 }}>
					{renderBufferContent()}
				</box>
			</Show>

			<Statusline
				mode={editorUiStore.mode}
				cursorLine={activeWindow()?.cursor.line ?? 0}
				cursorColumn={activeWindow()?.cursor.column ?? 0}
				bufferName={activeBuffer()?.props.name}
				modified={activeBuffer()?.modified}
				pendingKeys={editorUiStore.pendingKeys}
			/>

			<Show when={editorUiStore.mode.type === "command"}>
				<box
					position="absolute"
					left={0}
					bottom={0}
					width="100%"
					height={1}
					style={{ backgroundColor: "#1f2335" }}
				>
					<text fg="#ff9e64">:</text>
					<text fg="#c0caf5">{editorUiStore.mode.input}</text>
				</box>
			</Show>

			<Show when={editorUiStore.mode.type === "search"}>
				<box
					position="absolute"
					left={0}
					bottom={0}
					width="100%"
					height={1}
					style={{ backgroundColor: "#1f2335" }}
				>
					<text fg="#ff9e64">
						{editorUiStore.mode.direction === "forward" ? "/" : "?"}
					</text>
					<text fg="#c0caf5">{editorUiStore.mode.input}</text>
				</box>
			</Show>
		</box>
	);
}
