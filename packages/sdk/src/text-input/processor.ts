/** State for text input operations */
export interface TextInputState {
	text: string;
	cursorLine: number;
	cursorColumn: number;
}

/** Actions for text input processing */
export type TextInputAction =
	| { type: "insert"; char: string }
	| { type: "backspace" }
	| { type: "newline" };

/**
 * Strip ANSI escape sequences from a string.
 * Matches sequences starting with ESC (\x1b) followed by control sequences.
 */
const stripAnsiSequences = (str: string): string => {
	const ansiPattern =
		/\x1b\[[\d;]*[A-Za-z]|\x1b\][\d;]*\x07|\x1b\[[\d;]*m|\x1b\[?[\d;]*[A-Za-z]/g;
	return str.replace(ansiPattern, "");
};

/**
 * Get the offset in the string for a given line and column.
 * Handles UTF-16 surrogate pairs correctly.
 */
const getOffsetAtPosition = (
	text: string,
	line: number,
	column: number,
): number => {
	const lines = text.split("\n");
	if (line < 0 || line >= lines.length) return -1;

	let offset = 0;
	for (let i = 0; i < line; i++) {
		offset += lines[i].length + 1;
	}

	const targetLine = lines[line];
	const safeColumn = Math.min(column, targetLine.length);

	return offset + safeColumn;
};

/**
 * Get line and column from a string offset.
 * Handles UTF-16 surrogate pairs correctly.
 */
const getPositionAtOffset = (
	text: string,
	offset: number,
): { line: number; column: number } => {
	if (offset <= 0) return { line: 0, column: 0 };
	if (offset >= text.length) {
		const lines = text.split("\n");
		const lastLineIndex = lines.length - 1;
		return { line: lastLineIndex, column: lines[lastLineIndex].length };
	}

	let currentOffset = 0;
	const lines = text.split("\n");

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const lineLength = lines[lineIndex].length;
		const lineEndOffset = currentOffset + lineLength;

		if (offset <= lineEndOffset) {
			return { line: lineIndex, column: offset - currentOffset };
		}

		currentOffset = lineEndOffset + 1;
	}

	const lastLineIndex = lines.length - 1;
	return { line: lastLineIndex, column: lines[lastLineIndex].length };
};

/**
 * Process a text input action and return new state.
 * Returns null if the action cannot be performed (e.g., backspace at start).
 */
export function processTextInput(
	state: TextInputState,
	action: TextInputAction,
): TextInputState | null {
	const { text, cursorLine, cursorColumn } = state;
	const lines = text.split("\n");

	switch (action.type) {
		case "insert": {
			const char = action.char;
			const offset = getOffsetAtPosition(text, cursorLine, cursorColumn);

			if (offset === -1) return null;

			const newText = text.slice(0, offset) + char + text.slice(offset);
			const newPosition = getPositionAtOffset(newText, offset + char.length);

			return {
				text: newText,
				cursorLine: newPosition.line,
				cursorColumn: newPosition.column,
			};
		}

		case "backspace": {
			if (cursorLine === 0 && cursorColumn === 0) {
				return null;
			}

			const offset = getOffsetAtPosition(text, cursorLine, cursorColumn);
			if (offset <= 0) return null;

			const newText = text.slice(0, offset - 1) + text.slice(offset);
			const newPosition = getPositionAtOffset(newText, offset - 1);

			return {
				text: newText,
				cursorLine: newPosition.line,
				cursorColumn: newPosition.column,
			};
		}

		case "newline": {
			const offset = getOffsetAtPosition(text, cursorLine, cursorColumn);
			if (offset === -1) return null;

			const newText = text.slice(0, offset) + "\n" + text.slice(offset);

			return {
				text: newText,
				cursorLine: cursorLine + 1,
				cursorColumn: 0,
			};
		}

		default:
			return null;
	}
}

/**
 * Normalize pasted content - convert bytes to string, strip ANSI sequences.
 * Used when handling paste events.
 */
export function normalizePasteContent(bytes: Uint8Array): string {
	const decoder = new TextDecoder("utf-8", { fatal: false });
	let text = decoder.decode(bytes);

	text = stripAnsiSequences(text);

	text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return text;
}

/**
 * Calculate the cursor position after inserting text at a given position.
 */
export function calculateCursorAfterInsert(
	text: string,
	line: number,
	column: number,
	insertedText: string,
): { line: number; column: number } {
	const insertedLines = insertedText.split("\n");
	const lineCount = insertedLines.length;

	if (lineCount === 1) {
		return {
			line,
			column: column + insertedText.length,
		};
	}

	const lastLineLength = insertedLines[lineCount - 1].length;

	return {
		line: line + lineCount - 1,
		column: lastLineLength,
	};
}
