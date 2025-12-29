import { spawn } from "node:child_process";
import { Data, Effect } from "effect";
import { JSONRPCEndpoint, LspClient } from "ts-lsp-client";

export class LspError extends Data.TaggedError("LspError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export interface LspClientState {
	readonly client: LspClient;
	readonly serverName: string;
}

export type HoverResult = {
	contents: string;
	range?: {
		start: { line: number; character: number };
		end: { line: number; character: number };
	};
};

export function createClient(
	serverPath: string,
	args: string[] = [],
): Effect.Effect<LspClientState, LspError> {
	return Effect.gen(function* (_) {
		try {
			const child = spawn(serverPath, args);
			if (!child.stdin || !child.stdout) {
				return yield* _(
					Effect.fail(
						new LspError({
							message: "Failed to spawn LSP process: missing stdin/stdout",
						}),
					),
				);
			}
			const endpoint = new JSONRPCEndpoint(child.stdin, child.stdout);
			const client = new LspClient(endpoint);

			yield* _(
				Effect.tryPromise({
					try: () =>
						client.initialize({
							processId: process.pid,
							rootUri: null,
							capabilities: {},
						}),
					catch: (e) =>
						new LspError({ message: "Failed to initialize LSP", cause: e }),
				}),
			);
			return { client, serverName: serverPath };
		} catch (e) {
			return yield* _(
				Effect.fail(
					new LspError({ message: "Failed to create LSP client", cause: e }),
				),
			);
		}
	});
}

export function hover(
	state: LspClientState,
	uri: string,
	line: number,
	character: number,
): Effect.Effect<HoverResult | null, LspError> {
	return Effect.tryPromise({
		try: async () => {
			const result = await state.client.hover({
				textDocument: { uri },
				position: { line, character },
			});
			if (!result) return null;

			let contents = "";
			if (typeof result.contents === "string") {
				contents = result.contents;
			} else if ("value" in result.contents) {
				contents = result.contents.value;
			} else if (Array.isArray(result.contents)) {
				contents = result.contents
					.map((c) => (typeof c === "string" ? c : c.value))
					.join("\n\n");
			}

			return {
				contents,
				range: result.range,
			};
		},
		catch: (e) => new LspError({ message: "Hover request failed", cause: e }),
	});
}

export type DefinitionResult = {
	uri: string;
	line: number;
	character: number;
};

export function definition(
	state: LspClientState,
	uri: string,
	line: number,
	character: number,
): Effect.Effect<DefinitionResult | null, LspError> {
	return Effect.tryPromise({
		try: async () => {
			const result = await state.client.definition({
				textDocument: { uri },
				position: { line, character },
			});
			if (!result) return null;

			const location = Array.isArray(result) ? result[0] : result;
			if (!location) return null;

			const locUri = "uri" in location ? location.uri : location.targetUri;
			const range = "range" in location ? location.range : location.targetRange;

			return {
				uri: locUri,
				line: range.start.line,
				character: range.start.character,
			};
		},
		catch: (e) =>
			new LspError({ message: "Definition request failed", cause: e }),
	});
}

export function shutdown(state: LspClientState): Effect.Effect<void, LspError> {
	return Effect.tryPromise({
		try: () => state.client.shutdown(),
		catch: (e) => new LspError({ message: "Failed to shutdown LSP", cause: e }),
	});
}
