import { Effect, Ref } from "effect";
import { BufferError } from "../effect/errors";
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

export type BufferState = {
	readonly id: BufferId;
	readonly rope: Rope.Rope;
	readonly modified: boolean;
	readonly version: number;
	readonly props: BufferProps;
};

export type BufferChange = {
	readonly range: Range;
	readonly text: string;
	readonly version: number;
};

let nextBufferId = 1;
const bufferRegistry = new Map<BufferId, BufferState>();
const fileBufferPaths = new Map<string, BufferId>();

export const createState = (
	content: string,
	props: Partial<BufferProps> = {},
): BufferState => {
	const id = nextBufferId++;
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

	bufferRegistry.set(id, state);

	if (fullProps.type === "file" && fullProps.path) {
		fileBufferPaths.set(fullProps.path, id);
	}

	return state;
};

export const emptyState = (props: Partial<BufferProps> = {}): BufferState =>
	createState("", props);

export const getBufferForFile = (path: string): BufferState | undefined => {
	const id = fileBufferPaths.get(path);
	return id !== undefined ? bufferRegistry.get(id) : undefined;
};

export const getOrCreateFileBuffer = (
	path: string,
	content: string,
): BufferState => {
	const existing = getBufferForFile(path);
	if (existing) return existing;
	return createState(content, {
		type: "file",
		path,
		name: path.split("/").pop(),
	});
};

export const getAllBuffers = (): BufferState[] =>
	Array.from(bufferRegistry.values());

export const getListedBuffers = (): BufferState[] =>
	getAllBuffers().filter((b) => b.props.listed);

export const getBuffer = (id: BufferId): BufferState | undefined =>
	bufferRegistry.get(id);

export const removeBuffer = (id: BufferId): boolean => {
	const buf = bufferRegistry.get(id);
	if (!buf) return false;

	if (buf.props.type === "file" && buf.props.path) {
		fileBufferPaths.delete(buf.props.path);
	}

	return bufferRegistry.delete(id);
};

export const updateBufferState = (
	id: BufferId,
	updater: (state: BufferState) => BufferState,
): BufferState | undefined => {
	const current = bufferRegistry.get(id);
	if (!current) return undefined;
	const updated = updater(current);
	bufferRegistry.set(id, updated);
	return updated;
};

export const lineCount = (state: BufferState): number =>
	Rope.lineCount(state.rope);

export const byteLength = (str: string): number =>
	Buffer.byteLength(str, "utf8");

export const getLine = (
	state: BufferState,
	lineNumber: number,
): string | undefined => Rope.getLine(state.rope, lineNumber);

export const getLineLength = (
	state: BufferState,
	lineNumber: number,
): number | undefined => Rope.getLineLength(state.rope, lineNumber);

export const getText = (state: BufferState): string => Rope.getText(state.rope);

export const getTextInRange = (
	state: BufferState,
	range: Range,
): string | undefined => {
	const startOffset = Rope.positionToOffset(state.rope, range.start);
	const endOffset = Rope.positionToOffset(state.rope, range.end);
	if (startOffset === undefined || endOffset === undefined) {
		return undefined;
	}
	return Rope.slice(state.rope, startOffset, endOffset);
};

export const offsetToPosition = (
	state: BufferState,
	offset: number,
): Position | undefined => Rope.offsetToPosition(state.rope, offset);

export const positionToOffset = (
	state: BufferState,
	pos: Position,
): number | undefined => Rope.positionToOffset(state.rope, pos);

export const insertAt = (
	state: BufferState,
	pos: Position,
	text: string,
): BufferState | undefined => {
	const offset = Rope.positionToOffset(state.rope, pos);
	if (offset === undefined) return undefined;

	const updated: BufferState = {
		...state,
		rope: Rope.insert(state.rope, offset, text),
		modified: true,
		version: state.version + 1,
	};

	bufferRegistry.set(state.id, updated);
	return updated;
};

export const deleteInRange = (
	state: BufferState,
	range: Range,
): BufferState | undefined => {
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

	bufferRegistry.set(state.id, updated);
	return updated;
};

export const replaceInRange = (
	state: BufferState,
	range: Range,
	text: string,
): BufferState | undefined => {
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

	bufferRegistry.set(state.id, updated);
	return updated;
};

export type Buffer = {
	readonly state: Ref.Ref<BufferState>;
};

export const create = (
	content: string,
	props: Partial<BufferProps> = {},
): Effect.Effect<Buffer, never, never> =>
	Effect.gen(function* () {
		const state = yield* Ref.make(createState(content, props));
		return { state };
	});

export const createEmpty = (
	props: Partial<BufferProps> = {},
): Effect.Effect<Buffer, never, never> =>
	Effect.gen(function* () {
		const state = yield* Ref.make(emptyState(props));
		return { state };
	});

export const getState = (buffer: Buffer): Effect.Effect<BufferState> =>
	Ref.get(buffer.state);

export const insert = (
	buffer: Buffer,
	pos: Position,
	text: string,
): Effect.Effect<BufferChange, BufferError> =>
	Effect.gen(function* () {
		const current = yield* Ref.get(buffer.state);
		const newState = insertAt(current, pos, text);
		if (newState === undefined) {
			return yield* Effect.fail(
				new BufferError({
					message: "Invalid position for insert",
					line: pos.line,
					column: pos.column,
				}),
			);
		}
		yield* Ref.set(buffer.state, newState);
		return {
			range: { start: pos, end: pos },
			text,
			version: newState.version,
		};
	});

export const remove = (
	buffer: Buffer,
	range: Range,
): Effect.Effect<BufferChange, BufferError> =>
	Effect.gen(function* () {
		const current = yield* Ref.get(buffer.state);
		const deletedText = getTextInRange(current, range) ?? "";
		const newState = deleteInRange(current, range);
		if (newState === undefined) {
			return yield* Effect.fail(
				new BufferError({ message: "Invalid range for delete" }),
			);
		}
		yield* Ref.set(buffer.state, newState);
		return {
			range,
			text: deletedText,
			version: newState.version,
		};
	});

export const replace = (
	buffer: Buffer,
	range: Range,
	text: string,
): Effect.Effect<BufferChange, BufferError> =>
	Effect.gen(function* () {
		const current = yield* Ref.get(buffer.state);
		const newState = replaceInRange(current, range, text);
		if (newState === undefined) {
			return yield* Effect.fail(
				new BufferError({ message: "Invalid range for replace" }),
			);
		}
		yield* Ref.set(buffer.state, newState);
		return {
			range,
			text,
			version: newState.version,
		};
	});

export const markSaved = (buffer: Buffer): Effect.Effect<void> =>
	Ref.update(buffer.state, (s) => {
		const updated = { ...s, modified: false };
		bufferRegistry.set(s.id, updated);
		return updated;
	});

export const isModified = (buffer: Buffer): Effect.Effect<boolean> =>
	Effect.map(Ref.get(buffer.state), (s) => s.modified);
