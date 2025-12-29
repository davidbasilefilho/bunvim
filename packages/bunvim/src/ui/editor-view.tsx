import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { Effect } from "effect";
import { useCallback, useEffect, useRef, useState } from "react";
import { registerBuiltins } from "../api/builtins";
import * as Options from "../api/options";
import { vim } from "../api/vim";
import * as Buffer from "../core/buffer";
import * as Jumplist from "../core/jumplist";
import * as Undo from "../core/undo";
import * as Keymap from "../keybindings/keymap";
import * as Motions from "../keybindings/motions";
import { bufferSource, filesSource, grepSource } from "../picker/builtins";
import type { PickerSource } from "../picker/source";
import { detectLanguage, getGrammar } from "../treesitter/grammars";
import type { HighlightRange } from "../treesitter/highlights";
import { getHighlights } from "../treesitter/highlights";
import { parse } from "../treesitter/parser";
import { getClassObject, getFunctionObject } from "../treesitter/textobjects";
import { Clue } from "./clue";
import { Dialog, DialogItem, DialogList } from "./dialog";
import { HomeBuffer } from "./home-buffer";
import { InputPopup } from "./input-popup";
import { Notifications } from "./notifications";
import { Picker } from "./picker";
import { Statusline } from "./statusline";
import { type BufferEntry, BufferWindow } from "./window";

type WindowState = {
	id: number;
	bufId: number;
	bufferIds: number[];
	split?: "h" | "v";
	cursorLine: number;
	cursorColumn: number;
	scrollTop: number;
};

type EditorState = {
	buffers: Buffer.BufferState[];
	windows: WindowState[];
	activeWindowId: number;
	mode: Keymap.EditorMode;
	pendingKeys: string;
	clueScrollTop: number;
	visualAnchorLine: number;
	visualAnchorColumn: number;
	yankRegister: string;
	activePicker?: {
		source: PickerSource;
	};
	highlights: Record<number, HighlightRange[]>;
	isHomeBuffer: boolean;
	lastSearch?: {
		pattern: string;
		direction: "forward" | "backward";
	};
	quitDialog?: {
		bufId: number;
		onConfirm: () => void;
		onCancel: () => void;
	};
	hoverPopup?: {
		contents: string;
		line: number;
		column: number;
	};
};

const INITIAL_CONTENT =
	"Welcome to Bunvim!\n\nPress : to enter commands.\nUse <leader>ff to find files.\nUse <leader>f/ to grep project.";

export function EditorView() {
	const { width, height } = useTerminalDimensions();
	const [state, setState] = useState<EditorState>(() => {
		const initialBuffer = Buffer.createState(INITIAL_CONTENT, {
			type: "scratch",
			name: "[Home]",
		});
		return {
			buffers: [initialBuffer],
			windows: [
				{
					id: 0,
					bufId: initialBuffer.id,
					bufferIds: [initialBuffer.id],
					cursorLine: 0,
					cursorColumn: 0,
					scrollTop: 0,
				},
			],
			activeWindowId: 0,
			mode: { type: "normal" },
			pendingKeys: "",
			clueScrollTop: 0,
			visualAnchorLine: 0,
			visualAnchorColumn: 0,
			yankRegister: "",
			highlights: {},
			isHomeBuffer: true,
		};
	});

	const activeWindow =
		state.windows.find((w) => w.id === state.activeWindowId) ||
		state.windows[0]!;
	const activeBuffer =
		state.buffers.find((b) => b.id === activeWindow.bufId) || state.buffers[0]!;

	useEffect(() => {
		const updateHighlights = async () => {
			const language = detectLanguage(activeBuffer.props.name || "");
			if (language === "text") {
				setState((s) => ({
					...s,
					highlights: { ...s.highlights, [activeBuffer.id]: [] },
				}));
				return;
			}

			const effect = Effect.gen(function* (_) {
				const grammar = yield* _(getGrammar(language));
				const content = Buffer.getText(activeBuffer);
				const tree = yield* _(parse(content, grammar));
				const highlights = yield* _(getHighlights(tree, grammar, ""));
				return highlights;
			});

			try {
				const highlights = await Effect.runPromise(effect);
				setState((s) => ({
					...s,
					highlights: {
						...s.highlights,
						[activeBuffer.id]: highlights as any,
					},
				}));
			} catch (_e) {}
		};
		updateHighlights();
	}, [activeBuffer]);

	const keySequenceRef = useRef<Keymap.KeySequenceState>(
		Keymap.createInitialState(),
	);

	const gutterWidth = Options.opt.number ? 4 : 0;
	const editorHeight = height - 1;

	const clampCursor = useCallback(
		(
			line: number,
			column: number,
			bufferState: Buffer.BufferState,
			mode: Keymap.EditorMode,
		) => {
			const maxLine = Buffer.lineCount(bufferState) - 1;
			const clampedLine = Math.max(0, Math.min(line, maxLine));
			const lineLen = Buffer.getLineLength(bufferState, clampedLine) ?? 0;
			const maxCol =
				mode.type === "insert" ? lineLen : Math.max(0, lineLen - 1);
			const clampedColumn = Math.max(0, Math.min(column, maxCol));
			return { line: clampedLine, column: clampedColumn };
		},
		[],
	);

	const adjustScroll = useCallback(
		(line: number, scrollTop: number): number => {
			if (line < scrollTop) return line;
			if (line >= scrollTop + editorHeight - 1)
				return line - (editorHeight - 2);
			return scrollTop;
		},
		[editorHeight],
	);

	const getVisualSelectionText = useCallback((s: EditorState): string => {
		if (s.mode.type !== "visual") return "";
		const win = s.windows.find((w) => w.id === s.activeWindowId)!;
		const buf = s.buffers.find((b) => b.id === win.bufId)!;

		const startLine = Math.min(s.visualAnchorLine, win.cursorLine);
		const endLine = Math.max(s.visualAnchorLine, win.cursorLine);

		if (s.mode.subtype === "line") {
			const lines: string[] = [];
			for (let i = startLine; i <= endLine; i++) {
				lines.push(Buffer.getLine(buf, i) ?? "");
			}
			return lines.join("");
		}

		if (s.mode.subtype === "char") {
			if (startLine === endLine) {
				const line = Buffer.getLine(buf, startLine) ?? "";
				const startCol = Math.min(s.visualAnchorColumn, win.cursorColumn);
				const endCol = Math.max(s.visualAnchorColumn, win.cursorColumn);
				return line.slice(startCol, endCol + 1);
			}
			const lines: string[] = [];
			for (let i = startLine; i <= endLine; i++) {
				const line = Buffer.getLine(buf, i) ?? "";
				if (i === startLine) {
					const startCol =
						s.visualAnchorLine < win.cursorLine
							? s.visualAnchorColumn
							: win.cursorColumn;
					lines.push(line.slice(startCol));
				} else if (i === endLine) {
					const endCol =
						s.visualAnchorLine > win.cursorLine
							? s.visualAnchorColumn
							: win.cursorColumn;
					lines.push(line.slice(0, endCol + 1));
				} else {
					lines.push(line);
				}
			}
			return lines.join("");
		}

		return "";
	}, []);

	const deleteVisualSelection = useCallback(
		(
			s: EditorState,
		): {
			text: string;
			newBuffers: Buffer.BufferState[];
			newCursorLine: number;
			newCursorColumn: number;
		} => {
			const win = s.windows.find((w) => w.id === s.activeWindowId)!;
			const buf = s.buffers.find((b) => b.id === win.bufId)!;
			if (s.mode.type !== "visual") {
				return {
					text: "",
					newBuffers: s.buffers,
					newCursorLine: win.cursorLine,
					newCursorColumn: win.cursorColumn,
				};
			}

			const startLine = Math.min(s.visualAnchorLine, win.cursorLine);
			const endLine = Math.max(s.visualAnchorLine, win.cursorLine);
			const text = getVisualSelectionText(s);

			let range = {
				start: { line: 0, column: 0 },
				end: { line: 0, column: 0 },
			};
			let newCursorLine = startLine;
			let newCursorColumn = 0;

			if (s.mode.subtype === "line") {
				const lineCount = Buffer.lineCount(buf);
				let rangeEndLine = endLine;
				let rangeEndCol = Buffer.getLineLength(buf, endLine) ?? 0;

				if (endLine < lineCount - 1) {
					rangeEndLine = endLine + 1;
					rangeEndCol = 0;
					range = {
						start: { line: startLine, column: 0 },
						end: { line: rangeEndLine, column: rangeEndCol },
					};
				} else if (startLine > 0) {
					const prevLineLen = Buffer.getLineLength(buf, startLine - 1) ?? 0;
					range = {
						start: { line: startLine - 1, column: prevLineLen },
						end: { line: endLine, column: rangeEndCol },
					};
					newCursorLine = Math.max(0, startLine - 1);
				} else {
					range = {
						start: { line: startLine, column: 0 },
						end: { line: endLine, column: rangeEndCol },
					};
				}
			} else {
				const startCol =
					startLine === endLine
						? Math.min(s.visualAnchorColumn, win.cursorColumn)
						: s.visualAnchorLine < win.cursorLine
							? s.visualAnchorColumn
							: win.cursorColumn;
				const endCol =
					startLine === endLine
						? Math.max(s.visualAnchorColumn, win.cursorColumn)
						: s.visualAnchorLine > win.cursorLine
							? s.visualAnchorColumn
							: win.cursorColumn;

				range = {
					start: { line: startLine, column: startCol },
					end: { line: endLine, column: endCol + 1 },
				};
				newCursorColumn = startCol;
			}

			const newBuffer = Buffer.deleteInRange(buf, range);
			if (!newBuffer) {
				return {
					text: "",
					newBuffers: s.buffers,
					newCursorLine: win.cursorLine,
					newCursorColumn: win.cursorColumn,
				};
			}

			Undo.addEntry([{ type: "delete", range, text }]);

			const newBuffers = s.buffers.map((b) =>
				b.id === buf.id ? newBuffer : b,
			);
			return {
				text,
				newBuffers,
				newCursorLine,
				newCursorColumn,
			};
		},
		[getVisualSelectionText],
	);

	const executeMotion = useCallback(
		(motionName: string, count = 1) => {
			setState((s) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId)!;
				const buf = s.buffers.find((b) => b.id === win.bufId)!;
				const pos = { line: win.cursorLine, column: win.cursorColumn };
				const result = Motions.executeMotion(motionName, buf, pos, count);
				if (!result) return { ...s, pendingKeys: "" };

				const { line, column } = clampCursor(
					result.position.line,
					result.position.column,
					buf,
					s.mode,
				);
				const scrollTop = adjustScroll(line, win.scrollTop);

				const isLargeJump =
					Math.abs(line - win.cursorLine) > 5 ||
					motionName === "gg" ||
					motionName === "G";
				if (isLargeJump) {
					Jumplist.addJump({
						bufferId: win.bufId,
						line: win.cursorLine,
						column: win.cursorColumn,
					});
				}

				return {
					...s,
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId
							? {
									...w,
									cursorLine: line,
									cursorColumn: column,
									scrollTop,
								}
							: w,
					),
					pendingKeys: "",
				};
			});
		},
		[clampCursor, adjustScroll],
	);

	const jumpToPattern = useCallback(
		(
			pattern: string,
			direction: "forward" | "backward",
			fromPos: { line: number; column: number },
			buf: Buffer.BufferState,
		) => {
			const lineCount = Buffer.lineCount(buf);
			const startLine = fromPos.line;
			const startCol = fromPos.column;

			if (direction === "forward") {
				for (let i = 0; i < lineCount; i++) {
					const lineIdx = (startLine + i) % lineCount;
					const lineText = Buffer.getLine(buf, lineIdx) ?? "";
					const searchFrom = i === 0 ? startCol + 1 : 0;
					const matchIdx = lineText.indexOf(pattern, searchFrom);

					if (matchIdx !== -1) {
						return { line: lineIdx, column: matchIdx };
					}
				}
			} else {
				for (let i = 0; i < lineCount; i++) {
					const lineIdx = (startLine - i + lineCount) % lineCount;
					const lineText = Buffer.getLine(buf, lineIdx) ?? "";
					const searchTo = i === 0 ? startCol : lineText.length;
					const matchIdx = lineText.lastIndexOf(pattern, searchTo - 1);

					if (matchIdx !== -1) {
						return { line: lineIdx, column: matchIdx };
					}
				}
			}
			return undefined;
		},
		[],
	);

	const openFile = useCallback(
		async (filePath: string, split?: "h" | "v") => {
			try {
				const existingBuffer = state.buffers.find(
					(b) => b.props.path === filePath || b.props.name === filePath,
				);
				let buf: Buffer.BufferState;

				if (existingBuffer) {
					buf = existingBuffer;
				} else {
					const content = await Bun.file(filePath).text();
					buf = Buffer.createState(content, {
						type: "file",
						path: filePath,
						name: filePath,
					});
				}

				Jumplist.addJump({
					bufferId: activeBuffer.id,
					line: activeWindow.cursorLine,
					column: activeWindow.cursorColumn,
				});

				setState((s) => {
					const newBuffers = existingBuffer ? s.buffers : [...s.buffers, buf];
					const newWindows = [...s.windows];

					if (split) {
						const newWinId = Math.max(...s.windows.map((w) => w.id)) + 1;
						newWindows.push({
							id: newWinId,
							bufId: buf.id,
							bufferIds: [buf.id],
							split,
							cursorLine: 0,
							cursorColumn: 0,
							scrollTop: 0,
						});
						return {
							...s,
							buffers: newBuffers,
							windows: newWindows,
							activeWindowId: newWinId,
							isHomeBuffer: false,
							activePicker: undefined,
							mode: { type: "normal" },
						};
					}

					const windowWithBuf = s.windows.find((w) => w.bufId === buf.id);
					if (windowWithBuf) {
						return {
							...s,
							buffers: newBuffers,
							activeWindowId: windowWithBuf.id,
							isHomeBuffer: false,
							activePicker: undefined,
							mode: { type: "normal" },
						};
					}

					return {
						...s,
						buffers: newBuffers,
						windows: s.windows.map((w) =>
							w.id === s.activeWindowId
								? {
										...w,
										bufId: buf.id,
										bufferIds: w.bufferIds.includes(buf.id)
											? w.bufferIds
											: [...w.bufferIds, buf.id],
										cursorLine: 0,
										cursorColumn: 0,
										scrollTop: 0,
									}
								: w,
						),
						isHomeBuffer: false,
						activePicker: undefined,
						mode: { type: "normal" },
					};
				});
			} catch (e) {
				vim.notify.notify(`Failed to open file: ${e}`, "error");
			}
		},
		[
			state.buffers,
			activeBuffer.id,
			activeWindow.cursorColumn,
			activeWindow.cursorLine,
		],
	);

	const closeActiveBuffer = useCallback((windowId: number, force = false) => {
		setState((s) => {
			const win = s.windows.find((w) => w.id === windowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);

			if (!force && buf?.modified && buf.props.type === "file") {
				return {
					...s,
					quitDialog: {
						bufId: buf.id,
						onConfirm: () => closeActiveBuffer(windowId, true),
						onCancel: () =>
							setState((s2) => ({ ...s2, quitDialog: undefined })),
					},
				};
			}

			const nextBufferIds = win.bufferIds.filter((id) => id !== win.bufId);

			if (nextBufferIds.length === 0) {
				const newWindows = s.windows.filter((w) => w.id !== windowId);
				if (newWindows.length === 0) {
					process.exit(0);
				}
				const nextActiveId =
					windowId === s.activeWindowId ? newWindows[0]?.id : s.activeWindowId;
				return {
					...s,
					windows: newWindows,
					activeWindowId: nextActiveId,
					quitDialog: undefined,
					mode: { type: "normal" },
				};
			}

			return {
				...s,
				windows: s.windows.map((w) =>
					w.id === windowId
						? {
								...w,
								bufferIds: nextBufferIds,
								bufId: nextBufferIds[0]!,
								cursorLine: 0,
								cursorColumn: 0,
								scrollTop: 0,
							}
						: w,
				),
				quitDialog: undefined,
				mode: { type: "normal" },
			};
		});
	}, []);

	const closeAll = useCallback((force = false) => {
		setState((s) => {
			const modifiedBuffers = s.buffers.filter(
				(b) => b.modified && b.props.type === "file",
			);

			if (!force && modifiedBuffers.length > 0) {
				const showNextDialog = (index: number) => {
					const buf = modifiedBuffers[index];
					if (!buf) {
						process.exit(0);
						return;
					}
					setState((s_internal) => ({
						...s_internal,
						quitDialog: {
							bufId: buf.id,
							onConfirm: () => showNextDialog(index + 1),
							onCancel: () =>
								setState((s2) => ({ ...s2, quitDialog: undefined })),
						},
					}));
				};
				showNextDialog(0);
				return s;
			}
			process.exit(0);
		});
	}, []);

	const executeCommand = useCallback(
		(command: string) => {
			if (state.mode.type === "search") {
				const pattern = command;
				const mode = state.mode as Extract<
					Keymap.EditorMode,
					{ type: "search" }
				>;
				const direction = mode.direction;
				const pos = jumpToPattern(
					pattern,
					direction,
					{
						line: activeWindow.cursorLine,
						column: activeWindow.cursorColumn,
					},
					activeBuffer,
				);

				setState((s) => {
					const newState = {
						...s,
						lastSearch: { pattern, direction },
						mode: { type: "normal" } as const,
					};
					if (pos) {
						const { line, column } = clampCursor(
							pos.line,
							pos.column,
							activeBuffer,
							{ type: "normal" },
						);
						newState.windows = s.windows.map((w) =>
							w.id === s.activeWindowId
								? {
										...w,
										cursorLine: line,
										cursorColumn: column,
										scrollTop: adjustScroll(line, w.scrollTop),
									}
								: w,
						);
					}
					return newState;
				});
				return;
			}

			const trimmed = command.trim();
			if (trimmed === "q" || trimmed === "quit") {
				closeActiveBuffer(state.activeWindowId);
				setState((s) => ({ ...s, mode: { type: "normal" } }));
				return;
			}
			if (trimmed === "q!") {
				closeActiveBuffer(state.activeWindowId, true);
				setState((s) => ({ ...s, mode: { type: "normal" } }));
				return;
			}
			if (trimmed === "qa" || trimmed === "quitall") {
				closeAll();
				return;
			}
			if (trimmed === "qa!" || trimmed === "quitall!") {
				process.exit(0);
				return;
			}
			if (trimmed === "wq" || trimmed === "x") {
				const saveAndQuit = async () => {
					const targetPath = activeBuffer.props.path;

					if (!targetPath) {
						vim.notify.notify("No file name", "error");
						setState((s) => ({
							...s,
							mode: { type: "normal" },
							pendingKeys: "",
						}));
						return;
					}

					try {
						const content = Buffer.getText(activeBuffer);
						await Bun.write(targetPath, content);
						closeActiveBuffer(state.activeWindowId, true);
					} catch (e) {
						vim.notify.notify(`Failed to save: ${e}`, "error");
						setState((s) => ({
							...s,
							mode: { type: "normal" },
							pendingKeys: "",
						}));
					}
				};
				saveAndQuit();
				return;
			}
			if (trimmed === "w" || trimmed.startsWith("w ")) {
				const saveFile = async () => {
					const targetPath = trimmed.startsWith("w ")
						? trimmed.slice(2).trim()
						: activeBuffer.props.path;

					if (!targetPath) {
						vim.notify.notify("No file name", "error");
						setState((s) => ({
							...s,
							mode: { type: "normal" },
							pendingKeys: "",
						}));
						return;
					}

					try {
						const content = Buffer.getText(activeBuffer);
						await Bun.write(targetPath, content);

						setState((s) => ({
							...s,
							buffers: s.buffers.map((b) =>
								b.id === activeBuffer.id
									? {
											...b,
											modified: false,
											props: { ...b.props, path: targetPath, name: targetPath },
										}
									: b,
							),
							mode: { type: "normal" },
							pendingKeys: "",
						}));

						const lineCount = Buffer.lineCount(activeBuffer);
						const byteCount = new TextEncoder().encode(content).length;
						vim.notify.notify(
							`"${targetPath}" ${lineCount}L, ${byteCount}B written`,
							"info",
						);
					} catch (e) {
						vim.notify.notify(`Failed to save: ${e}`, "error");
						setState((s) => ({
							...s,
							mode: { type: "normal" },
							pendingKeys: "",
						}));
					}
				};
				saveFile();
				return;
			}

			if (trimmed === "wa" || trimmed === "wall") {
				const saveAll = async () => {
					const fileBuffers = state.buffers.filter(
						(b) => b.props.type === "file" && b.props.path && b.modified,
					);

					if (fileBuffers.length === 0) {
						vim.notify.notify("No modified buffers to save", "info");
						setState((s) => ({
							...s,
							mode: { type: "normal" },
							pendingKeys: "",
						}));
						return;
					}

					let savedCount = 0;
					let failedCount = 0;

					for (const buf of fileBuffers) {
						try {
							const content = Buffer.getText(buf);
							await Bun.write(buf.props.path!, content);
							savedCount++;
						} catch {
							failedCount++;
						}
					}

					setState((s) => ({
						...s,
						buffers: s.buffers.map((b) => {
							if (b.props.type === "file" && b.props.path && b.modified) {
								return { ...b, modified: false };
							}
							return b;
						}),
						mode: { type: "normal" },
						pendingKeys: "",
					}));

					if (failedCount > 0) {
						vim.notify.notify(
							`Saved ${savedCount} buffer(s), ${failedCount} failed`,
							"warn",
						);
					} else {
						vim.notify.notify(`Saved ${savedCount} buffer(s)`, "info");
					}
				};
				saveAll();
				return;
			}

			if (/^\d+$/.test(trimmed)) {
				const lineNum = Number.parseInt(trimmed, 10) - 1;
				const { line, column } = clampCursor(lineNum, 0, activeBuffer, {
					type: "normal",
				});
				setState((s) => ({
					...s,
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId
							? {
									...w,
									cursorLine: line,
									cursorColumn: column,
									scrollTop: adjustScroll(line, w.scrollTop),
								}
							: w,
					),
					mode: { type: "normal" },
					pendingKeys: "",
				}));
				return;
			}

			if (trimmed.startsWith("e ")) {
				const name = trimmed.slice(2).trim();
				openFile(name);
				return;
			}

			if (trimmed.startsWith("/")) {
				const query = trimmed.slice(1);
				setState((s) => ({
					...s,
					activePicker: { source: grepSource(query) },
					mode: { type: "normal" },
					pendingKeys: "",
				}));
				return;
			}

			if (trimmed.startsWith("grep ")) {
				setState((s) => ({
					...s,
					activePicker: { source: grepSource() },
					mode: { type: "normal" },
					pendingKeys: "",
				}));
				return;
			}

			if (trimmed.startsWith("lgrep ")) {
				setState((s) => ({
					...s,
					activePicker: { source: grepSource(activeBuffer.props.name) },
					mode: { type: "normal" },
					pendingKeys: "",
				}));
				return;
			}

			if (trimmed === "sp" || trimmed === "split") {
				setState((s) => {
					const newWinId = Math.max(...s.windows.map((w) => w.id)) + 1;
					return {
						...s,
						windows: [
							...s.windows,
							{ ...activeWindow, id: newWinId, split: "h" },
						],
						activeWindowId: newWinId,
						mode: { type: "normal" },
						pendingKeys: "",
					};
				});
				return;
			}

			if (trimmed === "vsp" || trimmed === "vsplit") {
				setState((s) => {
					const newWinId = Math.max(...s.windows.map((w) => w.id)) + 1;
					return {
						...s,
						windows: [
							...s.windows,
							{ ...activeWindow, id: newWinId, split: "v" },
						],
						activeWindowId: newWinId,
						mode: { type: "normal" },
						pendingKeys: "",
					};
				});
				return;
			}

			if (trimmed.startsWith("s/")) {
				const parts = trimmed.split("/");
				if (parts.length >= 3) {
					const pattern = parts[1]!;
					const replacement = parts[2]!;
					const global = parts[3]?.includes("g");

					const lineText = Buffer.getLine(
						activeBuffer,
						activeWindow.cursorLine,
					);
					if (lineText) {
						const newText = global
							? lineText.replaceAll(pattern, replacement)
							: lineText.replace(pattern, replacement);
						if (newText !== lineText) {
							const range = {
								start: { line: activeWindow.cursorLine, column: 0 },
								end: {
									line: activeWindow.cursorLine,
									column:
										Buffer.getLineLength(
											activeBuffer,
											activeWindow.cursorLine,
										) ?? 0,
								},
							};
							const newBuffer = Buffer.replaceInRange(
								activeBuffer,
								range,
								newText,
							);
							if (newBuffer) {
								Undo.addEntry([
									{ type: "delete", range, text: lineText },
									{ type: "insert", pos: range.start, text: newText },
								]);
								setState((s) => ({
									...s,
									buffers: s.buffers.map((b) =>
										b.id === activeBuffer.id ? newBuffer : b,
									),
									mode: { type: "normal" },
									pendingKeys: "",
								}));
							}
						}
					}
				}
				return;
			}

			const cmdName = trimmed.split(" ")[0] || "";
			const cmd = vim.command.get(cmdName);
			if (cmd) {
				const args = trimmed.split(" ").slice(1).join(" ");
				cmd.handler(args);
				setState((s) => ({ ...s, mode: { type: "normal" }, pendingKeys: "" }));
				return;
			}

			setState((s) => ({ ...s, mode: { type: "normal" }, pendingKeys: "" }));
		},
		[
			activeWindow,
			activeBuffer,
			jumpToPattern,
			clampCursor,
			adjustScroll,
			openFile,
			state.buffers,
			closeActiveBuffer,
			closeAll,
			state.activeWindowId,
			state.mode,
		],
	);

	const handleKeyResult = useCallback(
		(result: Keymap.KeyHandlerResult) => {
			setState((s) => ({ ...s, pendingKeys: "" }));
			switch (result.type) {
				case "callback":
					result.callback();
					break;
				case "mode-change":
					setState((s) => {
						const win = s.windows.find((w) => w.id === s.activeWindowId)!;
						const buf = s.buffers.find((b) => b.id === win.bufId)!;
						if (result.mode.type === "insert" && s.mode.type === "normal") {
							return { ...s, mode: result.mode };
						}
						if (result.mode.type === "visual") {
							return {
								...s,
								mode: result.mode,
								visualAnchorLine: win.cursorLine,
								visualAnchorColumn: win.cursorColumn,
							};
						}
						if (result.mode.type === "normal" && s.mode.type === "insert") {
							const { column } = clampCursor(
								win.cursorLine,
								win.cursorColumn - 1,
								buf,
								{ type: "normal" },
							);
							return {
								...s,
								mode: result.mode,
								windows: s.windows.map((w) =>
									w.id === s.activeWindowId
										? { ...w, cursorColumn: Math.max(0, column) }
										: w,
								),
							};
						}
						return { ...s, mode: result.mode };
					});
					break;
				case "command-update":
					setState((s) => ({
						...s,
						mode: { ...s.mode, input: result.input } as any,
					}));
					break;
				case "command-execute":
					executeCommand(result.command);
					break;
				case "command-cancel":
					setState((s) => ({ ...s, mode: { type: "normal" } }));
					break;
			}
		},
		[clampCursor, executeCommand],
	);

	const insertChar = useCallback((char: string) => {
		setState((s) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId)!;
			const buf = s.buffers.find((b) => b.id === win.bufId)!;
			const pos = { line: win.cursorLine, column: win.cursorColumn };
			const newBuffer = Buffer.insertAt(buf, pos, char);
			if (!newBuffer) return s;

			Undo.addEntry([{ type: "insert", pos, text: char }]);
			return {
				...s,
				buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
				windows: s.windows.map((w) =>
					w.id === s.activeWindowId
						? { ...w, cursorColumn: w.cursorColumn + char.length }
						: w,
				),
			};
		});
	}, []);

	const deleteCharBefore = useCallback(() => {
		setState((s) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId)!;
			const buf = s.buffers.find((b) => b.id === win.bufId)!;
			if (win.cursorColumn === 0 && win.cursorLine === 0) return s;

			let newLine = win.cursorLine;
			let newColumn = win.cursorColumn;
			if (win.cursorColumn === 0) {
				newLine = win.cursorLine - 1;
				newColumn = Buffer.getLineLength(buf, newLine) ?? 0;
			} else {
				newColumn = win.cursorColumn - 1;
			}

			const range = {
				start: { line: newLine, column: newColumn },
				end: { line: win.cursorLine, column: win.cursorColumn },
			};
			const text = Buffer.getTextInRange(buf, range) ?? "";
			const newBuffer = Buffer.deleteInRange(buf, range);
			if (!newBuffer) return s;

			Undo.addEntry([{ type: "delete", range, text }]);
			return {
				...s,
				buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
				windows: s.windows.map((w) =>
					w.id === s.activeWindowId
						? { ...w, cursorLine: newLine, cursorColumn: newColumn }
						: w,
				),
			};
		});
	}, []);

	const undo = useCallback(() => {
		setState((s) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId)!;
			const buf = s.buffers.find((b) => b.id === win.bufId)!;
			const newBuffer = Undo.undo(buf);
			if (!newBuffer) return s;
			return {
				...s,
				buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
			};
		});
	}, []);

	const redo = useCallback(() => {
		setState((s) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId)!;
			const buf = s.buffers.find((b) => b.id === win.bufId)!;
			const newBuffer = Undo.redo(buf);
			if (!newBuffer) return s;
			return {
				...s,
				buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
			};
		});
	}, []);

	const applyOperator = useCallback(
		(motionName: string, count: number) => {
			setState((s) => {
				if (s.mode.type !== "operator-pending") return s;
				const operator = s.mode.operator;
				const win = s.windows.find((w) => w.id === s.activeWindowId)!;
				const buf = s.buffers.find((b) => b.id === win.bufId)!;
				const pos = { line: win.cursorLine, column: win.cursorColumn };
				const motionResult = Motions.executeMotion(motionName, buf, pos, count);
				if (!motionResult) return { ...s, mode: { type: "normal" } };

				let start = pos;
				let end = motionResult.position;
				if (
					Buffer.positionToOffset(buf, start)! >
					Buffer.positionToOffset(buf, end)!
				) {
					[start, end] = [end, start];
				}

				if (motionResult.inclusive) {
					const lineLen = Buffer.getLineLength(buf, end.line) ?? 0;
					if (end.column < lineLen - 1) {
						end = { ...end, column: end.column + 1 };
					} else if (end.line < Buffer.lineCount(buf) - 1) {
						end = { line: end.line + 1, column: 0 };
					}
				}

				if (motionResult.linewise) {
					start = { line: start.line, column: 0 };
					if (end.line < Buffer.lineCount(buf) - 1) {
						end = { line: end.line + 1, column: 0 };
					} else {
						end = {
							line: end.line,
							column: Buffer.getLineLength(buf, end.line) ?? 0,
						};
					}
				}

				const range = { start, end };
				const text = Buffer.getTextInRange(buf, range) ?? "";

				if (operator === "y") {
					return { ...s, yankRegister: text, mode: { type: "normal" } };
				}

				const newBuffer = Buffer.deleteInRange(buf, range);
				if (!newBuffer) return { ...s, mode: { type: "normal" } };

				Undo.addEntry([{ type: "delete", range, text }]);
				const { line, column } = clampCursor(
					start.line,
					start.column,
					newBuffer,
					operator === "c" ? { type: "insert" } : { type: "normal" },
				);

				return {
					...s,
					buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId
							? {
									...w,
									cursorLine: line,
									cursorColumn: column,
									scrollTop: adjustScroll(line, w.scrollTop),
								}
							: w,
					),
					mode: operator === "c" ? { type: "insert" } : { type: "normal" },
					yankRegister: text,
				};
			});
		},
		[clampCursor, adjustScroll],
	);

	const navigateSearch = useCallback(
		(reverse = false) => {
			setState((s) => {
				if (!s.lastSearch) return s;
				const win = s.windows.find((w) => w.id === s.activeWindowId)!;
				const buf = s.buffers.find((b) => b.id === win.bufId)!;

				let direction = s.lastSearch.direction;
				if (reverse) {
					direction = direction === "forward" ? "backward" : "forward";
				}

				const pos = jumpToPattern(
					s.lastSearch.pattern,
					direction,
					{
						line: win.cursorLine,
						column: win.cursorColumn,
					},
					buf,
				);

				if (!pos) return s;

				const { line, column } = clampCursor(pos.line, pos.column, buf, {
					type: "normal",
				});
				return {
					...s,
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId
							? {
									...w,
									cursorLine: line,
									cursorColumn: column,
									scrollTop: adjustScroll(line, w.scrollTop),
								}
							: w,
					),
				};
			});
		},
		[jumpToPattern, clampCursor, adjustScroll],
	);

	const applyTreesitterObject = useCallback(
		async (type: "if" | "af" | "ic" | "ac") => {
			const language = detectLanguage(activeBuffer.props.name || "");
			if (language === "text") return;

			const effect = Effect.gen(function* (_) {
				const grammar = yield* _(getGrammar(language));
				const content = Buffer.getText(activeBuffer);
				const tree = yield* _(parse(content, grammar));

				const pos = {
					line: activeWindow.cursorLine,
					column: activeWindow.cursorColumn,
				};

				let obj: ReturnType<typeof getFunctionObject>;
				if (type === "if" || type === "af") {
					obj = getFunctionObject(
						tree,
						pos,
						type === "if" ? "inner" : "around",
					);
				} else {
					obj = getClassObject(tree, pos, type === "ic" ? "inner" : "around");
				}
				if (!obj) return;

				setState((s) => {
					if (s.mode.type !== "operator-pending") return s;
					const operator = s.mode.operator;
					const range = obj.range;
					const text = Buffer.getTextInRange(activeBuffer, range) ?? "";

					if (operator === "y") {
						return { ...s, yankRegister: text, mode: { type: "normal" } };
					}

					const newBuffer = Buffer.deleteInRange(activeBuffer, range);
					if (!newBuffer) return { ...s, mode: { type: "normal" } };

					Undo.addEntry([{ type: "delete", range, text }]);
					const { line, column } = clampCursor(
						range.start.line,
						range.start.column,
						newBuffer,
						operator === "c" ? { type: "insert" } : { type: "normal" },
					);

					return {
						...s,
						buffers: s.buffers.map((b) =>
							b.id === activeBuffer.id ? newBuffer : b,
						),
						windows: s.windows.map((w) =>
							w.id === s.activeWindowId
								? {
										...w,
										cursorLine: line,
										cursorColumn: column,
										scrollTop: adjustScroll(line, w.scrollTop),
									}
								: w,
						),
						mode: operator === "c" ? { type: "insert" } : { type: "normal" },
						yankRegister: text,
					};
				});
			});

			try {
				await Effect.runPromise(effect);
			} catch (_e) {}
		},
		[activeBuffer, activeWindow, clampCursor, adjustScroll],
	);

	const moveFocus = useCallback((direction: "h" | "j" | "k" | "l") => {
		setState((s) => {
			const activeIdx = s.windows.findIndex((w) => w.id === s.activeWindowId);
			if (activeIdx === -1) return s;

			let nextIdx = activeIdx;
			if (direction === "h" || direction === "k") {
				nextIdx = (activeIdx - 1 + s.windows.length) % s.windows.length;
			} else {
				nextIdx = (activeIdx + 1) % s.windows.length;
			}

			const nextWin = s.windows[nextIdx];
			if (!nextWin) return s;
			return { ...s, activeWindowId: nextWin.id };
		});
	}, []);

	const jumpToPosition = useCallback(
		(bufferId: number, line: number, column: number) => {
			setState((s) => {
				const buf = s.buffers.find((b) => b.id === bufferId);
				if (!buf) return s;

				const windowWithBuf = s.windows.find((w) => w.bufId === bufferId);
				if (windowWithBuf) {
					const { line: clampedLine, column: clampedCol } = clampCursor(
						line,
						column,
						buf,
						{ type: "normal" },
					);
					return {
						...s,
						activeWindowId: windowWithBuf.id,
						windows: s.windows.map((w) =>
							w.id === windowWithBuf.id
								? {
										...w,
										cursorLine: clampedLine,
										cursorColumn: clampedCol,
										scrollTop: adjustScroll(clampedLine, w.scrollTop),
									}
								: w,
						),
					};
				}

				const win = s.windows.find((w) => w.id === s.activeWindowId);
				if (!win) return s;

				const { line: clampedLine, column: clampedCol } = clampCursor(
					line,
					column,
					buf,
					{ type: "normal" },
				);
				return {
					...s,
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId
							? {
									...w,
									bufId: bufferId,
									bufferIds: w.bufferIds.includes(bufferId)
										? w.bufferIds
										: [...w.bufferIds, bufferId],
									cursorLine: clampedLine,
									cursorColumn: clampedCol,
									scrollTop: adjustScroll(clampedLine, w.scrollTop),
								}
							: w,
					),
				};
			});
		},
		[clampCursor, adjustScroll],
	);

	const isRegisteredRef = useRef(false);
	useEffect(() => {
		if (!isRegisteredRef.current) {
			registerBuiltins(
				setState,
				editorHeight,
				adjustScroll,
				clampCursor,
				executeMotion,
				deleteVisualSelection,
				getVisualSelectionText,
				applyOperator,
				undo,
				redo,
				navigateSearch,
				applyTreesitterObject,
				moveFocus,
				jumpToPosition,
				() => {
					setState((s) => {
						const win = s.windows.find((w) => w.id === s.activeWindowId);
						if (!win) return s;
						const buf = s.buffers.find((b) => b.id === win.bufId);
						if (!buf || buf.props.type !== "file") {
							vim.notify.notify("No LSP available", "warn");
							return s;
						}
						return {
							...s,
							hoverPopup: {
								contents: "Loading...",
								line: win.cursorLine,
								column: win.cursorColumn,
							},
						};
					});
				},
				() => {
					vim.notify.notify("Go to definition (LSP not connected)", "warn");
				},
			);
			isRegisteredRef.current = true;
		}
	}, [
		editorHeight,
		adjustScroll,
		clampCursor,
		executeMotion,
		deleteVisualSelection,
		getVisualSelectionText,
		applyOperator,
		undo,
		redo,
		navigateSearch,
		applyTreesitterObject,
		moveFocus,
		jumpToPosition,
	]);

	useKeyboard((key) => {
		if (state.activePicker) return;

		if (state.hoverPopup) {
			setState((s) => ({ ...s, hoverPopup: undefined }));
			return;
		}

		let actualKey =
			key.name || (key.sequence?.length === 1 ? key.sequence : "");
		if (actualKey === "space") actualKey = " ";

		const keyEvent: Keymap.KeyEvent = {
			key: actualKey,
			ctrl: key.ctrl ?? false,
			meta: key.meta ?? false,
			shift: key.shift ?? false,
			sequence: key.sequence ?? "",
		};

		if (state.mode.type === "insert") {
			if (
				key.name === "escape" ||
				key.sequence === "\x1b" ||
				(key.ctrl && key.name === "c")
			) {
				handleKeyResult({ type: "mode-change", mode: { type: "normal" } });
			} else if (key.name === "backspace") {
				deleteCharBefore();
			} else if (key.name === "return") {
				insertChar("\n");
				setState((s) => ({
					...s,
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId
							? {
									...w,
									cursorLine: w.cursorLine + 1,
									cursorColumn: 0,
									scrollTop: adjustScroll(w.cursorLine + 1, w.scrollTop),
								}
							: w,
					),
				}));
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

		const { result, newState } = Keymap.processKey({
			state: keySequenceRef.current,
			key: keyEvent,
			mode: state.mode,
			onTimeout: (timeoutResult) => {
				keySequenceRef.current = Keymap.createInitialState();
				handleKeyResult(timeoutResult);
			},
		});

		keySequenceRef.current = newState;
		if (result.type === "pending") {
			const pendingDisplay = [newState.count, ...newState.keys].join("");
			setState((s) => ({
				...s,
				pendingKeys: pendingDisplay,
				clueScrollTop: 0,
			}));
		} else {
			handleKeyResult(result);
		}
	});

	const onMouseScroll = useCallback(
		(event: any) => {
			const delta = (event.scroll?.delta ?? Options.opt.mouseScrollStep) * 5;
			setState((s) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId)!;
				const buf = s.buffers.find((b) => b.id === win.bufId)!;
				const maxScroll = Math.max(0, Buffer.lineCount(buf) - editorHeight);
				const newScroll = Math.max(
					0,
					Math.min(
						maxScroll,
						win.scrollTop +
							(event.scroll?.direction === "down" ? delta : -delta),
					),
				);
				return {
					...s,
					windows: s.windows.map((w) =>
						w.id === s.activeWindowId ? { ...w, scrollTop: newScroll } : w,
					),
				};
			});
		},
		[editorHeight],
	);

	const onHomeAction = useCallback(
		(key: string) => {
			if (key === "e") executeCommand("e ");
			if (key === "ff")
				setState((s) => ({ ...s, activePicker: { source: filesSource } }));
			if (key === "f/")
				setState((s) => ({ ...s, activePicker: { source: grepSource() } }));
			if (key === "/")
				setState((s) => ({
					...s,
					mode: { type: "search", direction: "forward", input: "" },
				}));
			if (key === "b")
				setState((s) => ({ ...s, activePicker: { source: bufferSource } }));
			if (key === "q") process.exit(0);
		},
		[executeCommand],
	);

	const renderWindows = (windows: WindowState[]) => {
		const buildLayout = (wins: WindowState[]): React.ReactNode => {
			if (wins.length === 0) return null;
			if (wins.length === 1) {
				const win = wins[0]!;
				const buf = state.buffers.find((b) => b.id === win.bufId)!;
				const windowBuffers: BufferEntry[] = win.bufferIds
					.map((id) => state.buffers.find((b) => b.id === id))
					.filter((b): b is Buffer.BufferState => !!b)
					.map((b) => ({
						id: b.id,
						name: b.props.name || "",
						modified: b.modified,
					}));
				return (
					<BufferWindow
						key={win.id}
						id={win.id}
						type="normal"
						buffers={windowBuffers}
						activeBufferId={win.bufId}
						width="100%"
						height="100%"
						gutterWidth={gutterWidth}
						onTabClick={(id) =>
							setState((s) => ({
								...s,
								windows: s.windows.map((w) =>
									w.id === win.id ? { ...w, bufId: id } : w,
								),
							}))
						}
						onTabClose={(id) => {
							setState((s) => {
								return {
									...s,
									windows: s.windows.map((w) => {
										if (w.id !== win.id) return w;
										const nextBufferIds = w.bufferIds.filter(
											(bid) => bid !== id,
										);
										if (nextBufferIds.length === 0) return w;
										return {
											...w,
											bufferIds: nextBufferIds,
											bufId: w.bufId === id ? nextBufferIds[0]! : w.bufId,
										};
									}),
								};
							});
						}}
						editorProps={{
							bufferState: buf,
							cursorLine: win.cursorLine,
							cursorColumn: win.cursorColumn,
							scrollTop: win.scrollTop,
							mode: state.mode,
							visualAnchorLine: state.visualAnchorLine,
							visualAnchorColumn: state.visualAnchorColumn,
							isActive: win.id === state.activeWindowId,
							gutterWidth: gutterWidth,
							highlights: state.highlights[buf.id] || [],
						}}
					/>
				);
			}

			const first = wins[0]!;
			const rest = wins.slice(1);
			const direction = wins[1]?.split === "h" ? "column" : "row";

			return (
				<box flexDirection={direction} flexGrow={1}>
					<box flexGrow={1} flexBasis={0}>
						{buildLayout([first])}
					</box>
					<box flexGrow={1} flexBasis={0}>
						{buildLayout(rest)}
					</box>
				</box>
			);
		};

		return buildLayout(windows);
	};

	return (
		<box flexDirection="column" flexGrow={1} onMouseScroll={onMouseScroll}>
			<box flexDirection="row" flexGrow={1}>
				{state.isHomeBuffer ? (
					<box flexGrow={1}>
						<HomeBuffer onAction={onHomeAction} />
					</box>
				) : (
					renderWindows(state.windows)
				)}
			</box>

			<Statusline
				mode={state.mode}
				cursorLine={activeWindow.cursorLine}
				cursorColumn={activeWindow.cursorColumn}
				bufferName={activeBuffer.props.name}
				pendingKeys={state.pendingKeys || undefined}
			/>

			<Notifications />

			{state.mode.type === "command" && (
				<InputPopup
					label={state.mode.prompt || "CMD"}
					value={state.mode.input}
					icon={state.mode.prompt === "SEARCH" ? "/" : ":"}
				/>
			)}

			{state.activePicker && (
				<Picker
					source={state.activePicker.source}
					onSelect={(item: any, split?: "h" | "v") => {
						if (item.data?.bufId !== undefined) {
							const bufId = item.data.bufId;
							setState((s) => ({
								...s,
								windows: s.windows.map((w) =>
									w.id === s.activeWindowId
										? {
												...w,
												bufId,
												bufferIds: w.bufferIds.includes(bufId)
													? w.bufferIds
													: [...w.bufferIds, bufId],
											}
										: w,
								),
								activePicker: undefined,
								isHomeBuffer: false,
							}));
							return;
						}
						if (item.data?.file) {
							openFile(item.data.file, split);
						}
						if (item.data?.line !== undefined) {
							const win = state.windows.find(
								(w) => w.id === state.activeWindowId,
							)!;
							const buf = state.buffers.find((b) => b.id === win.bufId)!;
							const { line, column } = clampCursor(
								item.data.line - 1,
								item.data.col ? item.data.col - 1 : 0,
								buf,
								{ type: "normal" },
							);
							setState((s) => ({
								...s,
								windows: s.windows.map((w) =>
									w.id === s.activeWindowId
										? {
												...w,
												cursorLine: line,
												cursorColumn: column,
												scrollTop: adjustScroll(line, w.scrollTop),
											}
										: w,
								),
								activePicker: undefined,
							}));
						}
					}}
					onClose={() => setState((s) => ({ ...s, activePicker: undefined }))}
				/>
			)}

			{state.quitDialog && (
				<Dialog
					title="Unsaved Changes"
					description={`Buffer "${state.buffers.find((b) => b.id === state.quitDialog?.bufId)?.props.name}" has unsaved changes. Quit anyway?`}
					onClose={state.quitDialog.onCancel}
				>
					<DialogList>
						<DialogItem
							label="Yes, quit"
							onSelect={state.quitDialog.onConfirm}
							selected={true}
						/>
						<DialogItem
							label="No, go back"
							onSelect={state.quitDialog.onCancel}
						/>
					</DialogList>
				</Dialog>
			)}

			{state.hoverPopup && (
				<box
					position="absolute"
					left={state.hoverPopup.column + gutterWidth + 1}
					top={state.hoverPopup.line - activeWindow.scrollTop + 2}
					width={Math.min(
						60,
						Math.max(
							20,
							state.hoverPopup.contents
								.split("\n")
								.reduce((max, line) => Math.max(max, line.length), 0) + 4,
						),
					)}
					height={Math.min(
						10,
						state.hoverPopup.contents.split("\n").length + 2,
					)}
					border={true}
					borderColor="#7aa2f7"
					backgroundColor="#16161e"
				>
					<box padding={1}>
						<text fg="#c0caf5">{state.hoverPopup.contents}</text>
					</box>
				</box>
			)}

			{state.pendingKeys.length > 0 &&
				state.mode.type !== "command" &&
				!/^\d+$/.test(state.pendingKeys) && (
					<Clue
						pendingKeys={state.pendingKeys}
						mappings={vim.keymap.get_keymaps() as any}
						onSelect={() => {}}
						scrollTop={state.clueScrollTop}
					/>
				)}
		</box>
	);
}
