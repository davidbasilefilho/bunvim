import { Data } from "effect";

export class FileReadError extends Data.TaggedError("FileReadError")<{
	readonly path: string;
	readonly cause: unknown;
}> {}

export class FileWriteError extends Data.TaggedError("FileWriteError")<{
	readonly path: string;
	readonly cause: unknown;
}> {}

export class BufferError extends Data.TaggedError("BufferError")<{
	readonly message: string;
	readonly offset?: number;
	readonly line?: number;
	readonly column?: number;
}> {}

export class PositionError extends Data.TaggedError("PositionError")<{
	readonly message: string;
	readonly line?: number;
	readonly column?: number;
}> {}

export class InvalidRangeError extends Data.TaggedError("InvalidRangeError")<{
	readonly message: string;
}> {}

export class RopeError extends Data.TaggedError("RopeError")<{
	readonly message: string;
	readonly offset?: number;
}> {}
