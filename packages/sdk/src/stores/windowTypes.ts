import type { Position } from "../utils/position";

export type WindowId = number;

export interface WindowState {
	readonly id: WindowId;
	bufId: number;
	bufferIds: number[];
	split?: "h" | "v";
	cursor: Position;
	scrollTop: number;
	scrollLeft: number;
	width: number;
	height: number;
}
