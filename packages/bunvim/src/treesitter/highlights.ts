import { Effect } from "effect";
import { isTreeSitterAvailable } from "./parser";
import { queries } from "./queries";
import type { TreeSitterLanguage, TreeSitterTree } from "./types";

export type HighlightRange = {
	start: { line: number; column: number };
	end: { line: number; column: number };
	capture: string;
};

export const getHighlights = (
	tree: TreeSitterTree,
	language: TreeSitterLanguage,
	languageName: string,
	queryStr?: string,
) =>
	Effect.gen(function* (_) {
		if (!isTreeSitterAvailable() || !tree || !language) {
			return [] as HighlightRange[];
		}

		return yield* _(
			Effect.try({
				try: () => {
					const finalQueryStr = queryStr || queries[languageName];
					if (!finalQueryStr) {
						return [] as HighlightRange[];
					}

					if (!language.query) {
						return [] as HighlightRange[];
					}
					const query = language.query(finalQueryStr);
					if (!query || !query.captures) {
						return [] as HighlightRange[];
					}
					const captures = query.captures(tree.rootNode);
					return captures.map((c) => ({
						start: {
							line: c.node.startPosition.row,
							column: c.node.startPosition.column,
						},
						end: {
							line: c.node.endPosition.row,
							column: c.node.endPosition.column,
						},
						capture: c.name,
					})) as HighlightRange[];
				},
				catch: (_e) => {
					return [] as HighlightRange[];
				},
			}),
		);
	});
