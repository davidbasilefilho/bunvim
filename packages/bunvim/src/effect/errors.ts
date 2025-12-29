import { Data } from "effect";

/**
 * Error thrown when a file read operation fails.
 *
 * @example
 * ```typescript
 * Effect.tryPromise({
 *   try: () => Bun.file(path).text(),
 *   catch: (cause) => new FileReadError({ path, cause })
 * })
 * ```
 */
export class FileReadError extends Data.TaggedError("FileReadError")<{
	readonly path: string;
	readonly cause: unknown;
}> {}

/**
 * Error thrown when a file write operation fails.
 *
 * @example
 * ```typescript
 * Effect.tryPromise({
 *   try: () => Bun.write(path, content),
 *   catch: (cause) => new FileWriteError({ path, cause })
 * })
 * ```
 */
export class FileWriteError extends Data.TaggedError("FileWriteError")<{
	readonly path: string;
	readonly cause: unknown;
}> {}

/**
 * Error thrown when a buffer operation is invalid.
 *
 * @example
 * ```typescript
 * if (offset < 0 || offset > buffer.length) {
 *   return Effect.fail(new BufferError({ message: "Offset out of bounds", offset }))
 * }
 * ```
 */
export class BufferError extends Data.TaggedError("BufferError")<{
	readonly message: string;
	readonly offset?: number;
	readonly line?: number;
	readonly column?: number;
}> {}

/**
 * Error thrown when a position is invalid.
 *
 * @example
 * ```typescript
 * if (position.line < 0) {
 *   return Effect.fail(new PositionError({ message: "Line must be non-negative", position }))
 * }
 * ```
 */
export class PositionError extends Data.TaggedError("PositionError")<{
	readonly message: string;
	readonly line?: number;
	readonly column?: number;
}> {}

/**
 * Error thrown when a range is invalid.
 */
export class InvalidRangeError extends Data.TaggedError("InvalidRangeError")<{
	readonly message: string;
}> {}

/**
 * Error thrown when rope operations fail.
 */
export class RopeError extends Data.TaggedError("RopeError")<{
	readonly message: string;
	readonly offset?: number;
}> {}
