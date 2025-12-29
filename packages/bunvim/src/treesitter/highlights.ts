import { Effect } from "effect";
import { isTreeSitterAvailable } from "./parser";

export type HighlightRange = {
	start: { line: number; column: number };
	end: { line: number; column: number };
	capture: string;
};

export const getHighlights = (
	tree: unknown,
	language: unknown,
	queryStr: string,
) =>
	Effect.gen(function* (_) {
		if (!isTreeSitterAvailable() || !tree || !language) {
			return [] as HighlightRange[];
		}

		return yield* _(
			Effect.try({
				try: () => {
					if (!language.query) {
						return [] as HighlightRange[];
					}
					const query = language.query(queryStr);
					if (!query || !query.captures) {
						return [] as HighlightRange[];
					}
					const captures = query.captures(tree.rootNode);
					return captures.map((c: unknown) => ({
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
				catch: () => [] as HighlightRange[],
			}),
		);
	});
