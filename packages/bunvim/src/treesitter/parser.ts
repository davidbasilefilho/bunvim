import { Data, Effect } from "effect";
import type {
	TreeSitterLanguage,
	TreeSitterModule,
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

export const parse = (content: string, language: TreeSitterLanguage) =>
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
					return p.parse(content);
				},
				catch: (e) =>
					new TreesitterError({ message: "Failed to parse content", cause: e }),
			}),
		);
	});
