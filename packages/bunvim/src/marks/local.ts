export type LocalMark = {
	line: number;
	column: number;
};

export type GlobalMark = {
	bufferId: number;
	line: number;
	column: number;
};

const localMarks: Map<number, Map<string, LocalMark>> = new Map();
const globalMarks: Map<string, GlobalMark> = new Map();

function isLocalMark(char: string): boolean {
	return char >= "a" && char <= "z";
}

function isGlobalMark(char: string): boolean {
	return char >= "A" && char <= "Z";
}

export function setMark(
	char: string,
	bufferId: number,
	line: number,
	column: number,
): boolean {
	if (isLocalMark(char)) {
		let bufferMarks = localMarks.get(bufferId);
		if (!bufferMarks) {
			bufferMarks = new Map();
			localMarks.set(bufferId, bufferMarks);
		}
		bufferMarks.set(char, { line, column });
		return true;
	}

	if (isGlobalMark(char)) {
		globalMarks.set(char, { bufferId, line, column });
		return true;
	}

	return false;
}

export function getMark(
	char: string,
	bufferId: number,
): { bufferId: number; line: number; column: number } | null {
	if (isLocalMark(char)) {
		const bufferMarks = localMarks.get(bufferId);
		if (!bufferMarks) return null;
		const mark = bufferMarks.get(char);
		if (!mark) return null;
		return { bufferId, line: mark.line, column: mark.column };
	}

	if (isGlobalMark(char)) {
		const mark = globalMarks.get(char);
		if (!mark) return null;
		return mark;
	}

	return null;
}

export function getBufferMarks(bufferId: number): Map<string, LocalMark> {
	return localMarks.get(bufferId) ?? new Map();
}

export function getAllGlobalMarks(): Map<string, GlobalMark> {
	return new Map(globalMarks);
}

export function deleteMark(char: string, bufferId: number): boolean {
	if (isLocalMark(char)) {
		const bufferMarks = localMarks.get(bufferId);
		if (!bufferMarks) return false;
		return bufferMarks.delete(char);
	}

	if (isGlobalMark(char)) {
		return globalMarks.delete(char);
	}

	return false;
}

export function clearBufferMarks(bufferId: number): void {
	localMarks.delete(bufferId);
}
