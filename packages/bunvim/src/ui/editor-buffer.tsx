import type React from "react";
import { useMemo } from "react";
import * as Options from "../api/options";
import * as Buffer from "../core/buffer";
import type * as Keymap from "../keybindings/keymap";
import { getColors } from "../theme/manager";
import type { HighlightRange } from "../treesitter/highlights";

export type PaneProps = {
	bufferState: Buffer.BufferState;
	cursorLine: number;
	cursorColumn: number;
	scrollTop: number;
	width: number;
	height: number;
	mode: Keymap.EditorMode;
	visualAnchorLine: number;
	visualAnchorColumn: number;
	isActive: boolean;
	gutterWidth: number;
	highlights?: HighlightRange[];
};

export function EditorBuffer({
	bufferState,
	cursorLine,
	cursorColumn,
	scrollTop,
	width,
	height,
	mode,
	visualAnchorLine,
	visualAnchorColumn,
	isActive,
	gutterWidth,
	highlights = [],
}: PaneProps) {
	const colors = getColors();
	const editorWidth = width - gutterWidth - 1;
	const editorHeight = height;

	const lines = useMemo(() => {
		const captureColors: Record<string, string> = {
			keyword: colors.keyword,
			string: colors.string,
			comment: colors.comment,
			function: colors.function,
			variable: colors.variable,
			type: colors.type,
			constant: colors.constant,
			number: colors.constant,
			operator: colors.keyword,
			property: colors.variable,
			parameter: colors.variable,
			label: colors.keyword,
			"variable.builtin": colors.variable,
			"variable.parameter": colors.variable,
			"function.builtin": colors.function,
			"function.call": colors.function,
			"punctuation.bracket": colors.keyword,
			"punctuation.delimiter": colors.keyword,
			tag: colors.keyword,
			attribute: colors.variable,
			namespace: colors.type,
		};

		const result = [];

		const getCursorStyle = (): "block" | "line" => {
			if (mode.type === "insert" || mode.type === "command") {
				return Options.opt.cursorStyle;
			}
			return "block";
		};

		const getCursorBg = (): string => {
			if (mode.type === "insert") return colors.success;
			if (mode.type === "visual") return colors.selection;
			if (mode.type === "command" || mode.type === "search")
				return colors.warning;
			if (mode.type === "operator-pending") return colors.warning;
			return colors.cursor;
		};

		const isInVisualSelection = (lineNum: number, col: number): boolean => {
			if (mode.type !== "visual") return false;

			const startLine = Math.min(visualAnchorLine ?? cursorLine, cursorLine);
			const endLine = Math.max(visualAnchorLine ?? cursorLine, cursorLine);

			if (mode.subtype === "line") {
				return lineNum >= startLine && lineNum <= endLine;
			}

			if (mode.subtype === "char") {
				if (lineNum < startLine || lineNum > endLine) return false;
				const anchorLine = visualAnchorLine ?? cursorLine;
				const anchorCol = visualAnchorColumn ?? cursorColumn;

				if (startLine === endLine) {
					const startCol = Math.min(anchorCol, cursorColumn);
					const endCol = Math.max(anchorCol, cursorColumn);
					return col >= startCol && col <= endCol;
				}
				if (lineNum === startLine) {
					const isAnchorStart = anchorLine < cursorLine;
					return isAnchorStart ? col >= anchorCol : col >= cursorColumn;
				}
				if (lineNum === endLine) {
					const isAnchorEnd = anchorLine > cursorLine;
					return isAnchorEnd ? col <= anchorCol : col <= cursorColumn;
				}
				return true;
			}

			if (mode.subtype === "block") {
				if (lineNum < startLine || lineNum > endLine) return false;
				const anchorCol = visualAnchorColumn ?? cursorColumn;
				const startCol = Math.min(anchorCol, cursorColumn);
				const endCol = Math.max(anchorCol, cursorColumn);
				return col >= startCol && col <= endCol;
			}

			return false;
		};

		for (let i = 0; i < editorHeight; i++) {
			const lineNum = scrollTop + i;
			const line = Buffer.getLine(bufferState, lineNum);
			if (line !== undefined) {
				// Strip any remaining CR/LF characters
				const lineText = line.replace(/\r/g, "").replace(/\n/g, "");
				// Split using spread to handle surrogate pairs and combined characters mostly correct
				const chars = [...lineText];
				const segments: React.ReactNode[] = [];

				const lineHighlights = highlights.filter(
					(h) => h.start.line <= lineNum && h.end.line >= lineNum,
				);

				let currentSpan = "";
				let currentFg: string | undefined;
				let currentBg: string | undefined;
				let currentKey = 0;

				const pushSpan = () => {
					if (currentSpan.length > 0) {
						segments.push(
							<span key={currentKey++} bg={currentBg} fg={currentFg}>
								{currentSpan}
							</span>,
						);
						currentSpan = "";
					}
				};

				for (let col = 0; col < editorWidth; col++) {
					const char = chars[col] || " ";
					const isCursor =
						isActive && lineNum === cursorLine && col === cursorColumn;
					const isSelected = isInVisualSelection(lineNum, col);

					let fg = colors.fg;
					const h = lineHighlights.find((h) => {
						if (h.start.line < lineNum && h.end.line > lineNum) return true;

						if (h.start.line === lineNum && h.end.line === lineNum) {
							return col >= h.start.column && col < h.end.column;
						}
						if (h.start.line === lineNum) {
							return col >= h.start.column;
						}
						if (h.end.line === lineNum) {
							return col < h.end.column;
						}
						return false;
					});

					if (h) {
						const baseCapture = h.capture.split(".")[0] || "";
						fg =
							captureColors[h.capture] ||
							captureColors[baseCapture] ||
							colors.fg;
					}

					let bg: string | undefined;
					let finalFg = fg;

					if (isCursor) {
						const cursorStyle = getCursorStyle();
						if (cursorStyle === "block") {
							bg = getCursorBg();
							finalFg = colors.bg;
						} else {
							// For line cursor, we render it separately or as part of char
							// But here we'll simplify for now to block style logic or similar
							// Actually, original logic split char for line cursor "|" + char
							// We can't group easily with line cursor inside.
							// So we flush and render cursor specially.
							pushSpan();
							segments.push(
								<span key={currentKey++}>
									<span bg={getCursorBg()} fg={getCursorBg()}>
										|
									</span>
									<span
										bg={isSelected ? colors.selection : undefined}
										fg={isSelected ? colors.fg : finalFg}
									>
										{char}
									</span>
								</span>,
							);
							currentSpan = "";
							currentBg = undefined;
							currentFg = undefined;
							continue;
						}
					}

					if (isSelected) {
						bg = colors.selection;
						finalFg = colors.fg;
					}

					// Grouping logic
					if (bg !== currentBg || finalFg !== currentFg) {
						pushSpan();
						currentBg = bg;
						currentFg = finalFg;
					}
					currentSpan += char;
				}
				pushSpan();

				result.push(<text key={lineNum}>{segments}</text>);
			} else {
				result.push(
					<text key={lineNum} fg={colors.muted}>
						{"~".padEnd(editorWidth, " ")}
					</text>,
				);
			}
		}
		return result;
	}, [
		colors, // Added dependency
		bufferState,
		scrollTop,
		editorHeight,
		editorWidth,
		highlights,
		cursorLine,
		cursorColumn,
		mode,
		isActive,
		visualAnchorLine,
		visualAnchorColumn,
	]);

	return (
		<box
			flexDirection="row"
			style={{
				width,
				height,
				backgroundColor: isActive ? colors.bg : colors.surface, // Used surface for inactive
			}}
		>
			<box
				flexDirection="column"
				style={{
					width: Options.opt.number ? gutterWidth : 0,
					backgroundColor: colors.bg,
				}}
			>
				{Options.opt.number &&
					Array.from({ length: editorHeight }).map((_, i) => {
						const lineNum = scrollTop + i;
						const isCurrentLine = lineNum === cursorLine;
						const isValidLine = lineNum < Buffer.lineCount(bufferState);
						let displayNum: string;
						if (!isValidLine) {
							displayNum = " ~";
						} else if (Options.opt.relativenumber && !isCurrentLine) {
							const relativeNum = Math.abs(lineNum - cursorLine);
							displayNum = String(relativeNum).padStart(gutterWidth - 1, " ");
						} else {
							displayNum = String(lineNum + 1).padStart(gutterWidth - 1, " ");
						}
						return (
							<text
								key={`gutter-${lineNum}`}
								fg={isCurrentLine ? colors.activeLineNumber : colors.lineNumber}
								bg={isCurrentLine ? colors.surface : colors.bg}
							>
								{displayNum}{" "}
							</text>
						);
					})}
			</box>

			<box flexDirection="column" flexGrow={1}>
				{lines}
			</box>
		</box>
	);
}
