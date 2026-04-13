import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

import solidPlugin from "@opentui/solid/bun-plugin";

const PLATFORMS = ["linux", "darwin", "windows"] as const;
const ARCHES = ["x64", "arm64"] as const;
const BASELINES = ["", "-baseline"] as const;

type Platform = (typeof PLATFORMS)[number];
type Arch = (typeof ARCHES)[number];

interface Target {
  platform: Platform;
  arch: Arch;
  baseline: boolean;
}

const PACKAGE_NAMES: Record<Platform, Record<Arch, string>> = {
  linux: { x64: "@opentui/core-linux-x64", arm64: "@opentui/core-linux-arm64" },
  darwin: {
    x64: "@opentui/core-darwin-x64",
    arm64: "@opentui/core-darwin-arm64",
  },
  windows: {
    x64: "@opentui/core-win32-x64",
    arm64: "@opentui/core-win32-arm64",
  },
};

const ALL_PACKAGES = [
  "@opentui/core-linux-x64",
  "@opentui/core-linux-arm64",
  "@opentui/core-darwin-x64",
  "@opentui/core-darwin-arm64",
  "@opentui/core-win32-x64",
  "@opentui/core-win32-arm64",
];

function targetToBunTarget(t: Target): string {
  const platform = t.platform === "windows" ? "win32" : t.platform;
  const arch = t.arch === "x64" ? "x64" : "arm64";
  return `bun-${platform}-${arch}${t.baseline ? "-baseline" : ""}`;
}

function targetToExt(t: Target): string {
  return t.platform === "windows" ? ".exe" : "";
}

function targetToOutputName(t: Target): string {
  const baseline = t.baseline ? "-baseline" : "";
  const plat = t.platform === "windows" ? "win" : t.platform;
  return `bvim-${plat}-${t.arch}${baseline}${targetToExt(t)}`;
}

function targetToPackageName(t: Target): string {
  return PACKAGE_NAMES[t.platform][t.arch];
}

function parseArgs(): {
  targets: Target[] | null;
  help: boolean;
  currentPlatform: boolean;
} {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    return { targets: null, help: true, currentPlatform: false };
  }
  if (args.includes("all")) {
    const targets: Target[] = [];
    for (const platform of PLATFORMS) {
      for (const arch of ARCHES) {
        for (const baseline of BASELINES) {
          targets.push({ platform, arch, baseline: baseline !== "" });
        }
      }
    }
    return { targets, help: false, currentPlatform: false };
  }
  if (args.includes("current") || args.length === 0) {
    return { targets: null, help: false, currentPlatform: true };
  }
  // Default: current platform
  const platform =
    process.platform === "win32" ? "windows" : process.platform === "darwin" ? "darwin" : "linux";
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  return {
    targets: [{ platform, arch, baseline: false }],
    help: false,
    currentPlatform: false,
  };
}

function showHelp() {
  console.log(`Usage: bun run build.ts [options]

Options:
  all        Build for all platforms (linux/darwin/windows × x64/arm64 × baseline)
  current    Build for current platform (default when no flags)
  -h, --help Show this help

Examples:
  bun run build.ts        # Build for current platform
  bun run build.ts current # Build for current platform
  bun run build.ts all    # Build for all platforms
`);
}

async function installForTarget(target: Target): Promise<void> {
  const platform = target.platform === "windows" ? "win32" : target.platform;
  const cpu = target.arch === "x64" ? "x64" : "arm64";
  console.log(`  Installing deps for ${platform}-${cpu}...`);
  const proc = Bun.spawn(["bun", "install", `--os=${platform}`, `--cpu=${cpu}`], {
    cwd: resolve(import.meta.dir),
    stdio: ["inherit", "inherit", "inherit"] as any,
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`bun install failed with code ${exitCode}`);
  }
}

function removeOtherPlatformPackages(target: Target): void {
  const keepPackage = targetToPackageName(target);
  const nodeModulesPath = resolve(import.meta.dir, "..", "node_modules");

  for (const pkg of ALL_PACKAGES) {
    if (pkg === keepPackage) continue;
    const pkgPath = resolve(nodeModulesPath, pkg);
    if (existsSync(pkgPath)) {
      console.log(`  Removing ${pkg}...`);
      rmSync(pkgPath, { recursive: true, force: true });
    }
  }
}

async function restoreAllPackages(): Promise<void> {
  console.log("  Restoring all packages...");
  const proc = Bun.spawn(["bun", "install"], {
    cwd: resolve(import.meta.dir),
    stdio: ["inherit", "inherit", "inherit"] as any,
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`bun install failed with code ${exitCode}`);
  }
}

async function buildForTarget(target: Target): Promise<void> {
  const outdir = resolve(import.meta.dir, "..", "..", "..", "bin");
  const output = resolve(outdir, targetToOutputName(target));
  const bunTarget = targetToBunTarget(target);

  console.log(
    `Building for ${target.platform}-${target.arch}${target.baseline ? "-baseline" : ""}...`,
  );

  const input = resolve(import.meta.dir, "index.tsx");

  removeOtherPlatformPackages(target);

  const result = await Bun.build({
    entrypoints: [input],
    plugins: [solidPlugin],
    compile: {
      target: bunTarget as "bun-linux-x64",
      outfile: output,
    },
  });

  await restoreAllPackages();

  if (!result.success) {
    const errors = result.logs.filter((l) => l.level === "error");
    for (const err of errors) {
      console.error(`  Error: ${err.message}`);
    }
    throw new Error(`Build failed for ${bunTarget}`);
  }

  console.log(`  Built: ${output}`);
}

async function buildCurrentPlatform(): Promise<void> {
  console.log("Building for current platform...");

  const outdir = resolve(import.meta.dir, "..", "..", "..", "bin");
  const input = resolve(import.meta.dir, "index.tsx");

  const result = await Bun.build({
    entrypoints: [input],
    plugins: [solidPlugin],
    outdir,
    compile: {
      outfile: "bvim",
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

  console.log(`  Built: ${resolve(outdir, "bvim")}`);
}

async function main() {
  const { targets, help, currentPlatform } = parseArgs();

  if (help) {
    showHelp();
    return;
  }

  if (currentPlatform) {
    await buildCurrentPlatform();
    console.log("\nBuild complete!");
    return;
  }

  for (const target of targets!) {
    console.log(`\n[${target.platform}-${target.arch}${target.baseline ? "-baseline" : ""}]`);
    await installForTarget(target);
    await buildForTarget(target);
  }

  console.log("\nAll builds complete!");
}

void main();
