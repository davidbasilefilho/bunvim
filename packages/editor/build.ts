import { rmSync } from "node:fs";
import solidPlugin from "@opentui/solid/bun-plugin";

type BuildConfig = Parameters<typeof Bun.build>[0];
type CompileTarget = NonNullable<NonNullable<BuildConfig["compile"]>["target"]>;
type Platform = "linux" | "darwin" | "windows";

function isPlatform(value: string): value is Platform {
	return value === "linux" || value === "darwin" || value === "windows";
}

const targets: Record<Platform, { target: CompileTarget; outfile: string }> = {
	linux: { target: "bun-linux-x64", outfile: "./dist/bvim" },
	darwin: { target: "bun-darwin-arm64", outfile: "./dist/bvim-darwin" },
	windows: { target: "bun-windows-x64", outfile: "./dist/bvim.exe" },
};

function parsePlatform(args: string[]): Platform {
	const arg = args.find((a) => !a.startsWith("-"));
	if (arg && isPlatform(arg)) {
		return arg;
	}
	return "linux";
}

const platform = parsePlatform(process.argv.slice(2));
const { target, outfile } = targets[platform];

try {
	rmSync(outfile, { force: true });
} catch {}

const result = await Bun.build({
	entrypoints: ["./src/index.tsx"],
	target: "bun",
	plugins: [solidPlugin],
	compile: {
		target,
		outfile,
	},
});

if (!result.success) {
	console.error("Build failed:");
	for (const log of result.logs) {
		console.error(log);
	}
	process.exit(1);
}

console.log(`Built ${outfile} for ${platform}`);
