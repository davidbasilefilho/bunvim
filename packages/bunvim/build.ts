import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.tsx"],
	format: ["esm"],
	target: "node20",
	clean: true,
	bundle: true,
	plugins: [
		pluginBabel({
			babelHelpers: "bundled",
			extensions: [".js", ".jsx", ".ts", ".tsx"],
			plugins: [
				[
					"babel-plugin-react-compiler",
					{
						/* opções do compilador */
					},
				],
			],
		}),
	],
});
