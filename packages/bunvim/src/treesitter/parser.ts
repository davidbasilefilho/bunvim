import { Data, Effect } from "effect";
import type { BufferChange } from "../core/buffer";
import * as Buffer from "../core/buffer";
import type {
	TreeSitterEdit,
	TreeSitterLanguage,
	TreeSitterParser,
	TreeSitterTree,
} from "./types";

export class TreesitterError extends Data.TaggedError("TreesitterError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

let Parser: { new (): TreeSitterParser } | null = null;
let parser: TreeSitterParser | null = null;
let treeSitterAvailable: boolean | null = null;

const initTreeSitter = (): boolean => {
	if (treeSitterAvailable !== null) return treeSitterAvailable;

	try {
		Parser = require("tree-sitter");
		treeSitterAvailable = true;
	} catch {
		Parser = null;
		treeSitterAvailable = false;
	}
	return treeSitterAvailable;
};

export const isTreeSitterAvailable = (): boolean => {
	if (treeSitterAvailable !== null) return treeSitterAvailable;
	return initTreeSitter();
};

export const getParser = (): TreeSitterParser | undefined => {
	if (!isTreeSitterAvailable() || !Parser) {
		return undefined;
	}
	if (!parser) {
		try {
			parser = new Parser();
		} catch {
			treeSitterAvailable = false;
			return undefined;
		}
	}
	return parser;
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
			return yield* _(
				Effect.fail(
					new TreesitterError({ message: "tree-sitter not available" }),
				),
			);
		}

		const p = getParser();
		if (!p) {
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
				catch: (e) =>
					new TreesitterError({ message: "Failed to parse content", cause: e }),
			}),
		);
	});
