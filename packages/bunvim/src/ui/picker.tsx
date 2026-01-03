import { useKeyboard } from "@opentui/react";
import { Effect } from "effect";
import { useEffect, useMemo, useState } from "react";
import { fuzzyMatch } from "../picker/fuzzy";
import type { PickerItem, PickerSource } from "../picker/source";
import { getColors } from "../theme/manager";
import { detectLanguage, getGrammar } from "../treesitter/grammars";
import type { HighlightRange } from "../treesitter/highlights";
import { getHighlights } from "../treesitter/highlights";
import { parse } from "../treesitter/parser";
import type { TreeSitterLanguage, TreeSitterTree } from "../treesitter/types";
import { KeymapIndicator } from "./keymap-indicator";
import { Window } from "./window";

type PickerProps = {
	source: PickerSource;
	onSelect: (item: PickerItem, split?: "h" | "v") => void;
	onClose: () => void;
};

export function Picker({ source, onSelect, onClose }: PickerProps) {
	const colors = getColors();
	const [query, setQuery] = useState("");
	const [items, setItems] = useState<PickerItem[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [previewContent, setPreviewContent] = useState<string[]>([]);
	const [_previewHighlights, setPreviewHighlights] = useState<HighlightRange[]>(
		[],
	);
	const [previewLoading, setPreviewLoading] = useState(false);

	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			try {
				const result = await Effect.runPromise(source.getItems(query));
				setItems(result);
			} catch {
				setItems([]);
			}
			setLoading(false);
		};
		fetchItems();
	}, [source, query]);

	const filteredItems = useMemo(
		() =>
			query.length === 0
				? items
				: items
						.map((item) => ({ item, score: fuzzyMatch(query, item.text) }))
						.filter((res) => res.score > 0)
						.sort((a, b) => b.score - a.score)
						.map((res) => res.item),
		[items, query],
	);

	useEffect(() => {
		const selectedItem = filteredItems[selectedIndex];
		const data = selectedItem?.data as { file?: string } | undefined;
		const filePath = data?.file;

		if (!filePath) {
			setPreviewContent([]);
			setPreviewHighlights([]);
			return;
		}

		const loadPreview = async () => {
			setPreviewLoading(true);
			try {
				const content = await Bun.file(filePath).text();
				const lines = content.split("\n").slice(0, 100);
				setPreviewContent(lines);

				const language = detectLanguage(filePath);
				if (language !== "text") {
					const effect = Effect.gen(function* (_) {
						const grammar = yield* _(getGrammar(language));
						const tree = yield* _(
							parse(content, grammar as TreeSitterLanguage),
						);
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
						setPreviewHighlights(highlights as HighlightRange[]);
					} catch {
						setPreviewHighlights([]);
					}
				} else {
					setPreviewHighlights([]);
				}
			} catch {
				setPreviewContent(["Unable to load preview"]);
				setPreviewHighlights([]);
			}
			setPreviewLoading(false);
		};

		loadPreview();
	}, [filteredItems, selectedIndex]);

	useKeyboard((key) => {
		if (key.name === "escape" || (key.ctrl && key.name === "c")) {
			onClose();
			return;
		}

		if (key.name === "return") {
			const selected = filteredItems[selectedIndex];
			if (selected) {
				onSelect(selected);
			}
			return;
		}

		if (key.ctrl && key.name === "v") {
			const selected = filteredItems[selectedIndex];
			if (selected) {
				onSelect(selected, "v");
			}
			return;
		}

		if (key.ctrl && key.name === "s") {
			const selected = filteredItems[selectedIndex];
			if (selected) {
				onSelect(selected, "h");
			}
			return;
		}

		if (key.name === "up" || (key.ctrl && key.name === "p")) {
			setSelectedIndex((i) => Math.max(0, i - 1));
			return;
		}

		if (key.name === "down" || (key.ctrl && key.name === "n")) {
			setSelectedIndex((i) => Math.min(filteredItems.length - 1, i + 1));
			return;
		}

		if (key.name === "backspace") {
			setQuery((q) => q.slice(0, -1));
			setSelectedIndex(0);
			return;
		}

		if (key.ctrl && key.name === "u") {
			setQuery("");
			setSelectedIndex(0);
			return;
		}

		if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
			setQuery((q) => q + key.sequence);
			setSelectedIndex(0);
		}
	});

	const selectedItem = filteredItems[selectedIndex];
	const data = selectedItem?.data as { file?: string } | undefined;
	const hasPreview = data?.file !== undefined;

	return (
		<Window
			id={999}
			type="floating"
			anchor="center"
			width="90%"
			height="80%"
			title={source.name}
			dim={true}
			hideTabline={true}
			singleBuffer={true}
		>
			<box
				flexGrow={1}
				flexDirection="column"
				style={{
					backgroundColor: colors.picker.bg,
				}}
			>
				<box
					height={3}
					flexDirection="row"
					alignItems="center"
					backgroundColor={colors.surface}
					paddingRight={1}
				>
					<box
						style={{
							width: 1,
							height: 3,
							marginRight: 1,
							backgroundColor: colors.picker.prompt,
						}}
					/>
					<text fg={colors.picker.prompt}>❯ </text>
					<text fg={colors.picker.fg}>{query}</text>
					<box
						style={{ width: 1, height: 1, backgroundColor: colors.cursor }}
					/>
				</box>
				<box flexGrow={1} flexDirection="row">
					<box flexGrow={1} flexBasis={0} flexDirection="column">
						{loading ? (
							<box paddingLeft={1}>
								<text fg={colors.muted}>Loading...</text>
							</box>
						) : filteredItems.length === 0 ? (
							<box paddingLeft={1}>
								<text fg={colors.muted}>No results</text>
							</box>
						) : (
							filteredItems.slice(0, 30).map((item, i) => (
								<box
									key={i}
									style={{
										paddingLeft: 1,
										paddingRight: 1,
										backgroundColor: undefined,
									}}
								>
									<text
										fg={
											i === selectedIndex
												? colors.picker.selection.fg
												: colors.fg
										}
									>
										{i === selectedIndex ? "❯ " : "  "}
										{item.text}
									</text>
								</box>
							))
						)}
					</box>
					{hasPreview && (
						<box
							flexGrow={1}
							flexBasis={0}
							flexDirection="column"
							backgroundColor={colors.overlay}
							padding={1}
						>
							{previewLoading ? (
								<text fg={colors.muted}>Loading preview...</text>
							) : (
								previewContent.slice(0, 40).map((line, i) => (
									<text key={i} fg={colors.fg}>
										{line.slice(0, 80) || " "}
									</text>
								))
							)}
						</box>
					)}
				</box>
				<KeymapIndicator
					keys={[
						{ key: "⏎", description: "select" },
						{ key: "^v", description: "vsplit" },
						{ key: "^s", description: "split" },
						{ key: "esc", description: "close" },
					]}
				/>
			</box>
		</Window>
	);
}
