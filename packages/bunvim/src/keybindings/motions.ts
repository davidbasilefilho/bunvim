import * as Buffer from "../core/buffer";
import type { Position } from "../utils/position";

export type MotionResult = {
	readonly position: Position;
	readonly inclusive: boolean;
	readonly linewise: boolean;
};

export type MotionFn = (
	buffer: Buffer.BufferState,
	pos: Position,
	count: number,
) => MotionResult;

const result = (
	line: number,
	column: number,
	inclusive = false,
	linewise = false,
): MotionResult => ({
	position: { line, column },
	inclusive,
	linewise,
});

const clampLine = (buffer: Buffer.BufferState, line: number): number =>
	Math.max(0, Math.min(line, Buffer.lineCount(buffer) - 1));

const clampColumn = (
	buffer: Buffer.BufferState,
	line: number,
	column: number,
): number => {
	const lineLen = Buffer.getLineLength(buffer, line) ?? 0;
	return Math.max(0, Math.min(column, Math.max(0, lineLen - 1)));
};

const getLineLength = (buffer: Buffer.BufferState, line: number): number =>
	Buffer.getLineLength(buffer, line) ?? 0;

const getLineText = (buffer: Buffer.BufferState, line: number): string =>
	Buffer.getLine(buffer, line) ?? "";

const isWordChar = (c: string): boolean => /\w/.test(c);
const isWhitespace = (c: string): boolean => /\s/.test(c);
const isWORDChar = (c: string): boolean => !isWhitespace(c);

const charAt = (s: string, i: number): string => s[i] ?? "";

export const left: MotionFn = (_buffer, pos, count) => {
	const newCol = Math.max(0, pos.column - count);
	return result(pos.line, newCol);
};

export const right: MotionFn = (buffer, pos, count) => {
	const lineLen = getLineLength(buffer, pos.line);
	const maxCol = Math.max(0, lineLen - 1);
	const newCol = Math.min(maxCol, pos.column + count);
	return result(pos.line, newCol);
};

export const up: MotionFn = (buffer, pos, count) => {
	const newLine = clampLine(buffer, pos.line - count);
	const newCol = clampColumn(buffer, newLine, pos.column);
	return result(newLine, newCol, false, true);
};

export const down: MotionFn = (buffer, pos, count) => {
	const newLine = clampLine(buffer, pos.line + count);
	const newCol = clampColumn(buffer, newLine, pos.column);
	return result(newLine, newCol, false, true);
};

export const lineStart: MotionFn = (_buffer, pos, _count) => {
	return result(pos.line, 0);
};

export const lineEnd: MotionFn = (buffer, pos, _count) => {
	const lineLen = getLineLength(buffer, pos.line);
	return result(pos.line, Math.max(0, lineLen - 1), true);
};

export const firstNonBlank: MotionFn = (buffer, pos, _count) => {
	const line = getLineText(buffer, pos.line);
	let col = 0;
	while (col < line.length && isWhitespace(charAt(line, col))) col++;
	return result(pos.line, Math.min(col, Math.max(0, line.length - 1)));
};

export const fileStart: MotionFn = (_buffer, _pos, _count) => {
	return result(0, 0, false, true);
};

export const fileEnd: MotionFn = (buffer, _pos, count) => {
	const targetLine =
		count > 1 ? clampLine(buffer, count - 1) : Buffer.lineCount(buffer) - 1;
	return result(targetLine, 0, false, true);
};

export const goToLine: MotionFn = (buffer, _pos, count) => {
	const targetLine = clampLine(buffer, count - 1);
	return result(targetLine, 0, false, true);
};

const findWordBoundary = (
	buffer: Buffer.BufferState,
	startLine: number,
	startCol: number,
	count: number,
	direction: 1 | -1,
	wordType: "word" | "WORD",
	boundaryType: "start" | "end",
): Position => {
	let line = startLine;
	let col = startCol;
	let remaining = count;
	const isWordCharFn = wordType === "word" ? isWordChar : isWORDChar;

	while (remaining > 0) {
		const lineText = getLineText(buffer, line);

		if (direction === 1) {
			if (boundaryType === "start") {
				while (col < lineText.length && isWordCharFn(charAt(lineText, col)))
					col++;
				while (col < lineText.length && !isWordCharFn(charAt(lineText, col)))
					col++;

				if (col >= lineText.length) {
					if (line < Buffer.lineCount(buffer) - 1) {
						line++;
						col = 0;
						continue;
					}
					break;
				}
				remaining--;
			} else {
				col++;
				while (col < lineText.length && !isWordCharFn(charAt(lineText, col)))
					col++;
				while (
					col < lineText.length - 1 &&
					isWordCharFn(charAt(lineText, col + 1))
				)
					col++;

				if (col >= lineText.length) {
					if (line < Buffer.lineCount(buffer) - 1) {
						line++;
						col = 0;
						continue;
					}
					break;
				}
				remaining--;
			}
		} else {
			if (boundaryType === "start") {
				col--;
				while (col > 0 && !isWordCharFn(charAt(lineText, col))) col--;
				while (col > 0 && isWordCharFn(charAt(lineText, col - 1))) col--;

				if (col <= 0 && line > 0) {
					line--;
					col = getLineLength(buffer, line);
					continue;
				}
				remaining--;
			} else {
				col--;
				while (col > 0 && !isWordCharFn(charAt(lineText, col))) col--;

				if (col <= 0 && line > 0) {
					line--;
					col = getLineLength(buffer, line);
					continue;
				}
				remaining--;
			}
		}
	}

	return { line, column: Math.max(0, col) };
};

export const wordForward: MotionFn = (buffer, pos, count) => {
	const newPos = findWordBoundary(
		buffer,
		pos.line,
		pos.column,
		count,
		1,
		"word",
		"start",
	);
	return result(newPos.line, newPos.column);
};

export const wordBackward: MotionFn = (buffer, pos, count) => {
	const newPos = findWordBoundary(
		buffer,
		pos.line,
		pos.column,
		count,
		-1,
		"word",
		"start",
	);
	return result(newPos.line, newPos.column);
};

export const wordEnd: MotionFn = (buffer, pos, count) => {
	const newPos = findWordBoundary(
		buffer,
		pos.line,
		pos.column,
		count,
		1,
		"word",
		"end",
	);
	return result(newPos.line, newPos.column, true);
};

export const WORDForward: MotionFn = (buffer, pos, count) => {
	const newPos = findWordBoundary(
		buffer,
		pos.line,
		pos.column,
		count,
		1,
		"WORD",
		"start",
	);
	return result(newPos.line, newPos.column);
};

export const WORDBackward: MotionFn = (buffer, pos, count) => {
	const newPos = findWordBoundary(
		buffer,
		pos.line,
		pos.column,
		count,
		-1,
		"WORD",
		"start",
	);
	return result(newPos.line, newPos.column);
};

export const WORDEnd: MotionFn = (buffer, pos, count) => {
	const newPos = findWordBoundary(
		buffer,
		pos.line,
		pos.column,
		count,
		1,
		"WORD",
		"end",
	);
	return result(newPos.line, newPos.column, true);
};

export const findChar = (
	char: string,
	direction: "forward" | "backward",
	stopBefore: boolean,
): MotionFn => {
	return (buffer, pos, count) => {
		const line = getLineText(buffer, pos.line);
		let col = pos.column;
		let found = 0;

		if (direction === "forward") {
			for (let i = pos.column + 1; i < line.length; i++) {
				if (line[i] === char) {
					found++;
					if (found === count) {
						col = stopBefore ? i - 1 : i;
						break;
					}
				}
			}
		} else {
			for (let i = pos.column - 1; i >= 0; i--) {
				if (line[i] === char) {
					found++;
					if (found === count) {
						col = stopBefore ? i + 1 : i;
						break;
					}
				}
			}
		}

		return result(pos.line, col, direction === "forward" && !stopBefore);
	};
};

export const paragraphForward: MotionFn = (buffer, pos, count) => {
	let line = pos.line;
	let remaining = count;
	const totalLines = Buffer.lineCount(buffer);
	let inBlank = getLineText(buffer, line).trim() === "";

	while (remaining > 0 && line < totalLines - 1) {
		line++;
		const lineText = getLineText(buffer, line).trim();
		const isBlank = lineText === "";

		if (inBlank && !isBlank) {
			inBlank = false;
		} else if (!inBlank && isBlank) {
			inBlank = true;
			remaining--;
		}
	}

	return result(line, 0, false, true);
};

export const paragraphBackward: MotionFn = (buffer, pos, count) => {
	let line = pos.line;
	let remaining = count;
	let inBlank = getLineText(buffer, line).trim() === "";

	while (remaining > 0 && line > 0) {
		line--;
		const lineText = getLineText(buffer, line).trim();
		const isBlank = lineText === "";

		if (inBlank && !isBlank) {
			inBlank = false;
		} else if (!inBlank && isBlank) {
			inBlank = true;
			remaining--;
		}
	}

	return result(line, 0, false, true);
};

export const motionRegistry: Record<string, MotionFn> = {
	h: left,
	l: right,
	j: down,
	k: up,
	"0": lineStart,
	$: lineEnd,
	"^": firstNonBlank,
	gg: fileStart,
	G: fileEnd,
	w: wordForward,
	b: wordBackward,
	e: wordEnd,
	W: WORDForward,
	B: WORDBackward,
	E: WORDEnd,
	"{": paragraphBackward,
	"}": paragraphForward,
};

export const executeMotion = (
	name: string,
	buffer: Buffer.BufferState,
	pos: Position,
	count: number,
): MotionResult | undefined => {
	const motion = motionRegistry[name];
	if (!motion) return undefined;
	return motion(buffer, pos, count);
};
