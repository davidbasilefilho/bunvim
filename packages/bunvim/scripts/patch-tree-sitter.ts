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
