import { Effect } from "effect";
import { useEffect, useRef } from "react";
import { vim } from "../../api/vim";
import * as Buffer from "../../core/buffer";
import type { HighlightRange } from "../../treesitter";
import {
	detectLanguage,
	getHighlights,
	initializeParsers,
	isLanguageSupported,
} from "../../treesitter";
import { logSync } from "../../utils/logger";

const DEBOUNCE_MS = 50;

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
			if (language === "text" || !isLanguageSupported(language)) {
				onHighlightsChangeRef.current(buffer.id, []);
				return;
			}

			initializeParsers();

			const effect = Effect.gen(function* () {
				const content = Buffer.getText(buffer);
				const highlights = yield* getHighlights(content, language);
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

	return { clearCache: () => {} };
}

export function clearParseCache(_bufferId?: Buffer.BufferId) {}
