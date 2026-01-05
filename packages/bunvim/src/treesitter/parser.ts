import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Data, Effect } from "effect";
import * as dirs from "../api/dirs";
import type { BufferChange } from "../core/buffer";
import * as Buffer from "../core/buffer";
import { logSync } from "../utils/logger";
import { runCommand } from "../utils/shell";
import type {
	TreeSitterEdit,
	TreeSitterLanguage,
	TreeSitterParser,
	TreeSitterQuery,
	TreeSitterTree,
} from "./types";

export class TreesitterError extends Data.TaggedError("TreesitterError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

type ParserModule = {
	new (): TreeSitterParser;
	Query: new (language: TreeSitterLanguage, source: string) => TreeSitterQuery;
};

const isParserModule = (m: unknown): m is ParserModule => {
	return typeof m === "function" && "Query" in m;
};

let ParserClass: ParserModule | null = null;
let parser: TreeSitterParser | null = null;
let initAttempted = false;

const initParser = async (): Promise<boolean> => {
	if (initAttempted) return !!ParserClass;
	initAttempted = true;

	try {
		const mod = await import("tree-sitter");
		if (isParserModule(mod.default)) {
			ParserClass = mod.default;
			logSync.debug("TreeSitter initialized from project dependencies");
			return true;
		}
	} catch (e) {
		logSync.debug("tree-sitter not available via direct import", e);
	}

	// Try to load from ~/.cache/bvim/grammars/node_modules/tree-sitter first
	try {
		const pkgPath = path.join(dirs.grammars, "node_modules", "tree-sitter");

		if (!existsSync(pkgPath)) {
			logSync.info("Downloading tree-sitter core...");

			const pkgJson = path.join(dirs.grammars, "package.json");
			if (!existsSync(pkgJson)) {
				await Effect.runPromise(
					runCommand("bun init -y", { cwd: dirs.grammars }),
				);
			}

			await Effect.runPromise(
				runCommand("bun add --trust tree-sitter", {
					cwd: dirs.grammars,
					env: { CXXFLAGS: "-fexceptions" },
				}),
			);
			logSync.info("Downloaded tree-sitter core");
		}

		// Use createRequire to bypass VFS restrictions in bundled app
		const grammarRequire = createRequire(
			path.join(dirs.grammars, "package.json"),
		);
		const mod = grammarRequire(pkgPath);
		const candidate = mod.default || mod;
		if (isParserModule(candidate)) {
			ParserClass = candidate;
			logSync.debug("TreeSitter initialized from dynamic path");
			return true;
		}
		logSync.warn(
			"Failed to load tree-sitter from dynamic path: invalid module shape",
		);
		return false;
	} catch (e) {
		logSync.warn("Failed to load tree-sitter from dynamic path", e);
		return false;
	}
};

export const isTreeSitterAvailable = (): boolean => {
	return !!ParserClass;
};

export const ensureTreeSitter = async (): Promise<boolean> => {
	return initParser();
};

export const getParser = (): TreeSitterParser | undefined => {
	if (!ParserClass) {
		return undefined;
	}
	if (!parser) {
		try {
			parser = new ParserClass();
		} catch {
			return undefined;
		}
	}
	return parser;
};

export const createQuery = (
	language: TreeSitterLanguage,
	source: string,
): TreeSitterQuery | undefined => {
	if (!ParserClass) {
		return undefined;
	}
	try {
		return new ParserClass.Query(language, source);
	} catch (e) {
		logSync.error("Failed to create tree-sitter query", e);
		return undefined;
	}
};

export const applyEdits = (
	tree: TreeSitterTree,
	changes: BufferChange[],
	oldBuffer: Buffer.BufferState,
): void => {
	for (const change of changes) {
		const startIndex =
			Buffer.positionToOffset(oldBuffer, change.range.start) ?? 0;
		const oldEndIndex =
			Buffer.positionToOffset(oldBuffer, change.range.end) ?? 0;
		const newEndIndex = startIndex + change.text.length;

		const startPosition = {
			row: change.range.start.line,
			column: change.range.start.column,
		};
		const oldEndPosition = {
			row: change.range.end.line,
			column: change.range.end.column,
		};

		const lines = change.text.split("\n");
		const newEndRow = startPosition.row + lines.length - 1;
		const newEndColumn =
			lines.length === 1
				? startPosition.column + (lines[0]?.length ?? 0)
				: (lines[lines.length - 1]?.length ?? 0);

		const newEndPosition = {
			row: newEndRow,
			column: newEndColumn,
		};

		const edit: TreeSitterEdit = {
			startIndex,
			oldEndIndex,
			newEndIndex,
			startPosition,
			oldEndPosition,
			newEndPosition,
		};

		tree.edit(edit);
	}
};

export const parse = (
	content: string,
	language: TreeSitterLanguage,
	oldTree?: TreeSitterTree,
) =>
	Effect.gen(function* (_) {
		if (!isTreeSitterAvailable()) {
			logSync.error("TreeSitter not available during parse");
			return yield* _(
				Effect.fail(
					new TreesitterError({ message: "tree-sitter not available" }),
				),
			);
		}

		const p = getParser();
		if (!p) {
			logSync.error("Failed to get parser instance");
			return yield* _(
				Effect.fail(
					new TreesitterError({ message: "Failed to create parser" }),
				),
			);
		}

		return yield* _(
			Effect.try({
				try: () => {
					p.setLanguage(language);
					return p.parse(content, oldTree);
				},
				catch: (e) => {
					logSync.error("Parser exception", e);
					return new TreesitterError({
						message: "Failed to parse content",
						cause: e,
					});
				},
			}),
		);
	});
