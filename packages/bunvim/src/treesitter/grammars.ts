import { existsSync } from "node:fs";
import path from "node:path";
import { Effect } from "effect";
import * as dirs from "../api/dirs";
import { runCommand } from "../utils/shell";
import { isTreeSitterAvailable, TreesitterError } from "./parser";

const grammars = new Map<string, any>();
let grammarsInitialized = false;

const initGrammars = (): boolean => {
	if (grammarsInitialized) return grammars.size > 0;
	grammarsInitialized = true;

	if (!isTreeSitterAvailable()) return false;

	const tryLoad = (name: string, register: (mod: any) => void) => {
		try {
			const mod = require(name);
			register(mod);
		} catch {}
	};

	tryLoad("tree-sitter-typescript", (mod) => {
		if (mod.typescript) grammars.set("typescript", mod.typescript);
		if (mod.tsx) grammars.set("tsx", mod.tsx);
	});

	tryLoad("tree-sitter-javascript", (mod) => {
		grammars.set("javascript", mod.default || mod);
	});

	tryLoad("tree-sitter-json", (mod) => {
		grammars.set("json", mod.default || mod);
	});

	tryLoad("tree-sitter-markdown", (mod) => {
		grammars.set("markdown", mod.default || mod);
	});

	return grammars.size > 0;
};

const languageToPackage: Record<string, string> = {
	rust: "tree-sitter-rust",
	go: "tree-sitter-go",
	python: "tree-sitter-python",
	cpp: "tree-sitter-cpp",
	c: "tree-sitter-c",
	html: "tree-sitter-html",
	css: "tree-sitter-css",
	bash: "tree-sitter-bash",
	ruby: "tree-sitter-ruby",
	lua: "tree-sitter-lua",
	yaml: "tree-sitter-yaml",
	toml: "tree-sitter-toml",
	dockerfile: "tree-sitter-dockerfile",
};

export const registerGrammar = (lang: string, grammar: any) => {
	grammars.set(lang, grammar);
};

const downloading = new Set<string>();

const downloadGrammar = (lang: string) =>
	Effect.gen(function* (_) {
		if (downloading.has(lang)) {
			return yield* _(
				Effect.fail(
					new TreesitterError({
						message: `Already downloading grammar: ${lang}`,
					}),
				),
			);
		}

		const pkg = languageToPackage[lang];
		if (!pkg) {
			return yield* _(
				Effect.fail(
					new TreesitterError({
						message: `No package known for language: ${lang}`,
					}),
				),
			);
		}

		downloading.add(lang);
		try {
			const pkgJson = path.join(dirs.grammars, "package.json");
			if (!existsSync(pkgJson)) {
				yield* _(
					runCommand(["bun", "init", "-y"], {
						cwd: dirs.grammars,
					}),
				);
			}

			yield* _(
				runCommand(["bun", "add", pkg], {
					cwd: dirs.grammars,
				}),
			);
		} finally {
			downloading.delete(lang);
		}
	});

const loadDynamicGrammar = (lang: string) =>
	Effect.gen(function* (_) {
		const pkg = languageToPackage[lang];
		if (!pkg) {
			return yield* _(
				Effect.fail(
					new TreesitterError({
						message: `No package known for language: ${lang}`,
					}),
				),
			);
		}
		const pkgPath = path.join(dirs.grammars, "node_modules", pkg);

		if (!existsSync(pkgPath)) {
			yield* _(downloadGrammar(lang));
		}

		const mod = yield* _(
			Effect.tryPromise({
				try: () => import(pkgPath),
				catch: (e) =>
					new TreesitterError({
						message: `Failed to import grammar: ${lang}`,
						cause: e,
					}),
			}),
		);

		const grammar = mod.default || mod[lang] || mod;
		grammars.set(lang, grammar);
		return grammar;
	});

export const getGrammar = (lang: string) =>
	Effect.gen(function* (_) {
		if (!isTreeSitterAvailable()) {
			return yield* _(
				Effect.fail(
					new TreesitterError({
						message: "tree-sitter not available",
					}),
				),
			);
		}

		initGrammars();

		const grammar = grammars.get(lang);
		if (grammar) return grammar;

		if (languageToPackage[lang]) {
			return yield* _(loadDynamicGrammar(lang));
		}

		return yield* _(
			Effect.fail(
				new TreesitterError({
					message: `Grammar not found for language: ${lang}`,
				}),
			),
		);
	});

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
		case "toml":
			return "toml";
		case "dockerfile":
			return "dockerfile";
		default:
			return "text";
	}
};
