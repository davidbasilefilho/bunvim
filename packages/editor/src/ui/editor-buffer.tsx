import type { BufferState, HighlightRange, Mode } from "@bunvim/sdk";
import { getColors } from "@bunvim/sdk";
import { createMemo, For, Show } from "solid-js";

interface EditorBufferProps {
	bufferState: BufferState;
	cursorLine: number;
	cursorColumn: number;
	scrollTop: number;
	width: number;
	height: number;
	mode: Mode;
	visualAnchorLine: number;
	visualAnchorColumn: number;
	isActive: boolean;
	gutterWidth: number;
	highlights?: HighlightRange[];
}

export function EditorBuffer(props: EditorBufferProps) {
	const colors = createMemo(() => getColors());

	const lines = createMemo(() => {
		const text = props.bufferState.rope.content;
		return text
			.split("\n")
			.slice(props.scrollTop, props.scrollTop + props.height);
	});

	const isInVisualSelection = (lineNum: number, col: number): boolean => {
		if (props.mode.type !== "visual") return false;

		const startLine = Math.min(props.visualAnchorLine, props.cursorLine);
		const endLine = Math.max(props.visualAnchorLine, props.cursorLine);

		if (lineNum < startLine || lineNum > endLine) return false;

		if (props.mode.subtype === "line") return true;

		if (startLine === endLine) {
			const startCol = Math.min(props.visualAnchorColumn, props.cursorColumn);
			const endCol = Math.max(props.visualAnchorColumn, props.cursorColumn);
			return col >= startCol && col <= endCol;
		}

		if (lineNum === startLine) {
			return (
				col >=
				(props.visualAnchorLine < props.cursorLine
					? props.visualAnchorColumn
					: props.cursorColumn)
			);
		}
		if (lineNum === endLine) {
			return (
				col <=
				(props.visualAnchorLine > props.cursorLine
					? props.visualAnchorColumn
					: props.cursorColumn)
			);
		}
		return true;
	};

	return (
		<box flexDirection="column" flexGrow={1}>
			<For each={lines()}>
				{(line, idx) => {
					const lineNum = props.scrollTop + idx();
					const isCurrentLine = lineNum === props.cursorLine;
					const lineNumberStr = String(lineNum + 1).padStart(3, " ");

					return (
						<box flexDirection="row" key={lineNum}>
							<Show when={props.gutterWidth > 0}>
								<text
									fg={
										isCurrentLine
											? colors().activeLineNumber
											: colors().lineNumber
									}
									bg={isCurrentLine ? colors().surface : colors().bg}
									style={{ width: props.gutterWidth }}
								>
									{lineNumberStr}
								</text>
							</Show>
							<box flexGrow={1} flexDirection="row">
								<For each={line.split("")}>
									{(char, colIdx) => {
										const isCursor =
											isCurrentLine &&
											colIdx() === props.cursorColumn &&
											props.isActive;
										const inVisual =
											props.mode.type === "visual" &&
											isInVisualSelection(lineNum, colIdx());
										const bg = isCursor
											? colors().cursor
											: inVisual
												? colors().selection
												: colors().bg;
										const fg = isCursor ? colors().bg : colors().fg;

										return (
											<text key={colIdx()} bg={bg} fg={fg}>
												{char === "\t" ? "  " : char}
											</text>
										);
									}}
								</For>
							</box>
						</box>
					);
				}}
			</For>
		</box>
	);
}
