import { resolve } from "node:path";

const target = process.argv.includes("--target")
	? process.argv[process.argv.indexOf("--target") + 1]
	: "current";

const entrypoints = ["src/index.ts"];

const outdir = resolve(import.meta.dir, "..", "dist");

const result = await Bun.build({
	entrypoints,
	outdir,
	format: "esm",
	target: "bun",
	external: ["@opentui/core", "solid-js", "effect"],
});

if (!result.success) {
	for (const log of result.logs) {
		if (log.level === "error") {
			console.error(log.message);
		}
	}
	process.exit(1);
}

console.log(`Built SDK to ${outdir} (target: ${target})`);
