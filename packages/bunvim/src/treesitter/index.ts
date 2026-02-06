import { addDefaultParsers, TreeSitterClient } from "@opentui/core";
import { Data, Effect } from "effect";
import { logSync } from "../utils/logger";

export class TreesitterError extends Data.TaggedError("TreesitterError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export type HighlightRange = {
	start: { line: number; column: number };
	end: { line: number; column: number };
	capture: string;
};

type FiletypeParserOptions = {
	filetype: string;
	queries: {
		highlights: string[];
		injections?: string[];
	};
	wasm: string;
};

const QUERIES_BASE_URL =
	"https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/master/queries";

const languageConfigs: Record<string, { wasm: string; queries: string[] }> = {
	typescript: {
		wasm: "https://github.com/tree-sitter/tree-sitter-typescript/releases/download/v0.23.2/tree-sitter-typescript.wasm",
		queries: [
			`${QUERIES_BASE_URL}/ecma/highlights.scm`,
			`${QUERIES_BASE_URL}/typescript/highlights.scm`,
		],
	},
	tsx: {
		wasm: "https://github.com/tree-sitter/tree-sitter-typescript/releases/download/v0.23.2/tree-sitter-tsx.wasm",
		queries: [
			`${QUERIES_BASE_URL}/ecma/highlights.scm`,
			`${QUERIES_BASE_URL}/typescript/highlights.scm`,
			`${QUERIES_BASE_URL}/tsx/highlights.scm`,
		],
	},
	javascript: {
		wasm: "https://github.com/tree-sitter/tree-sitter-javascript/releases/download/v0.23.1/tree-sitter-javascript.wasm",
		queries: [`${QUERIES_BASE_URL}/ecma/highlights.scm`],
	},
	json: {
		wasm: "https://github.com/tree-sitter/tree-sitter-json/releases/download/v0.24.8/tree-sitter-json.wasm",
		queries: [`${QUERIES_BASE_URL}/json/highlights.scm`],
	},
	rust: {
		wasm: "https://github.com/tree-sitter/tree-sitter-rust/releases/download/v0.23.2/tree-sitter-rust.wasm",
		queries: [`${QUERIES_BASE_URL}/rust/highlights.scm`],
	},
	go: {
		wasm: "https://github.com/tree-sitter/tree-sitter-go/releases/download/v0.23.1/tree-sitter-go.wasm",
		queries: [`${QUERIES_BASE_URL}/go/highlights.scm`],
	},
	python: {
		wasm: "https://github.com/tree-sitter/tree-sitter-python/releases/download/v0.23.6/tree-sitter-python.wasm",
		queries: [`${QUERIES_BASE_URL}/python/highlights.scm`],
	},
	lua: {
		wasm: "https://github.com/tree-sitter/tree-sitter-lua/releases/download/v0.3.0/tree-sitter-lua.wasm",
		queries: [`${QUERIES_BASE_URL}/lua/highlights.scm`],
	},
	cpp: {
		wasm: "https://github.com/tree-sitter/tree-sitter-cpp/releases/download/v0.23.4/tree-sitter-cpp.wasm",
		queries: [
			`${QUERIES_BASE_URL}/c/highlights.scm`,
			`${QUERIES_BASE_URL}/cpp/highlights.scm`,
		],
	},
	c: {
		wasm: "https://github.com/tree-sitter/tree-sitter-c/releases/download/v0.23.5/tree-sitter-c.wasm",
		queries: [`${QUERIES_BASE_URL}/c/highlights.scm`],
	},
	html: {
		wasm: "https://github.com/tree-sitter/tree-sitter-html/releases/download/v0.23.2/tree-sitter-html.wasm",
		queries: [`${QUERIES_BASE_URL}/html/highlights.scm`],
	},
	css: {
		wasm: "https://github.com/tree-sitter/tree-sitter-css/releases/download/v0.23.2/tree-sitter-css.wasm",
		queries: [`${QUERIES_BASE_URL}/css/highlights.scm`],
	},
	bash: {
		wasm: "https://github.com/tree-sitter/tree-sitter-bash/releases/download/v0.23.3/tree-sitter-bash.wasm",
		queries: [`${QUERIES_BASE_URL}/bash/highlights.scm`],
	},
	ruby: {
		wasm: "https://github.com/tree-sitter/tree-sitter-ruby/releases/download/v0.23.1/tree-sitter-ruby.wasm",
		queries: [`${QUERIES_BASE_URL}/ruby/highlights.scm`],
	},
	markdown: {
		wasm: "https://github.com/tree-sitter/tree-sitter-markdown/releases/download/v0.3.2/tree-sitter-markdown.wasm",
		queries: [`${QUERIES_BASE_URL}/markdown/highlights.scm`],
	},
	yaml: {
		wasm: "https://github.com/tree-sitter/tree-sitter-yaml/releases/download/v0.7.0/tree-sitter-yaml.wasm",
		queries: [`${QUERIES_BASE_URL}/yaml/highlights.scm`],
	},
};

export const detectLanguage = (pathStr: string): string => {
	const ext = pathStr.split(".").pop()?.toLowerCase() || "";
	switch (ext) {
		case "ts":
			return "typescript";
		case "tsx":
			return "tsx";
		case "js":
		case "jsx":
			return "javascript";
		case "json":
			return "json";
		case "md":
			return "markdown";
		case "rs":
			return "rust";
		case "go":
			return "go";
		case "py":
			return "python";
		case "cpp":
		case "cc":
		case "hpp":
			return "cpp";
		case "c":
		case "h":
			return "c";
		case "html":
			return "html";
		case "css":
			return "css";
		case "sh":
		case "bash":
			return "bash";
		case "rb":
			return "ruby";
		case "lua":
			return "lua";
		case "yaml":
		case "yml":
			return "yaml";
		default:
			return "text";
	}
};

export const isLanguageSupported = (lang: string): boolean => {
	return lang in languageConfigs;
};

let client: TreeSitterClient | null = null;
let parsersInitialized = false;

export const initializeParsers = (): void => {
	if (parsersInitialized) return;

	const parsers: FiletypeParserOptions[] = Object.entries(languageConfigs).map(
		([filetype, config]) => ({
			filetype,
			wasm: config.wasm,
			queries: {
				highlights: config.queries,
			},
		}),
	);

	addDefaultParsers(parsers);
	parsersInitialized = true;
};

const getClient = async (): Promise<TreeSitterClient | null> => {
	if (client) return client;
	try {
		const newClient = new TreeSitterClient({
			dataPath: "./.cache/bvim/treesitter",
		});
		await newClient.initialize();
		client = newClient;
		return client;
	} catch (e) {
		logSync.error("Failed to initialize TreeSitter client", e);
		return null;
	}
};

export const isTreeSitterAvailable = (): boolean => {
	return client !== null && client.isInitialized();
};

export const getHighlights = (content: string, language: string) =>
	Effect.gen(function* () {
		const tsClient = yield* Effect.tryPromise({
			try: () => getClient(),
			catch: () =>
				new TreesitterError({ message: "Failed to initialize tree-sitter" }),
		});

		if (!tsClient) {
			return [] as HighlightRange[];
		}

		const result = yield* Effect.tryPromise({
			try: () => tsClient.highlightOnce(content, language),
			catch: (e) =>
				new TreesitterError({
					message: "Failed to highlight content",
					cause: e,
				}),
		});

		if (result.error) {
			logSync.error("Highlighting error:", result.error);
			return [] as HighlightRange[];
		}

		return convertHighlights(result.highlights ?? []);
	});

const convertHighlights = (
	highlights: Array<[number, number, string, unknown?]>,
): HighlightRange[] => {
	const ranges: HighlightRange[] = [];

	for (const hl of highlights) {
		const [startCol, endCol, group] = hl;
		ranges.push({
			start: { line: 0, column: startCol },
			end: { line: 0, column: endCol },
			capture: group,
		});
	}

	return ranges;
};
