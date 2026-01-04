import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const treeSitterDir = path.resolve(
	import.meta.dir,
	"../node_modules/tree-sitter",
);
const bindingGyp = path.join(treeSitterDir, "binding.gyp");

if (fs.existsSync(bindingGyp)) {
	console.log("Patching tree-sitter binding.gyp...");
	let content = fs.readFileSync(bindingGyp, "utf8");

	if (content.includes('"-std=c++17"')) {
		content = content.replaceAll('"-std=c++17"', '"-std=c++20"');
		content = content.replaceAll(
			'"CLANG_CXX_LANGUAGE_STANDARD": "c++17"',
			'"CLANG_CXX_LANGUAGE_STANDARD": "c++20"',
		);
		content = content.replaceAll('"/std:c++17"', '"/std:c++20"');
		fs.writeFileSync(bindingGyp, content);
		console.log("Patched binding.gyp to use C++20");

		console.log("Rebuilding tree-sitter...");
		try {
			await $`cd ${treeSitterDir} && node-gyp rebuild`.nothrow();

			const buildRelease = path.join(
				treeSitterDir,
				"build/Release/tree_sitter_runtime_binding.node",
			);
			const prebuildDir = path.join(
				treeSitterDir,
				`prebuilds/${process.platform}-${process.arch}`,
			);
			const prebuildFile = path.join(prebuildDir, "tree-sitter.node");

			if (fs.existsSync(buildRelease)) {
				fs.mkdirSync(prebuildDir, { recursive: true });
				fs.copyFileSync(buildRelease, prebuildFile);
				console.log(`Copied binary to ${prebuildFile}`);
			} else {
				console.error(`Build failed or artifact not found at ${buildRelease}`);
			}
		} catch (e) {
			console.error("Failed to rebuild tree-sitter:", e);
		}
	} else {
		console.log("binding.gyp already patched or version differs.");
	}
} else {
	console.log("tree-sitter directory not found at", treeSitterDir);
}

const markdownDir = path.resolve(
	import.meta.dir,
	"../node_modules/tree-sitter-markdown",
);
const markdownBindingGyp = path.join(markdownDir, "binding.gyp");

if (fs.existsSync(markdownBindingGyp)) {
	console.log("Checking tree-sitter-markdown...");

	let content = fs.readFileSync(markdownBindingGyp, "utf8");
	if (!content.includes('"cflags_cc"')) {
		console.log(
			"Patching tree-sitter-markdown binding.gyp to enable exceptions...",
		);
		content = content.replace(
			'"cflags_c": [',
			'"cflags_cc": ["-fexceptions"],\n        "cflags_c": [',
		);
		fs.writeFileSync(markdownBindingGyp, content);
	}

	const buildRelease = path.join(
		markdownDir,
		"build/Release/tree_sitter_markdown_binding.node",
	);

	if (!fs.existsSync(buildRelease)) {
		console.log("Building tree-sitter-markdown...");
		try {
			await $`cd ${markdownDir} && node-gyp rebuild`.nothrow();
			console.log("Built tree-sitter-markdown");
		} catch (e) {
			console.error("Failed to build tree-sitter-markdown:", e);
		}
	} else {
		console.log("tree-sitter-markdown already built.");
	}
}
