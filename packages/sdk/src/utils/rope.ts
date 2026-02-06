import type { Position } from "./position";

export type Rope = {
	readonly content: string;
	readonly lineStarts: readonly number[];
};

/**
 * Create an empty rope.
 */
export const empty = (): Rope => ({
	content: "",
	lineStarts: [0],
});

/**
 * Create a rope from a string.
 */
export const fromString = (text: string): Rope => ({
	content: text,
	lineStarts: computeLineStarts(text),
});

/**
 * Get the total length of the rope in characters.
 */
export const length = (rope: Rope): number => rope.content.length;

/**
 * Get the number of lines in the rope.
 */
export const lineCount = (rope: Rope): number => rope.lineStarts.length;

/**
 * Get the text content of a specific line (0-indexed, without newline).
 */
export const getLine = (rope: Rope, lineNumber: number): string | undefined => {
	if (lineNumber < 0 || lineNumber >= rope.lineStarts.length) {
		return undefined;
	}
	const start = rope.lineStarts[lineNumber];
	if (start === undefined) return undefined;

	const nextLineStart = rope.lineStarts[lineNumber + 1];
	const end =
		nextLineStart !== undefined ? nextLineStart - 1 : rope.content.length;
	const charAtEnd = end < rope.content.length ? rope.content[end] : undefined;
	const lineEnd = charAtEnd === "\n" ? end : end + 1;
	return rope.content.slice(start, Math.min(lineEnd, rope.content.length));
};

/**
 * Get the length of a specific line (excluding newline).
 */
export const getLineLength = (
	rope: Rope,
	lineNumber: number,
): number | undefined => {
	const line = getLine(rope, lineNumber);
	if (line === undefined) return undefined;
	return line.endsWith("\n") ? line.length - 1 : line.length;
};

/**
 * Convert a character offset to a line/column position.
 */
export const offsetToPosition = (
	rope: Rope,
	offset: number,
): Position | undefined => {
	if (offset < 0 || offset > rope.content.length) {
		return undefined;
	}

	let line = 0;
	for (let i = 1; i < rope.lineStarts.length; i++) {
		const lineStart = rope.lineStarts[i];
		if (lineStart === undefined || lineStart > offset) break;
		line = i;
	}

	const currentLineStart = rope.lineStarts[line];
	if (currentLineStart === undefined) return undefined;

	const column = offset - currentLineStart;
	return { line, column };
};

/**
 * Convert a line/column position to a character offset.
 */
export const positionToOffset = (
	rope: Rope,
	pos: Position,
): number | undefined => {
	if (pos.line < 0 || pos.line >= rope.lineStarts.length) {
		return undefined;
	}
	if (pos.column < 0) {
		return undefined;
	}

	const lineStart = rope.lineStarts[pos.line];
	if (lineStart === undefined) return undefined;

	const nextLineStart = rope.lineStarts[pos.line + 1];
	const lineEnd =
		nextLineStart !== undefined ? nextLineStart : rope.content.length;

	const offset = lineStart + pos.column;
	if (offset > lineEnd) {
		return undefined;
	}

	return Math.min(offset, rope.content.length);
};

/**
 * Insert text at the given offset.
 */
export const insert = (rope: Rope, offset: number, text: string): Rope => {
	if (offset < 0 || offset > rope.content.length) {
		return rope;
	}

	const newContent =
		rope.content.slice(0, offset) + text + rope.content.slice(offset);
	return fromString(newContent);
};

/**
 * Delete text between start and end offsets.
 */
export const deleteRange = (rope: Rope, start: number, end: number): Rope => {
	if (start < 0 || end > rope.content.length || start > end) {
		return rope;
	}

	const newContent = rope.content.slice(0, start) + rope.content.slice(end);
	return fromString(newContent);
};

/**
 * Replace text between start and end offsets with new text.
 */
export const replace = (
	rope: Rope,
	start: number,
	end: number,
	text: string,
): Rope => {
	if (start < 0 || end > rope.content.length || start > end) {
		return rope;
	}

	const newContent =
		rope.content.slice(0, start) + text + rope.content.slice(end);
	return fromString(newContent);
};

/**
 * Get a substring from the rope.
 */
export const slice = (rope: Rope, start: number, end?: number): string =>
	rope.content.slice(start, end);

/**
 * Get the full text content.
 */
export const getText = (rope: Rope): string => rope.content;

const computeLineStarts = (text: string): number[] => {
	const starts: number[] = [0];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === "\n") {
			starts.push(i + 1);
		}
	}
	return starts;
};
