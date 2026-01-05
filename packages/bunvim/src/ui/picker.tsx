import { useKeyboard } from "@opentui/react";
import { Effect } from "effect";
import type React from "react";
import { Activity, useEffect, useState } from "react";
import * as Options from "../api/options";
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
	const [previewHighlights, setPreviewHighlights] = useState<HighlightRange[]>(
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

	const filteredItems =
		query.length === 0
			? items
			: items
					.map((item) => ({ item, score: fuzzyMatch(query, item.text) }))
					.filter((res) => res.score > 0)
					.sort((a, b) => b.score - a.score)
					.map((res) => res.item);

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

	const captureColors: Record<string, string> = {
		keyword: colors.keyword,
		string: colors.string,
		comment: colors.comment,
		function: colors.function,
		variable: colors.variable,
		type: colors.type,
		constant: colors.constant,
		number: colors.constant,
		operator: colors.keyword,
		property: colors.variable,
		parameter: colors.variable,
		label: colors.keyword,
		"variable.builtin": colors.variable,
		"variable.parameter": colors.variable,
		"function.builtin": colors.function,
		"function.call": colors.function,
		"punctuation.bracket": colors.keyword,
		"punctuation.delimiter": colors.keyword,
		tag: colors.keyword,
		attribute: colors.variable,
		namespace: colors.type,
	};

	const renderPreviewLines = () => {
		const tabSize = Options.opt.tabstop;
		const maxPreviewLines = 40;
		const linesToRender = previewContent.slice(0, maxPreviewLines);

		return linesToRender.map((lineText, lineIdx) => {
			const chars = [...lineText];
			const segments: React.ReactNode[] = [];
			const lineHighlights = previewHighlights.filter(
				(h) => h.start.line <= lineIdx && h.end.line >= lineIdx,
			);

			let visualIdx = 0;
			let byteIdx = 0;
			let currentSpan = "";
			let currentFg: string | undefined;
			let currentKey = 0;

			const pushSpan = () => {
				if (currentSpan.length > 0) {
					segments.push(
						<text key={currentKey++} fg={currentFg}>
							{currentSpan}
						</text>,
					);
					currentSpan = "";
				}
			};

			for (let bufIdx = 0; bufIdx < chars.length; bufIdx++) {
				const char = chars[bufIdx] || "";
				const charWidth = char === "\t" ? tabSize : 1;
				const charBytes = Buffer.byteLength(char);
				const charStartVisual = visualIdx;
				const charStartByte = byteIdx;

				if (visualIdx >= 80) break;

				visualIdx += charWidth;
				byteIdx += charBytes;

				let fg = colors.fg;
				const highlight = lineHighlights.find((h) => {
					if (h.start.line < lineIdx && h.end.line > lineIdx) {
						return true;
					}
					if (h.start.line === lineIdx && h.end.line === lineIdx) {
						return (
							charStartByte >= h.start.column && charStartByte < h.end.column
						);
					}
					if (h.start.line === lineIdx) {
						return charStartByte >= h.start.column;
					}
					if (h.end.line === lineIdx) {
						return charStartByte < h.end.column;
					}
					return false;
				});

				if (highlight) {
					const baseCapture = highlight.capture.split(".")[0] || "";
					fg =
						captureColors[highlight.capture] ||
						captureColors[baseCapture] ||
						colors.fg;
				}

				let displayChar = char === "\t" ? " ".repeat(charWidth) : char;
				const remainingWidth = 80 - charStartVisual;
				if (displayChar.length > remainingWidth) {
					displayChar = displayChar.slice(0, remainingWidth);
				}

				if (fg !== currentFg) {
					pushSpan();
					currentFg = fg;
				}
				currentSpan += displayChar;
			}
			pushSpan();

			return (
				<box key={lineIdx} flexDirection="row">
					{segments.length > 0 ? segments : <text fg={colors.fg}> </text>}
				</box>
			);
		});
	};

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
					<Activity mode={hasPreview ? "visible" : "hidden"}>
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
								renderPreviewLines()
							)}
						</box>
					</Activity>
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
