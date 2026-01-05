import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.tsx"],
	format: ["esm"],
	platform: "node",
	target: "esnext",
	treeshake: true,
	unbundle: false,
	external: ["bun", "tree-sitter", /@opentui\/core-.*/],
	clean: true,
	plugins: [
		pluginBabel({
			babelHelpers: "bundled",
			extensions: [".ts", ".tsx"],
			presets: [
				["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
				[
					"@babel/preset-react",
					{ runtime: "automatic", importSource: "@opentui/react" },
				],
			],
			plugins: [["babel-plugin-react-compiler", { target: "19" }]],
		}),
	],
});
