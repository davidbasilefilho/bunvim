import { Data } from "effect";
import * as Buffer from "../stores/bufferStore";
import type { Range } from "../utils/position";

export type Edit =
	| { type: "insert"; pos: { line: number; column: number }; text: string }
	| { type: "delete"; range: Range; text: string };

export type UndoNode = {
	readonly id: number;
	readonly parent?: number;
	children: number[];
	readonly edits: Edit[];
	readonly timestamp: number;
};

export class UndoError extends Data.TaggedError("UndoError")<{
	readonly message: string;
}> {}

let nextNodeId = 1;
const nodes: Map<number, UndoNode> = new Map();
let currentNodeId = 0;

export function init() {
	const root: UndoNode = {
		id: 0,
		children: [],
		edits: [],
		timestamp: Date.now(),
	};
	nodes.set(0, root);
	currentNodeId = 0;
	nextNodeId = 1;
}

export function addEntry(edits: Edit[]) {
	const id = nextNodeId++;
	const node: UndoNode = {
		id,
		parent: currentNodeId,
		children: [],
		edits,
		timestamp: Date.now(),
	};

	const parent = nodes.get(currentNodeId);
	if (parent) {
		parent.children.push(id);
	}

	nodes.set(id, node);
	currentNodeId = id;
}

export function undo(
	buffer: Buffer.BufferState,
): Buffer.BufferState | undefined {
	const current = nodes.get(currentNodeId);
	if (!current || current.parent === undefined) return undefined;

	let newState = buffer;
	for (let i = current.edits.length - 1; i >= 0; i--) {
		const edit = current.edits[i];
		if (!edit) continue;
		if (edit.type === "insert") {
			const end = {
				line: edit.pos.line,
				column: edit.pos.column + edit.text.length,
			};
			newState =
				Buffer.deleteInRange(newState, { start: edit.pos, end }) ?? newState;
		} else {
			newState =
				Buffer.insertAt(newState, edit.range.start, edit.text) ?? newState;
		}
	}

	currentNodeId = current.parent;
	return newState;
}

export function redo(
	buffer: Buffer.BufferState,
): Buffer.BufferState | undefined {
	const current = nodes.get(currentNodeId);
	if (!current || current.children.length === 0) return undefined;

	const nextId = current.children[current.children.length - 1];
	if (nextId === undefined) return undefined;
	const next = nodes.get(nextId);
	if (!next) return undefined;

	let newState = buffer;
	for (const edit of next.edits) {
		if (edit.type === "insert") {
			newState = Buffer.insertAt(newState, edit.pos, edit.text) ?? newState;
		} else {
			newState = Buffer.deleteInRange(newState, edit.range) ?? newState;
		}
	}

	currentNodeId = nextId;
	return newState;
}

export function getCurrentNode(): UndoNode | undefined {
	return nodes.get(currentNodeId);
}

export function getNode(id: number): UndoNode | undefined {
	return nodes.get(id);
}
