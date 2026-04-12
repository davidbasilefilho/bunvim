import { rmSync } from "node:fs";
import { resolve } from "node:path";

import { Effect, Schema } from "effect";
import solidPlugin from "@opentui/solid/bun-plugin";

type BuildConfig = Parameters<typeof Bun.build>[0];
type CompileTarget = NonNullable<NonNullable<BuildConfig["compile"]>["target"]>;

const repoRoot = resolve(import.meta.dir, "..", "..");

const PlatformSchema = Schema.Literal("linux", "darwin", "windows");
type Platform = Schema.Schema.Type<typeof PlatformSchema>;

const ArchSchema = Schema.Literal("x64", "arm64");
type Arch = Schema.Schema.Type<typeof ArchSchema>;

const TargetInput = Schema.Struct({
	platform: PlatformSchema,
	arch: ArchSchema,
	baseline: Schema.Boolean,
});
type TargetInput = Schema.Schema.Type<typeof TargetInput>;

const TargetOutput = Schema.Struct({
	platform: PlatformSchema,
	arch: ArchSchema,
	baseline: Schema.Boolean,
	target: Schema.String,
	outfile: Schema.String,
});
type TargetOutput = Schema.Schema.Type<typeof TargetOutput>;

function targetToBunTarget(
	platform: Platform,
	arch: Arch,
	baseline: boolean,
): CompileTarget {
	const plat = platform === "windows" ? "win32" : platform;
	const baselineSuffix = baseline ? "-baseline" : "";
	return `bun-${plat}-${arch}${baselineSuffix}` as CompileTarget;
}

function targetToOutputName(
	platform: Platform,
	arch: Arch,
	baseline: boolean,
): string {
	const plat = platform === "windows" ? "win" : platform;
	const baselineSuffix = baseline ? "-baseline" : "";
	const ext = platform === "windows" ? ".exe" : "";
	return `bvim-${plat}-${arch}${baselineSuffix}${ext}`;
}

function parseTargetString(input: string): Effect.Effect<TargetInput, Error> {
	const match = input.match(
		/^(linux|darwin|windows)-(x64|arm64)(?:-baseline)?$/,
	);
	if (!match) {
		return Effect.fail(
			new Error(
				`Invalid target format: "${input}". Expected: linux-x64, darwin-arm64, windows-x64, etc.`,
			),
		);
	}
	const [, platform, arch] = match;
	const baseline = input.endsWith("-baseline");
	return Effect.succeed({
		platform: platform as Platform,
		arch: arch as Arch,
		baseline,
	});
}

function validateAndTransform(target: TargetInput): TargetOutput {
	const bunTarget = targetToBunTarget(
		target.platform,
		target.arch,
		target.baseline,
	);
	const outfile = resolve(
		repoRoot,
		"bin",
		targetToOutputName(target.platform, target.arch, target.baseline),
	);
	return {
		...target,
		target: bunTarget,
		outfile,
	};
}

function parseArgs(): Effect.Effect<
	{ targets: TargetOutput[]; help: boolean; buildCurrent: boolean },
	Error
> {
	const args = process.argv.slice(2);

	if (args.includes("-h") || args.includes("--help")) {
		return Effect.succeed({ targets: [], help: true, buildCurrent: false });
	}

	if (args.includes("all")) {
		const platforms: [Platform, Platform, Platform] = [
			"linux",
			"darwin",
			"windows",
		];
		const arches: [Arch, Arch] = ["x64", "arm64"];
		const targets: TargetInput[] = [];
		for (const platform of platforms) {
			for (const arch of arches) {
				targets.push({ platform, arch, baseline: false });
				targets.push({ platform, arch, baseline: true });
			}
		}
		return Effect.succeed({
			targets: targets.map(validateAndTransform),
			help: false,
			buildCurrent: false,
		});
	}

	const targetArgIndex = args.findIndex(
		(arg) => arg === "--target" || arg === "-t",
	);
	const hasTargetFlag = targetArgIndex !== -1;

	if (!hasTargetFlag || args[targetArgIndex + 1] === "current") {
		return Effect.succeed({ targets: [], help: false, buildCurrent: true });
	}

	const targetStrings = args
		.slice(targetArgIndex + 1)
		.filter((a) => !a.startsWith("-"));
	const results = targetStrings.map(parseTargetString);
	return Effect.all(results).pipe(
		Effect.map((inputs) => ({
			targets: inputs.map(validateAndTransform),
			help: false,
			buildCurrent: false,
		})),
	);
}

function showHelp() {
	console.log(`Usage: bun run build.ts [options]

Options:
  all              Build for all platforms (linux/darwin/windows × x64/arm64 × baseline)
  --target <target> Build for specific target(s), e.g.:
                      linux-x64, linux-arm64
                      darwin-x64, darwin-arm64
                      windows-x64, windows-arm64
                      linux-x64-baseline, darwin-arm64-baseline, etc.
  --target current  Build for current platform (default when no flags)
  -h, --help       Show this help

Examples:
  bun run build.ts              # Build for current platform
  bun run build.ts --target current  # Build for current platform
  bun run build.ts all          # Build all targets
  bun run build.ts --target linux-x64  # Build for linux x64
  bun run build.ts --target linux-x64 --target darwin-arm64  # Build for multiple targets
`);
}

async function buildCurrentPlatform(): Promise<void> {
	console.log("Building for current platform...");

	const outdir = resolve(repoRoot, "bin");
	const input = resolve(import.meta.dir, "src", "index.tsx");

	const platform: Platform =
		process.platform === "win32"
			? "windows"
			: process.platform === "darwin"
				? "darwin"
				: "linux";
	const ext = platform === "windows" ? ".exe" : "";
	const outfile = resolve(outdir, `bvim${ext}`);

	try {
		rmSync(outfile, { force: true });
	} catch {}

	const result = await Bun.build({
		entrypoints: [input],
		target: "bun",
		plugins: [solidPlugin],
		compile: {
			outfile,
		},
		minify: true,
	});

	if (!result.success) {
		const errors = result.logs.filter((l) => l.level === "error");
		for (const err of errors) {
			console.error(`  Error: ${err.message}`);
		}
		throw new Error("Build failed for current platform");
	}

	console.log(`  Built: ${outfile}`);
}

async function buildTarget(target: TargetOutput): Promise<void> {
	console.log(
		`Building for ${target.platform}-${target.arch}${target.baseline ? "-baseline" : ""}...`,
	);

	try {
		rmSync(target.outfile, { force: true });
	} catch {}

	const result = await Bun.build({
		entrypoints: ["./src/index.tsx"],
		target: "bun",
		plugins: [solidPlugin],
		compile: {
			target: target.target,
			outfile: target.outfile,
		},
	});

	if (!result.success) {
		const errors = result.logs.filter((l) => l.level === "error");
		for (const err of errors) {
			console.error(`  Error: ${err.message}`);
		}
		throw new Error(`Build failed for ${target.target}`);
	}

	console.log(`  Built: ${target.outfile}`);
}

async function main() {
	const eitherResult = Effect.runSync(Effect.either(parseArgs()));

	if (eitherResult._tag === "Left") {
		console.error(`Error: ${eitherResult.left.message}`);
		process.exit(1);
	}

	const { targets, help, buildCurrent } = eitherResult.right;

	if (help) {
		showHelp();
		return;
	}

	if (buildCurrent) {
		await buildCurrentPlatform();
	} else {
		for (const target of targets) {
			await buildTarget(target);
		}
	}

	console.log("\nBuild complete!");
}

main();
