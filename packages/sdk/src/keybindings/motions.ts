import type { WindowId, WindowState } from "../stores/windowTypes";
import type { Position } from "../utils/position";

export type MotionResult = {
	readonly position: Position;
	readonly inclusive: boolean;
	readonly linewise: boolean;
};

export type MotionFn = (
	buffer: import("../stores/bufferStore").BufferState,
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
