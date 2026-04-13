import type { KeyEvent, KeySequenceState } from "@bunvim/sdk";
import {
	activePicker,
	bufferActions,
	bufferSource,
	bufferStore,
	createInitialState,
	editorUiActions,
	editorUiStore,
	filesSource,
	getColors,
	grepSource,
	normal,
	processKey,
	setActivePicker,
	setSize,
	useTextInput,
	windowActions,
	windowStore,
} from "@bunvim/sdk";
import { useKeyboard, useTerminalDimensions } from "@opentui/solid";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import { registerDefaultKeymaps } from "../keymaps";
import { ClueMenu } from "./clue-menu";
import { Dashboard, type DashboardKeyHandler } from "./dashboard";
import { InputPopup } from "./input-popup";
import { Statusline } from "./statusline";

interface EditorViewProps {
	initialFile?: string;
}

export function EditorView(_props: EditorViewProps) {
	const termDims = useTerminalDimensions();
	const width = () => termDims().width;
	const height = () => termDims().height;
	const [keySequenceState, setKeySequenceState] =
		createSignal<KeySequenceState>(createInitialState());
	let dashboardKeyHandler: DashboardKeyHandler | undefined;
	const colors = createMemo(() => getColors());

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

	const handleDashboardAction = (actionId: string) => {
		switch (actionId) {
			case "new-file": {
				const buf = bufferActions.emptyState({
					type: "scratch",
					name: "[No Name]",
				});
				const win = activeWindow();
				if (win) {
					windowActions.setBuffer(win.id, buf.id);
					windowActions.setCursor(win.id, 0, 0);
				}
				editorUiActions.setIsHomeBuffer(false);
				editorUiActions.setMode(normal());
				break;
			}
			case "find-file":
				setActivePicker(filesSource);
				break;
			case "grep":
				setActivePicker(grepSource());
				break;
			case "recent":
				setActivePicker(bufferSource);
				break;
			case "quit":
				process.exit(0);
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

	const saveBuffer = async (
		buf: ReturnType<typeof activeBuffer>,
	): Promise<boolean> => {
		if (!buf) return false;
		if (buf.props.type !== "file" || !buf.props.path) return false;

		try {
			const content = bufferActions.getText(buf);
			await Bun.write(buf.props.path, content);
			bufferActions.markSaved(buf.id);
			return true;
		} catch {
			return false;
		}
	};

	const saveAllBuffers = async (): Promise<boolean> => {
		const modifiedBuffers = bufferStore.buffers.filter(
			(b) => b.modified && b.props.type === "file" && b.props.path,
		);
		for (const buf of modifiedBuffers) {
			const ok = await saveBuffer(buf);
			if (!ok) return false;
		}
		return true;
	};

	const hasUnsavedBuffers = (): boolean => {
		return bufferStore.buffers.some(
			(b) => b.modified && b.props.type === "file",
		);
	};

	const executeCommand = (command: string) => {
		const trimmed = command.trim();

		// :w - save current buffer
		if (trimmed === "w" || trimmed === "write") {
			const buf = activeBuffer();
			saveBuffer(buf);
			editorUiActions.setMode(normal());
			return;
		}

		// :wq - save and quit
		if (trimmed === "wq" || trimmed === "x") {
			const buf = activeBuffer();
			saveBuffer(buf).then(() => {
				process.exit(0);
			});
			return;
		}

		// :q - quit (refuse if unsaved changes)
		if (trimmed === "q" || trimmed === "quit") {
			if (hasUnsavedBuffers()) {
				editorUiActions.setMode(normal());
				return;
			}
			process.exit(0);
		}

		// :q! - force quit
		if (trimmed === "q!") {
			process.exit(0);
		}

		// :qa - quit all (refuse if unsaved)
		if (trimmed === "qa" || trimmed === "qall") {
			if (hasUnsavedBuffers()) {
				editorUiActions.setMode(normal());
				return;
			}
			process.exit(0);
		}

		// :qa! - force quit all
		if (trimmed === "qa!") {
			process.exit(0);
		}

		// :wqa / :wqa! - save all and quit
		if (
			trimmed === "wqa" ||
			trimmed === "wqa!" ||
			trimmed === "xa" ||
			trimmed === "xa!"
		) {
			saveAllBuffers().then(() => {
				process.exit(0);
			});
			return;
		}

		// :e <file> - open file
		if (trimmed.startsWith("e ")) {
			const filePath = trimmed.slice(2).trim();
			openFile(filePath);
			return;
		}

		// :<number> - jump to line
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
		const newBuffer = bufferActions.insertAt(buf, pos, char);

		if (newBuffer) {
			bufferActions.updateBufferState(buf.id, () => newBuffer);
			if (char === "\n") {
				windowActions.setCursor(win.id, pos.line + 1, 0);
			} else {
				windowActions.setCursor(win.id, pos.line, pos.column + char.length);
			}
		}
	};

	const handleBackspace = () => {
		const win = activeWindow();
		const buf = activeBuffer();
		if (win && buf && (win.cursor.column > 0 || win.cursor.line > 0)) {
			const curLine = win.cursor.line;
			const curCol = win.cursor.column;

			let startLine: number;
			let startCol: number;

			if (curCol > 0) {
				startLine = curLine;
				startCol = curCol - 1;
			} else {
				const prevLine = bufferActions.getLine(buf, curLine - 1);
				startLine = curLine - 1;
				startCol = prevLine?.length ?? 0;
			}

			const deleteRange = {
				start: { line: startLine, column: startCol },
				end: { line: curLine, column: curCol },
			};

			const newBuffer = bufferActions.deleteInRange(buf, deleteRange);
			if (newBuffer) {
				bufferActions.updateBufferState(buf.id, () => newBuffer);
				windowActions.setCursor(win.id, startLine, startCol);
			}
		}
	};

	const textInput = useTextInput({
		onChar: (char) => insertChar(char),
		onBackspace: () => handleBackspace(),
		onEnter: () => insertChar("\n"),
		onEscape: () => {
			handleKeyResult({ type: "mode-change", mode: normal() });
			const win = activeWindow();
			if (win && win.cursor.column > 0) {
				windowActions.setCursor(win.id, win.cursor.line, win.cursor.column - 1);
			}
		},
		enabled: () => editorUiStore.mode.type === "insert",
	});

	useKeyboard((key) => {
		// Direct test - write to a file to see if keyboard is working
		try {
			const fs = require("node:fs");
			fs.appendFileSync("C:/Users/basile/dev/bunvim/bin/keytest.txt", 
				`key: ${key.name}, home: ${editorUiStore.isHomeBuffer}, mode: ${editorUiStore.mode.type}\n`);
		} catch {}

		if (activePicker()) return;

		if (
			editorUiStore.isHomeBuffer &&
			editorUiStore.mode.type === "normal" &&
			dashboardKeyHandler
		) {
			const handled = dashboardKeyHandler({
				name: key.name,
				sequence: key.sequence,
				ctrl: key.ctrl ?? false,
			});
			if (handled) return;
		}

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
			const handled = textInput.handleKey(keyEvent);
			if (handled) return;
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
		if (!buf) {
			return (
				<box
					flexGrow={1}
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
				>
					<text fg={colors().muted}>No buffer</text>
				</box>
			);
		}

		const content = bufferActions.getText(buf);
		const lines = content ? content.split("\n") : [];
		const win = activeWindow();
		const startLine = win?.scrollTop ?? 0;
		const visibleLines = editorHeight();
		const endLine = Math.min(startLine + visibleLines, lines.length);
		const displayLines = lines.slice(startLine, endLine);

		return (
			<box flexGrow={1} flexDirection="column">
				<For each={displayLines}>
					{(line) => (
						<box flexDirection="row" height={1}>
							<text fg={colors().fg}>{line || " "}</text>
						</box>
					)}
				</For>
			</box>
		);
	};

	return (
		<box flexDirection="column" flexGrow={1}>
			<Show
				when={!editorUiStore.isHomeBuffer}
				fallback={
					<box flexGrow={1}>
						<Dashboard
							onAction={handleDashboardAction}
							onReady={(handler) => {
								dashboardKeyHandler = handler;
							}}
						/>
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
				<box>
					<InputPopup
						label="COMMAND"
						value={editorUiStore.mode.input}
						icon=":"
						useNativeInput
						onInput={(val) =>
							editorUiActions.setMode({
								...editorUiStore.mode,
								input: val,
							})
						}
						onSubmit={() => executeCommand(editorUiStore.mode.input)}
						onCancel={() => editorUiActions.setMode(normal())}
					/>
				</box>
			</Show>

			<Show when={editorUiStore.mode.type === "search"}>
				<box>
					<InputPopup
						label="SEARCH"
						value={editorUiStore.mode.input}
						icon={editorUiStore.mode.direction === "forward" ? "/" : "?"}
						useNativeInput
						onInput={(val) =>
							editorUiActions.setMode({
								...editorUiStore.mode,
								input: val,
							})
						}
						onSubmit={() => editorUiActions.setMode(normal())}
						onCancel={() => editorUiActions.setMode(normal())}
					/>
				</box>
			</Show>

			<ClueMenu />
		</box>
	);
}
