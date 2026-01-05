import type React from "react";
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
	scrollLeft?: number;
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
	scrollLeft = 0,
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

	const lines = (() => {
		const captureColors: Record<string, string> = {
			keyword: colors.keyword,
			string: colors.string,
			comment: colors.comment,
			function: colors.function,
			variable: colors.variable,
			type: colors.type,
			constant: colors.constant,
			number: colors.constant,
			operator: colors.operator,
			property: colors.property,
			parameter: colors.parameter,
			label: colors.keyword,
			"variable.builtin": colors.match,
			"variable.parameter": colors.parameter,
			"function.builtin": colors.function,
			"function.call": colors.function,
			"punctuation.bracket": colors.keyword,
			"punctuation.delimiter": colors.keyword,
			tag: colors.keyword,
			attribute: colors.variable,
			namespace: colors.type,
		};

		const result: React.ReactNode[] = [];

		const getCursorStyle = (): "block" | "line" => {
			if (mode.type === "insert" || mode.type === "command") {
				return Options.opt.cursorStyle;
			}
			return "block";
		};

		const getCursorBg = (): string => {
			if (mode.type === "insert") {
				return colors.success;
			}
			if (mode.type === "visual") {
				return colors.selection;
			}
			if (mode.type === "command" || mode.type === "search") {
				return colors.warning;
			}
			if (mode.type === "operator-pending") {
				return colors.warning;
			}
			return colors.cursor;
		};

		const isInVisualSelection = (lineNum: number, col: number): boolean => {
			if (mode.type !== "visual") {
				return false;
			}

			const startLine = Math.min(visualAnchorLine ?? cursorLine, cursorLine);
			const endLine = Math.max(visualAnchorLine ?? cursorLine, cursorLine);

			if (mode.subtype === "line") {
				return lineNum >= startLine && lineNum <= endLine;
			}

			if (mode.subtype === "char") {
				if (lineNum < startLine || lineNum > endLine) {
					return false;
				}
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
				if (lineNum < startLine || lineNum > endLine) {
					return false;
				}
				const anchorCol = visualAnchorColumn ?? cursorColumn;
				const startCol = Math.min(anchorCol, cursorColumn);
				const endCol = Math.max(anchorCol, cursorColumn);
				return col >= startCol && col <= endCol;
			}

			return false;
		};

		const tabSize = Options.opt.tabstop;

		for (let i = 0; i < editorHeight; i++) {
			const lineNum = scrollTop + i;
			const line = Buffer.getLine(bufferState, lineNum);

			if (line !== undefined) {
				const lineText = line.replace(/\r/g, "").replace(/\n/g, "");
				const chars = [...lineText];
				const segments: React.ReactNode[] = [];

				const lineHighlights = highlights.filter(
					(h) => h.start.line <= lineNum && h.end.line >= lineNum,
				);

				let visualIdx = 0;
				let byteIdx = 0;
				let currentSpan = "";
				let currentFg: string | undefined;
				let currentBg: string | undefined;
				let currentKey = 0;

				const pushSpan = () => {
					if (currentSpan.length > 0) {
						segments.push(
							<text key={currentKey++} bg={currentBg} fg={currentFg}>
								{currentSpan}
							</text>,
						);
						currentSpan = "";
					}
				};

				for (let bufIdx = 0; bufIdx < chars.length; bufIdx++) {
					const char = chars[bufIdx] || "";
					const charWidth = char === "\t" ? tabSize : 1;
					const charBytes = Buffer.byteLength(char);
					const charStartVisual = visualIdx;
					const charEndVisual = visualIdx + charWidth;
					const charStartByte = byteIdx;
					visualIdx += charWidth;
					byteIdx += charBytes;

					if (charEndVisual <= scrollLeft) {
						continue;
					}
					if (charStartVisual >= scrollLeft + editorWidth) {
						break;
					}

					let fg = colors.fg;
					const highlight = lineHighlights.find((h) => {
						if (h.start.line < lineNum && h.end.line > lineNum) {
							return true;
						}

						if (h.start.line === lineNum && h.end.line === lineNum) {
							return (
								charStartByte >= h.start.column && charStartByte < h.end.column
							);
						}
						if (h.start.line === lineNum) {
							return charStartByte >= h.start.column;
						}
						if (h.end.line === lineNum) {
							return charStartByte < h.end.column;
						}
						return false;
					});

					if (highlight) {
						const baseCapture = highlight.capture.split(".")[0] || "";
						fg =
							captureColors[highlight.capture] ||
							captureColors[baseCapture] ||
							colors.fg;
					}

					let bg: string | undefined;
					let finalFg = fg;

					const isCursor =
						isActive && lineNum === cursorLine && bufIdx === cursorColumn;
					const isSelected = isInVisualSelection(lineNum, bufIdx);

					if (isCursor) {
						const cursorStyle = getCursorStyle();
						if (cursorStyle === "block") {
							bg = getCursorBg();
							finalFg = colors.bg;
						} else {
							pushSpan();
							let cursorChar = char || " ";
							if (charStartVisual < scrollLeft) {
								cursorChar = cursorChar.slice(scrollLeft - charStartVisual);
							}

							segments.push(
								<text key={currentKey++}>
									<text bg={getCursorBg()} fg={getCursorBg()}>
										|
									</text>
									<text
										bg={isSelected ? colors.selection : undefined}
										fg={isSelected ? colors.fg : finalFg}
									>
										{cursorChar}
									</text>
								</text>,
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

					let displayChar = char === "\t" ? " ".repeat(charWidth) : char;

					if (charStartVisual < scrollLeft) {
						displayChar = displayChar.slice(scrollLeft - charStartVisual);
					}
					const remainingWidth = scrollLeft + editorWidth - charStartVisual;
					if (displayChar.length > remainingWidth) {
						displayChar = displayChar.slice(0, remainingWidth);
					}

					if (bg !== currentBg || finalFg !== currentFg) {
						pushSpan();
						currentBg = bg;
						currentFg = finalFg;
					}
					if (displayChar) {
						currentSpan += displayChar;
					} else if (isCursor) {
						currentSpan += " ";
					}
				}

				if (
					isActive &&
					lineNum === cursorLine &&
					cursorColumn === chars.length
				) {
					if (visualIdx >= scrollLeft && visualIdx < scrollLeft + editorWidth) {
						const cursorStyle = getCursorStyle();
						if (cursorStyle === "block") {
							pushSpan();
							segments.push(
								<text key={currentKey++} bg={getCursorBg()} fg={colors.bg}>
									{" "}
								</text>,
							);
						} else {
							pushSpan();
							segments.push(
								<text key={currentKey++} bg={getCursorBg()} fg={getCursorBg()}>
									|
								</text>,
							);
						}
					}
				}

				pushSpan();

				if (segments.length === 0) {
					segments.push(<text key="empty"> </text>);
				}

				result.push(
					<box key={lineNum} flexDirection="row" height={1}>
						{segments}
					</box>,
				);
			} else {
				result.push(
					<text key={lineNum} fg={colors.muted}>
						{"~".padEnd(editorWidth, " ")}
					</text>,
				);
			}
		}
		return result;
	})();

	return (
		<box
			flexDirection="row"
			style={{
				width,
				height,
				backgroundColor: isActive ? colors.bg : colors.surface,
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
