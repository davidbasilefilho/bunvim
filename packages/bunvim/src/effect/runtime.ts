import { Context, Effect, Layer, ManagedRuntime } from "effect";
import type { FileReadError, FileWriteError } from "./errors";

/**
 * File system service for reading and writing files.
 * All operations are wrapped in Effect for proper error handling.
 *
 * @example
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const fs = yield* FileSystem
 *   const content = yield* fs.readText("file.txt")
 *   yield* fs.writeText("output.txt", content)
 * })
 * ```
 */
export class FileSystem extends Context.Tag("FileSystem")<
	FileSystem,
	{
		readonly readText: (path: string) => Effect.Effect<string, FileReadError>;
		readonly writeText: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileWriteError>;
		readonly exists: (path: string) => Effect.Effect<boolean>;
	}
>() {}

/**
 * Live implementation of FileSystem using Bun APIs.
 */
export const FileSystemLive = Layer.succeed(FileSystem, {
	readText: (path: string) =>
		Effect.tryPromise({
			try: () => Bun.file(path).text(),
			catch: (cause) => {
				const { FileReadError } = require("./errors");
				return new FileReadError({ path, cause });
			},
		}),

	writeText: (path: string, content: string) =>
		Effect.tryPromise({
			try: async () => {
				await Bun.write(path, content);
			},
			catch: (cause) => {
				const { FileWriteError } = require("./errors");
				return new FileWriteError({ path, cause });
			},
		}),

	exists: (path: string) =>
		Effect.sync(() => {
			const file = Bun.file(path);
			return file.size > 0;
		}),
});

/**
 * Default layer combining all core services.
 */
export const DefaultLayer = Layer.mergeAll(FileSystemLive);

/**
 * Managed runtime for the editor.
 * Use this to run effects from external contexts (React components, event handlers).
 *
 * @example
 * ```typescript
 * const content = await EditorRuntime.runPromise(
 *   Effect.gen(function* () {
 *     const fs = yield* FileSystem
 *     return yield* fs.readText("file.txt")
 *   })
 * )
 * ```
 */
export const EditorRuntime = ManagedRuntime.make(DefaultLayer);

/**
 * Run an effect using the default editor runtime.
 * Convenience wrapper around EditorRuntime.runPromise.
 *
 * @example
 * ```typescript
 * const content = await runEffect(
 *   Effect.gen(function* () {
 *     const fs = yield* FileSystem
 *     return yield* fs.readText("file.txt")
 *   })
 * )
 * ```
 */
export const runEffect = <A, E>(
	effect: Effect.Effect<A, E, FileSystem>,
): Promise<A> => EditorRuntime.runPromise(effect);

/**
 * Run an effect synchronously using the default editor runtime.
 * Only use for effects that don't perform async operations.
 */
export const runEffectSync = <A, E>(
	effect: Effect.Effect<A, E, FileSystem>,
): A => EditorRuntime.runSync(effect);
