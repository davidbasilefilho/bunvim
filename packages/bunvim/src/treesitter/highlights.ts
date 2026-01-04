import { Effect } from "effect";
import { logSync } from "../utils/logger";
import { createQuery, isTreeSitterAvailable } from "./parser";
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
			logSync.warn(
				`Highlight skipped: TS available=${isTreeSitterAvailable()}, tree=${!!tree}, lang=${!!language}`,
			);
			return [] as HighlightRange[];
		}

		return yield* _(
			Effect.try({
				try: () => {
					const finalQueryStr = queryStr || queries[languageName];
					if (!finalQueryStr) {
						logSync.warn(`No query found for language: ${languageName}`);
						return [] as HighlightRange[];
					}

					const query = createQuery(language, finalQueryStr);
					if (!query || !query.captures) {
						logSync.warn("Query creation failed or no captures method");
						return [] as HighlightRange[];
					}
					const captures = query.captures(tree.rootNode);
					logSync.debug(
						`Highlights found: ${captures.length} for ${languageName}`,
					);
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
				catch: (e) => {
					logSync.error("Highlighting exception", e);
					throw e;
				},
			}),
		);
	});
