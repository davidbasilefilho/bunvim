import { resolve } from "node:path";

const target = process.argv.includes("--target")
  ? process.argv[process.argv.indexOf("--target") + 1]
  : "current";

const sdkBuild = Bun.spawn(["bun", "run", "src/build.ts", "--target", target], {
  cwd: resolve(import.meta.dir, "packages/sdk"),
  stdio: ["inherit", "inherit", "inherit"],
});

const sdkExit = await sdkBuild.exited;
if (sdkExit !== 0) {
  console.error("SDK build failed");
  process.exit(1);
}

const editorBuild = Bun.spawn(["bun", "run", "src/build.ts", target], {
  cwd: resolve(import.meta.dir, "packages/editor"),
  stdio: ["inherit", "inherit", "inherit"],
});

const editorExit = await editorBuild.exited;
if (editorExit !== 0) {
  console.error("Editor build failed");
  process.exit(1);
}

console.log(`Build complete (target: ${target})`);
