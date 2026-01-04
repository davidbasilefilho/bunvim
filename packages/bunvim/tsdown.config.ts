import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.tsx"],
	format: ["esm"],
	platform: "node",
	target: "esnext",
	unbundle: false,
	external: ["bun", "tree-sitter"],
	clean: true,
	plugins: [
		pluginBabel({
			babelHelpers: "bundled",
			extensions: [".js", ".jsx", ".ts", ".tsx"],
			presets: [
				["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
			],
			plugins: [["babel-plugin-react-compiler", { target: "19" }]],
		}),
	],
});
