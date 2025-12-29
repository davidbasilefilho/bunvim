import type React from "react";
import { useMemo } from "react";
import * as Options from "../api/options";
import * as Buffer from "../core/buffer";
import type * as Keymap from "../keybindings/keymap";
import type { HighlightRange } from "../treesitter/highlights";

type PaneProps = {
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

const CAPTURE_COLORS: Record<string, string> = {
	keyword: "#bb9af7",
	string: "#9ece6a",
	comment: "#565f89",
	function: "#7aa2f7",
	variable: "#c0caf5",
	type: "#2ac3de",
	constant: "#ff9e64",
	number: "#ff9e64",
	operator: "#89ddff",
	property: "#7aa2f7",
	parameter: "#e0af68",
	label: "#7aa2f7",
	"variable.builtin": "#bb9af7",
	"variable.parameter": "#e0af68",
	"function.builtin": "#7aa2f7",
	"function.call": "#7aa2f7",
	"punctuation.bracket": "#89ddff",
	"punctuation.delimiter": "#89ddff",
	tag: "#bb9af7",
	attribute: "#bb9af7",
	namespace: "#2ac3de",
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
	const editorWidth = width - gutterWidth - 1;
	const editorHeight = height;

	const lines = useMemo(() => {
		const result = [];

		const getCursorStyle = (): "block" | "line" => {
			if (mode.type === "insert" || mode.type === "command") {
				return Options.opt.cursorStyle;
			}
			return "block";
		};

		const getCursorBg = (): string => {
			if (mode.type === "insert") return "#9ece6a";
			if (mode.type === "visual") return "#bb9af7";
			if (mode.type === "command" || mode.type === "search") return "#ff9e64";
			if (mode.type === "operator-pending") return "#e0af68";
			return "#7aa2f7";
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
				const lineText = line.replace(/\n$/, "");
				const chars = lineText.split("");
				const segments: React.ReactNode[] = [];

				const lineHighlights = highlights.filter(
					(h) => h.start.line <= lineNum && h.end.line >= lineNum,
				);

				for (let col = 0; col < editorWidth; col++) {
					const char = chars[col] || " ";
					const isCursor =
						isActive && lineNum === cursorLine && col === cursorColumn;
					const isSelected = isInVisualSelection(lineNum, col);

					let fg = "#ffffff";
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
							CAPTURE_COLORS[h.capture] ||
							CAPTURE_COLORS[baseCapture] ||
							"#ffffff";
					}

					if (isCursor) {
						const cursorStyle = getCursorStyle();
						if (cursorStyle === "block") {
							segments.push(
								<span key={col} bg={getCursorBg()} fg="#1a1b26">
									{char}
								</span>,
							);
						} else {
							segments.push(
								<span key={col}>
									<span bg={getCursorBg()} fg={getCursorBg()}>
										|
									</span>
									<span
										bg={isSelected ? "#33467c" : undefined}
										fg={isSelected ? "#c0caf5" : fg}
									>
										{char}
									</span>
								</span>,
							);
						}
					} else {
						segments.push(
							<span
								key={col}
								bg={isSelected ? "#33467c" : undefined}
								fg={isSelected ? "#c0caf5" : fg}
							>
								{char}
							</span>,
						);
					}
				}
				result.push(<text key={lineNum}>{segments}</text>);
			} else {
				result.push(
					<text key={lineNum} fg="#3b4261">
						{"~".padEnd(editorWidth, " ")}
					</text>,
				);
			}
		}
		return result;
	}, [
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
				backgroundColor: isActive ? "#1a1b26" : "#16161e",
			}}
		>
			<box
				flexDirection="column"
				style={{
					width: Options.opt.number ? gutterWidth : 0,
					backgroundColor: "#1a1b26",
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
								fg={isCurrentLine ? "#c0caf5" : "#3b4261"}
								bg={isCurrentLine ? "#292e42" : "#1a1b26"}
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
