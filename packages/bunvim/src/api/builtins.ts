import * as Buffer from "../core/buffer";
import * as Jumplist from "../core/jumplist";
import * as Undo from "../core/undo";
import type * as KeybindingsKeymap from "../keybindings/keymap";
import * as LocalMarks from "../marks/local";
import { bufferSource, filesSource, grepSource } from "../picker/builtins";
import type { EditorUiState } from "../ui/state";
import { vim } from "./vim";

export function registerBuiltins(
	setState: (updater: (s: EditorUiState) => EditorUiState) => void,
	editorHeight: number,
	adjustScroll: (line: number, scrollTop: number) => number,
	_clampCursor: (
		line: number,
		column: number,
		bufferState: Buffer.BufferState,
		mode: KeybindingsKeymap.EditorMode,
	) => { line: number; column: number },
	executeMotion: (motionName: string, count: number) => void,
	deleteVisualSelection: (s: EditorUiState) => {
		text: string;
		newBuffers: Buffer.BufferState[];
		newCursorLine: number;
		newCursorColumn: number;
	},
	getVisualSelectionText: (s: EditorUiState) => string,
	applyOperator: (motionName: string, count: number) => void,
	undo: () => void,
	redo: () => void,
	navigateSearch: (reverse?: boolean) => void,
	moveFocus: (direction: "h" | "j" | "k" | "l") => void,
	jumpToPosition: (bufferId: number, line: number, column: number) => void,
	showHover: () => void,
	goToDefinition: () => void,
	moveBuffer: (direction: "h" | "j" | "k" | "l") => void,
) {
	const motions = [
		"h",
		"j",
		"k",
		"l",
		"w",
		"b",
		"e",
		"W",
		"B",
		"E",
		"0",
		"$",
		"^",
		"{",
		"}",
		"G",
		"gg",
	];

	for (const m of motions) {
		vim.keymap.set("n", m, () => executeMotion(m, 1));
		vim.keymap.set("o", m, () => applyOperator(m, 1));
	}

	vim.keymap.set("n", "d", () =>
		setState((s: EditorUiState) => ({
			...s,
			mode: { type: "operator-pending", operator: "d", count: undefined },
		})),
	);
	vim.keymap.set("n", "y", () =>
		setState((s: EditorUiState) => ({
			...s,
			mode: { type: "operator-pending", operator: "y", count: undefined },
		})),
	);
	vim.keymap.set("n", "c", () =>
		setState((s: EditorUiState) => ({
			...s,
			mode: { type: "operator-pending", operator: "c", count: undefined },
		})),
	);

	vim.keymap.set("n", "u", undo);
	vim.keymap.set("n", "<C-r>", redo);

	vim.keymap.set(
		"n",
		"<C-o>",
		() => {
			const entry = Jumplist.jumpBack();
			if (entry) {
				jumpToPosition(entry.bufferId, entry.line, entry.column);
			}
		},
		{ desc: "Jump Back" },
	);

	vim.keymap.set(
		"n",
		"<C-i>",
		() => {
			const entry = Jumplist.jumpForward();
			if (entry) {
				jumpToPosition(entry.bufferId, entry.line, entry.column);
			}
		},
		{ desc: "Jump Forward" },
	);

	vim.keymap.set("n", "n", () => navigateSearch());
	vim.keymap.set("n", "N", () => navigateSearch(true));

	vim.keymap.set(
		"n",
		"/",
		() =>
			setState((s: EditorUiState) => ({
				...s,
				mode: { type: "search", direction: "forward", input: "" },
			})),
		{ desc: "Search Forward" },
	);
	vim.keymap.set(
		"n",
		"?",
		() =>
			setState((s: EditorUiState) => ({
				...s,
				mode: { type: "search", direction: "backward", input: "" },
			})),
		{ desc: "Search Backward" },
	);

	vim.keymap.set("n", "i", () =>
		setState((s: EditorUiState) => ({
			...s,
			mode: { type: "insert" },
			pendingKeys: "",
		})),
	);
	vim.keymap.set("n", "a", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			const lineLen = Buffer.getLineLength(buf, win.cursorLine) ?? 0;
			const newCol = Math.min(win.cursorColumn + 1, lineLen);
			return {
				...s,
				mode: { type: "insert" },
				windows: s.windows.map((w) =>
					w.id === win.id ? { ...w, cursorColumn: newCol } : w,
				),
				pendingKeys: "",
			};
		}),
	);
	vim.keymap.set("n", "A", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			const lineLen = Buffer.getLineLength(buf, win.cursorLine) ?? 0;
			return {
				...s,
				mode: { type: "insert" },
				windows: s.windows.map((w) =>
					w.id === win.id ? { ...w, cursorColumn: lineLen } : w,
				),
				pendingKeys: "",
			};
		}),
	);
	vim.keymap.set("n", "I", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			const line = Buffer.getLine(buf, win.cursorLine) ?? "";
			const match = line.match(/^\s*/);
			const firstNonBlank = match ? match[0].length : 0;
			return {
				...s,
				mode: { type: "insert" },
				windows: s.windows.map((w) =>
					w.id === win.id ? { ...w, cursorColumn: firstNonBlank } : w,
				),
				pendingKeys: "",
			};
		}),
	);
	vim.keymap.set("n", "o", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			const lineLen = Buffer.getLineLength(buf, win.cursorLine) ?? 0;
			const pos = { line: win.cursorLine, column: lineLen };
			const newBuffer = Buffer.insertAt(buf, pos, "\n");
			if (!newBuffer) return s;
			Undo.addEntry([{ type: "insert", pos, text: "\n" }]);
			return {
				...s,
				buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
				mode: { type: "insert" },
				windows: s.windows.map((w) =>
					w.id === win.id
						? {
								...w,
								cursorLine: win.cursorLine + 1,
								cursorColumn: 0,
								scrollTop: adjustScroll(win.cursorLine + 1, win.scrollTop),
							}
						: w,
				),
				pendingKeys: "",
			};
		}),
	);
	vim.keymap.set("n", "O", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			const pos = { line: win.cursorLine, column: 0 };
			const newBuffer = Buffer.insertAt(buf, pos, "\n");
			if (!newBuffer) return s;
			Undo.addEntry([{ type: "insert", pos, text: "\n" }]);
			return {
				...s,
				buffers: s.buffers.map((b) => (b.id === buf.id ? newBuffer : b)),
				mode: { type: "insert" },
				windows: s.windows.map((w) =>
					w.id === win.id
						? {
								...w,
								cursorColumn: 0,
								scrollTop: adjustScroll(win.cursorLine, win.scrollTop),
							}
						: w,
				),
				pendingKeys: "",
			};
		}),
	);

	vim.keymap.set("n", "v", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			return {
				...s,
				mode: { type: "visual", subtype: "char" },
				visualAnchorLine: win.cursorLine,
				visualAnchorColumn: win.cursorColumn,
			};
		}),
	);
	vim.keymap.set("n", "V", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			return {
				...s,
				mode: { type: "visual", subtype: "line" },
				visualAnchorLine: win.cursorLine,
				visualAnchorColumn: win.cursorColumn,
			};
		}),
	);
	vim.keymap.set("n", "<C-v>", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			return {
				...s,
				mode: { type: "visual", subtype: "block" },
				visualAnchorLine: win.cursorLine,
				visualAnchorColumn: win.cursorColumn,
			};
		}),
	);

	vim.keymap.set("n", ":", () =>
		setState((s: EditorUiState) => ({
			...s,
			mode: { type: "command", input: "" },
		})),
	);

	vim.keymap.set("n", "<C-h>", () => moveFocus("h"), {
		desc: "Focus Left",
	});
	vim.keymap.set("n", "<C-j>", () => moveFocus("j"), {
		desc: "Focus Down",
	});
	vim.keymap.set("n", "<C-k>", () => moveFocus("k"), {
		desc: "Focus Up",
	});
	vim.keymap.set("n", "<C-l>", () => moveFocus("l"), {
		desc: "Focus Right",
	});

	vim.keymap.set("n", "<C-H>", () => moveFocus("h"), {
		desc: "Focus Left",
	});
	vim.keymap.set("n", "<C-J>", () => moveFocus("j"), {
		desc: "Focus Down",
	});
	vim.keymap.set("n", "<C-K>", () => moveFocus("k"), {
		desc: "Focus Up",
	});
	vim.keymap.set("n", "<C-L>", () => moveFocus("l"), {
		desc: "Focus Right",
	});

	vim.keymap.set("n", "<C-w>h", () => moveFocus("h"), {
		desc: "Window Left",
	});
	vim.keymap.set("n", "<C-w>j", () => moveFocus("j"), {
		desc: "Window Down",
	});
	vim.keymap.set("n", "<C-w>k", () => moveFocus("k"), {
		desc: "Window Up",
	});
	vim.keymap.set("n", "<C-w>l", () => moveFocus("l"), {
		desc: "Window Right",
	});
	vim.keymap.set("n", "<C-j>", () => moveFocus("j"), {
		desc: "Focus Down",
	});
	vim.keymap.set("n", "<C-k>", () => moveFocus("k"), {
		desc: "Focus Up",
	});
	vim.keymap.set("n", "<C-l>", () => moveFocus("l"), {
		desc: "Focus Right",
	});

	vim.keymap.set("n", "<C-H>", () => moveFocus("h"), {
		desc: "Focus Left",
	});
	vim.keymap.set("n", "<C-J>", () => moveFocus("j"), {
		desc: "Focus Down",
	});
	vim.keymap.set("n", "<C-K>", () => moveFocus("k"), {
		desc: "Focus Up",
	});
	vim.keymap.set("n", "<C-L>", () => moveFocus("l"), {
		desc: "Focus Right",
	});

	vim.keymap.set("n", "<C-w>h", () => moveFocus("h"), {
		desc: "Window Left",
	});
	vim.keymap.set("n", "<C-w>j", () => moveFocus("j"), {
		desc: "Window Down",
	});
	vim.keymap.set("n", "<C-w>k", () => moveFocus("k"), {
		desc: "Window Up",
	});
	vim.keymap.set("n", "<C-w>l", () => moveFocus("l"), {
		desc: "Window Right",
	});

	vim.keymap.set(
		"n",
		"<C-w>s",
		() => {
			vim.command.get("sp")?.handler("");
		},
		{ desc: "Split Horizontal" },
	);
	vim.keymap.set(
		"n",
		"<C-w>v",
		() => {
			vim.command.get("vsp")?.handler("");
		},
		{ desc: "Split Vertical" },
	);

	const markChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

	for (const char of markChars) {
		vim.keymap.set(
			"n",
			`m${char}`,
			() =>
				setState((s: EditorUiState) => {
					const win = s.windows.find((w) => w.id === s.activeWindowId);
					if (!win) return s;
					LocalMarks.setMark(char, win.bufId, win.cursorLine, win.cursorColumn);
					vim.notify.notify(`Mark '${char}' set`, "info");
					return s;
				}),
			{ desc: `Set Mark ${char}` },
		);

		vim.keymap.set(
			"n",
			`'${char}`,
			() => {
				setState((s: EditorUiState) => {
					const win = s.windows.find((w) => w.id === s.activeWindowId);
					if (!win) return s;
					const mark = LocalMarks.getMark(char, win.bufId);
					if (!mark) {
						vim.notify.notify(`Mark '${char}' not set`, "error");
						return s;
					}
					if (mark.bufferId !== win.bufId) {
						jumpToPosition(mark.bufferId, mark.line, 0);
						return s;
					}
					Jumplist.addJump({
						bufferId: win.bufId,
						line: win.cursorLine,
						column: win.cursorColumn,
					});
					return {
						...s,
						windows: s.windows.map((w) =>
							w.id === win.id
								? {
										...w,
										cursorLine: mark.line,
										cursorColumn: 0,
										scrollTop: adjustScroll(mark.line, w.scrollTop),
									}
								: w,
						),
					};
				});
			},
			{ desc: `Jump to Mark ${char} (line)` },
		);

		vim.keymap.set(
			"n",
			`\`${char}`,
			() => {
				setState((s: EditorUiState) => {
					const win = s.windows.find((w) => w.id === s.activeWindowId);
					if (!win) return s;
					const mark = LocalMarks.getMark(char, win.bufId);
					if (!mark) {
						vim.notify.notify(`Mark '${char}' not set`, "error");
						return s;
					}
					if (mark.bufferId !== win.bufId) {
						jumpToPosition(mark.bufferId, mark.line, mark.column);
						return s;
					}
					Jumplist.addJump({
						bufferId: win.bufId,
						line: win.cursorLine,
						column: win.cursorColumn,
					});
					return {
						...s,
						windows: s.windows.map((w) =>
							w.id === win.id
								? {
										...w,
										cursorLine: mark.line,
										cursorColumn: mark.column,
										scrollTop: adjustScroll(mark.line, w.scrollTop),
									}
								: w,
						),
					};
				});
			},
			{ desc: `Jump to Mark ${char} (exact)` },
		);
	}

	vim.keymap.set(
		"n",
		"s",
		() => {
			setState((s: EditorUiState) => ({
				...s,
				mode: { type: "command", input: "", prompt: "FLASH" },
			}));
		},
		{ desc: "Flash Jump" },
	);

	vim.keymap.set("n", "zz", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			return {
				...s,
				windows: s.windows.map((w) =>
					w.id === win.id
						? {
								...w,
								scrollTop: Math.max(
									0,
									Math.min(
										Buffer.lineCount(buf) - editorHeight,
										win.cursorLine - Math.floor(editorHeight / 2),
									),
								),
							}
						: w,
				),
			};
		}),
	);
	vim.keymap.set("n", "<C-u>", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const halfPage = Math.floor(editorHeight / 2);
			const newLine = Math.max(0, win.cursorLine - halfPage);
			const newScroll = Math.max(0, newLine - Math.floor(editorHeight / 2));
			return {
				...s,
				windows: s.windows.map((w) =>
					w.id === win.id
						? { ...w, cursorLine: newLine, scrollTop: newScroll }
						: w,
				),
			};
		}),
	);
	vim.keymap.set("n", "<C-d>", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const buf = s.buffers.find((b) => b.id === win.bufId);
			if (!buf) return s;
			const halfPage = Math.floor(editorHeight / 2);
			const maxLine = Buffer.lineCount(buf) - 1;
			const newLine = Math.min(maxLine, win.cursorLine + halfPage);
			const newScroll = Math.max(
				0,
				Math.min(
					Buffer.lineCount(buf) - editorHeight,
					newLine - Math.floor(editorHeight / 2),
				),
			);
			return {
				...s,
				windows: s.windows.map((w) =>
					w.id === win.id
						? { ...w, cursorLine: newLine, scrollTop: Math.max(0, newScroll) }
						: w,
				),
			};
		}),
	);

	vim.keymap.set("n", "gt", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const bufIdx = s.buffers.findIndex((b) => b.id === win.bufId);
			const nextBuf = s.buffers[(bufIdx + 1) % s.buffers.length];
			if (!nextBuf) return s;
			return {
				...s,
				windows: s.windows.map((w) =>
					w.id === win.id ? { ...w, bufId: nextBuf.id } : w,
				),
			};
		}),
	);
	vim.keymap.set("n", "gT", () =>
		setState((s: EditorUiState) => {
			const win = s.windows.find((w) => w.id === s.activeWindowId);
			if (!win) return s;
			const bufIdx = s.buffers.findIndex((b) => b.id === win.bufId);
			const nextBuf =
				s.buffers[(bufIdx - 1 + s.buffers.length) % s.buffers.length];
			if (!nextBuf) return s;
			return {
				...s,
				windows: s.windows.map((w) =>
					w.id === win.id ? { ...w, bufId: nextBuf.id } : w,
				),
			};
		}),
	);

	for (const vMode of ["v", "x", "b"] as const) {
		const deleteAction = () =>
			setState((s: EditorUiState) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId);
				if (!win) return s;
				const { text, newBuffers, newCursorLine, newCursorColumn } =
					deleteVisualSelection(s);
				return {
					...s,
					buffers: newBuffers,
					windows: s.windows.map((w) =>
						w.id === win.id
							? {
									...w,
									cursorLine: newCursorLine,
									cursorColumn: newCursorColumn,
									scrollTop: adjustScroll(newCursorLine, win.scrollTop),
								}
							: w,
					),
					mode: { type: "normal" },
					yankRegister: text,
				};
			});

		vim.keymap.set(vMode, "d", deleteAction);
		vim.keymap.set(vMode, "x", deleteAction);

		vim.keymap.set(vMode, "y", () =>
			setState((s: EditorUiState) => {
				const text = getVisualSelectionText(s);
				return {
					...s,
					mode: { type: "normal" },
					yankRegister: text,
				};
			}),
		);

		vim.keymap.set(vMode, "c", () =>
			setState((s: EditorUiState) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId);
				if (!win) return s;
				const { text, newBuffers, newCursorLine, newCursorColumn } =
					deleteVisualSelection(s);
				return {
					...s,
					buffers: newBuffers,
					windows: s.windows.map((w) =>
						w.id === win.id
							? {
									...w,
									cursorLine: newCursorLine,
									cursorColumn: newCursorColumn,
									scrollTop: adjustScroll(newCursorLine, win.scrollTop),
								}
							: w,
					),
					mode: { type: "insert" },
					yankRegister: text,
				};
			}),
		);

		vim.keymap.set(vMode, "escape", () =>
			setState((s: EditorUiState) => ({ ...s, mode: { type: "normal" } })),
		);
		vim.keymap.set(vMode, "<C-c>", () =>
			setState((s: EditorUiState) => ({ ...s, mode: { type: "normal" } })),
		);

		vim.keymap.set(vMode, "J", () =>
			setState((s: EditorUiState) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId);
				if (!win || s.mode.type !== "visual" || s.mode.subtype !== "line")
					return s;
				const buf = s.buffers.find((b) => b.id === win.bufId);
				if (!buf) return s;
				const startLine = Math.min(s.visualAnchorLine, win.cursorLine);
				const endLine = Math.max(s.visualAnchorLine, win.cursorLine);
				if (endLine >= Buffer.lineCount(buf) - 1) return s;

				const lines = [];
				for (let i = 0; i < Buffer.lineCount(buf); i++) {
					lines.push(Buffer.getLine(buf, i) ?? "");
				}

				const movedLines = lines.splice(startLine, endLine - startLine + 1);
				lines.splice(startLine + 1, 0, ...movedLines);

				const newBuf = Buffer.createState(lines.join(""), buf.props);
				return {
					...s,
					buffers: s.buffers.map((b) => (b.id === buf.id ? newBuf : b)),
					windows: s.windows.map((w) =>
						w.id === win.id
							? {
									...w,
									cursorLine: win.cursorLine + 1,
									scrollTop: adjustScroll(win.cursorLine + 1, win.scrollTop),
								}
							: w,
					),
					visualAnchorLine: s.visualAnchorLine + 1,
				};
			}),
		);

		vim.keymap.set(vMode, "K", () =>
			setState((s: EditorUiState) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId);
				if (!win || s.mode.type !== "visual" || s.mode.subtype !== "line")
					return s;
				const buf = s.buffers.find((b) => b.id === win.bufId);
				if (!buf) return s;
				const startLine = Math.min(s.visualAnchorLine, win.cursorLine);
				const endLine = Math.max(s.visualAnchorLine, win.cursorLine);
				if (startLine <= 0) return s;

				const lines = [];
				for (let i = 0; i < Buffer.lineCount(buf); i++) {
					lines.push(Buffer.getLine(buf, i) ?? "");
				}

				const movedLines = lines.splice(startLine, endLine - startLine + 1);
				lines.splice(startLine - 1, 0, ...movedLines);

				const newBuf = Buffer.createState(lines.join(""), buf.props);
				return {
					...s,
					buffers: s.buffers.map((b) => (b.id === buf.id ? newBuf : b)),
					windows: s.windows.map((w) =>
						w.id === win.id
							? {
									...w,
									cursorLine: win.cursorLine - 1,
									scrollTop: adjustScroll(win.cursorLine - 1, win.scrollTop),
								}
							: w,
					),
					visualAnchorLine: s.visualAnchorLine - 1,
				};
			}),
		);

		for (const m of motions) {
			vim.keymap.set(vMode, m, () => executeMotion(m, 1));
		}

		vim.keymap.set(vMode, "<C-h>", () => moveFocus("h"), {
			desc: "Focus Left",
		});
		vim.keymap.set(vMode, "<C-j>", () => moveFocus("j"), {
			desc: "Focus Down",
		});
		vim.keymap.set(vMode, "<C-k>", () => moveFocus("k"), { desc: "Focus Up" });
		vim.keymap.set(vMode, "<C-l>", () => moveFocus("l"), {
			desc: "Focus Right",
		});

		vim.keymap.set(vMode, "<C-H>", () => moveBuffer("h"), {
			desc: "Move Buffer Left",
		});
		vim.keymap.set(vMode, "<C-J>", () => moveBuffer("j"), {
			desc: "Move Buffer Down",
		});
		vim.keymap.set(vMode, "<C-K>", () => moveBuffer("k"), {
			desc: "Move Buffer Up",
		});
		vim.keymap.set(vMode, "<C-L>", () => moveBuffer("l"), {
			desc: "Move Buffer Right",
		});
	}

	vim.keymap.set(
		"n",
		"<leader>e",
		() => {
			setState((s: EditorUiState) => ({
				...s,
				mode: { type: "command", input: "e ", prompt: "NEW FILE" },
			}));
		},
		{ desc: "New File" },
	);

	vim.keymap.set(
		"n",
		"<leader>ff",
		() => {
			setState((s: EditorUiState) => ({
				...s,
				activePicker: { source: filesSource },
			}));
		},
		{ desc: "Find File" },
	);

	vim.keymap.set(
		"n",
		"<leader>f/",
		() => {
			setState((s: EditorUiState) => ({
				...s,
				activePicker: { source: grepSource() },
			}));
		},
		{ desc: "Live Grep" },
	);

	vim.keymap.set(
		"n",
		"<leader>/",
		() => {
			setState((s: EditorUiState) => {
				const win = s.windows.find((w) => w.id === s.activeWindowId);
				if (!win) return s;
				const buf = s.buffers.find((b) => b.id === win.bufId);
				if (!buf) return s;
				return {
					...s,
					activePicker: { source: grepSource(buf.props.name) },
				};
			});
		},
		{ desc: "Grep in Current File" },
	);

	vim.keymap.set(
		"n",
		"<leader>r",
		() => {
			vim.notify.notify("Recent files (not implemented)", "info");
		},
		{ desc: "Recent Files" },
	);

	vim.keymap.set(
		"n",
		"<leader>m",
		() => {
			vim.notify.notify("Marks editor (not implemented)", "info");
		},
		{ desc: "Marks" },
	);

	vim.keymap.set(
		"n",
		"<leader>b",
		() => {
			setState((s: EditorUiState) => ({
				...s,
				activePicker: { source: bufferSource },
			}));
		},
		{ desc: "Buffers" },
	);

	vim.keymap.set(
		"n",
		"<leader>q",
		() => {
			vim.command.get("q")?.handler("");
		},
		{ desc: "Quit" },
	);

	vim.keymap.set("n", "K", showHover, { desc: "Show Hover" });

	vim.keymap.set("n", "gd", goToDefinition, { desc: "Go to Definition" });
}
