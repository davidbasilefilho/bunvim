import { Effect } from "effect";
import * as Buffer from "../core/buffer";
import * as Document from "../core/document";

export class FileIOError extends Error {
	readonly _tag = "FileIOError";
}

export function write(docId: number, path?: string) {
	return Effect.gen(function* () {
		const doc = Document.get(docId);
		if (!doc) return;

		const targetPath = path || doc.path;
		if (!targetPath) {
			return yield* Effect.fail(new FileIOError("No file name"));
		}

		const content = Buffer.getText(doc.buffer);
		yield* Effect.tryPromise({
			try: () => Bun.write(targetPath, content),
			catch: (e) => new FileIOError(String(e)),
		});

		doc.dirty = false;
	});
}

export function edit(path: string) {
	return Effect.gen(function* () {
		const file = Bun.file(path);
		const content = yield* Effect.tryPromise({
			try: () => file.text(),
			catch: (e) => new FileIOError(String(e)),
		});

		return Document.create(content, path);
	});
}
