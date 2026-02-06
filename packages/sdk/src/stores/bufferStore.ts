import { createStore } from "solid-js/store";
import type { Position, Range } from "../utils/position";
import * as Rope from "../utils/rope";

export type BufferId = number;

export type BufferType = "file" | "scratch" | "terminal" | "help" | "quickfix";

export interface BufferProps {
	type: BufferType;
	name?: string;
	path?: string;
	readonly?: boolean;
	scratch?: boolean;
	listed?: boolean;
}

export interface BufferState {
	readonly id: BufferId;
	readonly rope: Rope.Rope;
	readonly modified: boolean;
	readonly version: number;
	readonly props: BufferProps;
}

interface BufferStoreState {
	buffers: BufferState[];
	fileBufferPaths: Map<string, BufferId>;
	nextBufferId: number;
}

const [bufferStore, setBufferStore] = createStore<BufferStoreState>({
	buffers: [],
	fileBufferPaths: new Map(),
	nextBufferId: 1,
});

const bufferRegistry = new Map<BufferId, BufferState>();

export function createState(
	content: string,
	props: Partial<BufferProps> = {},
): BufferState {
	const id = bufferStore.nextBufferId;
	const fullProps: BufferProps = {
		type: props.type ?? "scratch",
		name: props.name,
		path: props.path,
		readonly: props.readonly ?? false,
		scratch: props.scratch ?? props.type !== "file",
		listed: props.listed ?? true,
	};

	const state: BufferState = {
		id,
		rope: Rope.fromString(content),
		modified: false,
		version: 0,
		props: fullProps,
	};

	setBufferStore({
		buffers: [...bufferStore.buffers, state],
		nextBufferId: id + 1,
	});

	if (fullProps.type === "file" && fullProps.path) {
		setBufferStore("fileBufferPaths", (paths) => {
			const newPaths = new Map(paths);
			newPaths.set(fullProps.path!, id);
			return newPaths;
		});
	}

	bufferRegistry.set(id, state);
	return state;
}

export function emptyState(props: Partial<BufferProps> = {}): BufferState {
	return createState("", props);
}

export function getBufferForFile(path: string): BufferState | undefined {
	const id = bufferStore.fileBufferPaths.get(path);
	return id !== undefined
		? bufferStore.buffers.find((b) => b.id === id)
		: undefined;
}

export function getOrCreateFileBuffer(
	path: string,
	content: string,
): BufferState {
	const existing = getBufferForFile(path);
	if (existing) return existing;
	return createState(content, {
		type: "file",
		path,
		name: path.split("/").pop(),
	});
}

export function getAllBuffers(): BufferState[] {
	return bufferStore.buffers;
}

export function getListedBuffers(): BufferState[] {
	return bufferStore.buffers.filter((b) => b.props.listed);
}

export function getBuffer(id: BufferId): BufferState | undefined {
	return bufferStore.buffers.find((b) => b.id === id);
}

export function removeBuffer(id: BufferId): boolean {
	const buf = getBuffer(id);
	if (!buf) return false;

	if (buf.props.type === "file" && buf.props.path) {
		setBufferStore("fileBufferPaths", (paths) => {
			const newPaths = new Map(paths);
			newPaths.delete(buf.props.path!);
			return newPaths;
		});
	}

	setBufferStore(
		"buffers",
		bufferStore.buffers.filter((b) => b.id !== id),
	);
	bufferRegistry.delete(id);
	return true;
}

export function updateBufferState(
	id: BufferId,
	updater: (state: BufferState) => BufferState,
): BufferState | undefined {
	const current = getBuffer(id);
	if (!current) return undefined;
	const updated = updater(current);
	setBufferStore(
		"buffers",
		bufferStore.buffers.map((b) => (b.id === id ? updated : b)),
	);
	bufferRegistry.set(id, updated);
	return updated;
}

export function lineCount(state: BufferState): number {
	return Rope.lineCount(state.rope);
}

export function byteLength(str: string): number {
	return Buffer.byteLength(str, "utf8");
}

export function getLine(
	state: BufferState,
	lineNumber: number,
): string | undefined {
	return Rope.getLine(state.rope, lineNumber);
}

export function getLineLength(
	state: BufferState,
	lineNumber: number,
): number | undefined {
	return Rope.getLineLength(state.rope, lineNumber);
}

export function getText(state: BufferState): string {
	return Rope.getText(state.rope);
}

export function getTextInRange(
	state: BufferState,
	range: Range,
): string | undefined {
	const startOffset = Rope.positionToOffset(state.rope, range.start);
	const endOffset = Rope.positionToOffset(state.rope, range.end);
	if (startOffset === undefined || endOffset === undefined) {
		return undefined;
	}
	return Rope.slice(state.rope, startOffset, endOffset);
}

export function offsetToPosition(
	state: BufferState,
	offset: number,
): Position | undefined {
	return Rope.offsetToPosition(state.rope, offset);
}

export function positionToOffset(
	state: BufferState,
	pos: Position,
): number | undefined {
	return Rope.positionToOffset(state.rope, pos);
}

export function insertAt(
	state: BufferState,
	pos: Position,
	text: string,
): BufferState | undefined {
	const offset = Rope.positionToOffset(state.rope, pos);
	if (offset === undefined) return undefined;

	const updated: BufferState = {
		...state,
		rope: Rope.insert(state.rope, offset, text),
		modified: true,
		version: state.version + 1,
	};

	return updated;
}

export function deleteInRange(
	state: BufferState,
	range: Range,
): BufferState | undefined {
	const startOffset = Rope.positionToOffset(state.rope, range.start);
	const endOffset = Rope.positionToOffset(state.rope, range.end);
	if (startOffset === undefined || endOffset === undefined) {
		return undefined;
	}

	const updated: BufferState = {
		...state,
		rope: Rope.deleteRange(state.rope, startOffset, endOffset),
		modified: true,
		version: state.version + 1,
	};

	return updated;
}

export function replaceInRange(
	state: BufferState,
	range: Range,
	text: string,
): BufferState | undefined {
	const startOffset = Rope.positionToOffset(state.rope, range.start);
	const endOffset = Rope.positionToOffset(state.rope, range.end);
	if (startOffset === undefined || endOffset === undefined) {
		return undefined;
	}

	const updated: BufferState = {
		...state,
		rope: Rope.replace(state.rope, startOffset, endOffset, text),
		modified: true,
		version: state.version + 1,
	};

	return updated;
}

export function markSaved(id: BufferId): void {
	updateBufferState(id, (s) => {
		const updated = { ...s, modified: false };
		bufferRegistry.set(s.id, updated);
		return updated;
	});
}

export function isModified(id: BufferId): boolean {
	const buf = getBuffer(id);
	return buf?.modified ?? false;
}

export { bufferStore, setBufferStore };
