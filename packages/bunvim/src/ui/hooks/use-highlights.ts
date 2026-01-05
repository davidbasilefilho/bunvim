import { Effect } from "effect";
import { useEffect, useRef } from "react";
import { vim } from "../../api/vim";
import * as Buffer from "../../core/buffer";
import { detectLanguage, getGrammar } from "../../treesitter/grammars";
import type { HighlightRange } from "../../treesitter/highlights";
import { getHighlights } from "../../treesitter/highlights";
import { parse } from "../../treesitter/parser";
import type {
	TreeSitterLanguage,
	TreeSitterTree,
} from "../../treesitter/types";
import { logSync } from "../../utils/logger";

const DEBOUNCE_MS = 50;

type ParseState = {
	tree: TreeSitterTree;
	version: number;
	language: string;
	grammar: TreeSitterLanguage;
};

const parseStateCache = new Map<Buffer.BufferId, ParseState>();

export function useHighlights(
	buffer: Buffer.BufferState,
	onHighlightsChange: (
		bufferId: Buffer.BufferId,
		highlights: HighlightRange[],
	) => void,
) {
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const lastVersionRef = useRef<number>(-1);
	const onHighlightsChangeRef = useRef(onHighlightsChange);

	onHighlightsChangeRef.current = onHighlightsChange;

	useEffect(() => {
		if (buffer.version === lastVersionRef.current) {
			return;
		}

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(async () => {
			lastVersionRef.current = buffer.version;

			const language = detectLanguage(buffer.props.name || "");
			if (language === "text") {
				onHighlightsChangeRef.current(buffer.id, []);
				return;
			}

			const cachedState = parseStateCache.get(buffer.id);

			const effect = Effect.gen(function* (_) {
				const grammar = yield* _(getGrammar(language));

				const content = Buffer.getText(buffer);
				let tree: TreeSitterTree;

				if (
					cachedState &&
					cachedState.language === language &&
					cachedState.version < buffer.version
				) {
					tree = yield* _(
						parse(content, grammar as TreeSitterLanguage, cachedState.tree),
					);
				} else {
					tree = yield* _(parse(content, grammar as TreeSitterLanguage));
				}

				parseStateCache.set(buffer.id, {
					tree,
					version: buffer.version,
					language,
					grammar: grammar as TreeSitterLanguage,
				});

				const highlights = yield* _(
					getHighlights(
						tree as TreeSitterTree,
						grammar as TreeSitterLanguage,
						language,
					),
				);
				return highlights;
			});

			try {
				const highlights = await Effect.runPromise(effect);
				onHighlightsChangeRef.current(
					buffer.id,
					highlights as HighlightRange[],
				);
			} catch (e) {
				const errorMessage = e instanceof Error ? e.message : String(e);
				vim.notify.notify(`Highlight error: ${errorMessage}`, "error");
				logSync.error("Highlighting failed", e);
			}
		}, DEBOUNCE_MS);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [buffer]);

	return { clearCache: () => parseStateCache.delete(buffer.id) };
}

export function clearParseCache(bufferId?: Buffer.BufferId) {
	if (bufferId !== undefined) {
		parseStateCache.delete(bufferId);
	} else {
		parseStateCache.clear();
	}
}
