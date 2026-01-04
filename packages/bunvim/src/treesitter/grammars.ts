import {
	existsSync,
	readdirSync,
	readFileSync,
	renameSync,
	statSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Effect } from "effect";
import * as dirs from "../api/dirs";
import { vim } from "../api/vim";
import { logSync } from "../utils/logger";
import { runCommand } from "../utils/shell";
import {
	ensureTreeSitter,
	isTreeSitterAvailable,
	TreesitterError,
} from "./parser";
import type { TreeSitterGrammar } from "./types";

const grammars = new Map<string, TreeSitterGrammar>();
let grammarsInitialized = false;

const initGrammars = async (): Promise<boolean> => {
	if (grammarsInitialized) return grammars.size > 0;
	grammarsInitialized = true;

	const available = await ensureTreeSitter();
	if (!available) return false;

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
	yaml: "@tree-sitter-grammars/tree-sitter-yaml",
	toml: "@tree-sitter-grammars/tree-sitter-toml",
	dockerfile: "tree-sitter-dockerfile",
	typescript: "tree-sitter-typescript",
	tsx: "tree-sitter-typescript",
	javascript: "tree-sitter-javascript",
	json: "tree-sitter-json",
	markdown: "@tree-sitter-grammars/tree-sitter-markdown",
};

export const registerGrammar = (lang: string, grammar: TreeSitterGrammar) => {
	grammars.set(lang, grammar);
};

const downloading = new Set<string>();

const fixGrammar = (pkgName: string) => {
	try {
		const pkgPath = path.join(dirs.grammars, "node_modules", pkgName);

		if (!existsSync(pkgPath)) {
			return;
		}

		const prebuilds = path.join(pkgPath, "prebuilds");
		if (existsSync(prebuilds)) {
			const platforms = readdirSync(prebuilds);
			for (const platform of platforms) {
				const platformDir = path.join(prebuilds, platform);
				if (statSync(platformDir).isDirectory()) {
					const files = readdirSync(platformDir);
					for (const file of files) {
						if (file.includes("+") && file.endsWith(".node")) {
							const newName = file.split("+").pop();
							if (newName) {
								renameSync(
									path.join(platformDir, file),
									path.join(platformDir, newName),
								);
							}
						}
					}
				}
			}
		}
	} catch (_e) {
		// Ignore errors during fix
	}
};

const downloadGrammar = (lang: string) =>
	Effect.gen(function* (_) {
		if (downloading.has(lang)) {
			// Wait for download to complete by polling
			return yield* _(
				Effect.async<void, TreesitterError>((resume) => {
					const check = () => {
						if (!downloading.has(lang)) {
							resume(Effect.void);
						} else {
							setTimeout(check, 100);
						}
					};
					check();
				}),
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

		const taskId = `ts-download-${lang}`;
		downloading.add(lang);
		vim.status.startTask(taskId, `Downloading tree-sitter-${lang}...`);

		try {
			const pkgJson = path.join(dirs.grammars, "package.json");
			if (!existsSync(pkgJson)) {
				yield* _(
					runCommand("bun init -y", {
						cwd: dirs.grammars,
					}),
				);
			}

			yield* _(
				runCommand(`bun add --trust ${pkg}`, {
					cwd: dirs.grammars,
					env: { CXXFLAGS: "-fexceptions" },
				}),
			);
			vim.status.updateTask(taskId, `Installed tree-sitter-${lang}`, "success");
			fixGrammar(pkg);
		} catch (e) {
			vim.status.updateTask(taskId, `Failed to download ${lang}`, "error");
			throw e;
		} finally {
			downloading.delete(lang);
			setTimeout(() => vim.status.finishTask(taskId), 3000);
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

		if (existsSync(pkgPath)) {
			// Always try to fix grammar on load to ensure prebuilds are named correctly
			fixGrammar(pkg);

			const isValid =
				existsSync(path.join(pkgPath, "package.json")) ||
				existsSync(path.join(pkgPath, "grammar.js"));

			if (!isValid) {
				logSync.warn(`Invalid installation found for ${lang}, reinstalling...`);
				yield* _(downloadGrammar(lang));
			}
		} else {
			yield* _(downloadGrammar(lang));
		}

		// Verify existence after download attempt
		if (!existsSync(pkgPath)) {
			return yield* _(
				Effect.fail(
					new TreesitterError({
						message: `Grammar package not found after download attempt: ${pkgPath}`,
					}),
				),
			);
		}

		const loadTaskId = `ts-load-${lang}`;
		vim.status.startTask(loadTaskId, `Loading ${lang} grammar...`);

		const mod = yield* _(
			Effect.try({
				try: () => {
					// Use createRequire to bypass VFS restrictions in bundled app
					// We create a require function anchored at the grammars directory
					const grammarRequire = createRequire(
						path.join(dirs.grammars, "package.json"),
					);
					// Use absolute path to ensure we hit the correct location
					// avoiding any potential resolution issues with package names in VFS
					// Manually resolve entry point to handle directory mains (e.g. tree-sitter-json -> bindings/node)
					const pkgJsonPath = path.join(pkgPath, "package.json");
					if (existsSync(pkgJsonPath)) {
						try {
							const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
							if (pkgJson.main) {
								let entry = path.join(pkgPath, pkgJson.main);
								if (existsSync(entry) && statSync(entry).isDirectory()) {
									entry = path.join(entry, "index.js");
								} else if (!existsSync(entry) && existsSync(`${entry}.js`)) {
									entry = `${entry}.js`;
								}
								return grammarRequire(entry);
							}
						} catch (_e) {
							// Ignore package.json resolution errors
						}
					}
					return grammarRequire(pkgPath);
				},
				catch: (e) => {
					vim.status.updateTask(loadTaskId, `Failed to load ${lang}`, "error");
					return new TreesitterError({
						message: `Failed to load grammar: ${lang}`,
						cause: e,
					});
				},
			}),
		);

		vim.status.finishTask(loadTaskId);

		// Try to find the grammar object
		// 1. Direct default export (common in some packages)
		// 2. Named export matching the language (e.g. tree-sitter-typescript -> mod.typescript)
		// 3. mod.default[lang] (nested default)
		let grammar = mod.default || mod;

		if (
			grammar &&
			!grammar.name &&
			!grammar.language &&
			typeof grammar === "object"
		) {
			// If the default export is just a container, look inside
			if (grammar[lang]) {
				grammar = grammar[lang];
			} else if (grammar.default?.[lang]) {
				grammar = grammar.default[lang];
			}
		}

		grammars.set(lang, grammar);
		return grammar;
	});

export const getGrammar = (lang: string) =>
	Effect.gen(function* (_) {
		yield* _(
			Effect.tryPromise({
				try: () => initGrammars(),
				catch: () =>
					new TreesitterError({ message: "Failed to init grammars" }),
			}),
		);

		if (!isTreeSitterAvailable()) {
			return yield* _(
				Effect.fail(
					new TreesitterError({
						message: "tree-sitter not available",
					}),
				),
			);
		}

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
