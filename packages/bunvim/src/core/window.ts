import type { Position } from "../utils/position";

export type WindowId = number;

export type Window = {
	readonly id: WindowId;
	buf: number;
	cursor: Position;
	scrollTop: number;
	width: number;
	height: number;
};

let nextWindowId = 1;
const windows: Map<WindowId, Window> = new Map();

export function create(buf: number): Window {
	const id = nextWindowId++;
	const win: Window = {
		id,
		buf,
		cursor: { line: 0, column: 0 },
		scrollTop: 0,
		width: 80,
		height: 24,
	};
	windows.set(id, win);
	return win;
}

export function get(id: WindowId): Window | undefined {
	return windows.get(id);
}

export function getAll(): Window[] {
	return Array.from(windows.values());
}

export function remove(id: WindowId) {
	windows.delete(id);
}
