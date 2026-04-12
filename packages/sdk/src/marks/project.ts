import { join } from "node:path";

export async function findProjectRoot(startPath: string): Promise<string> {
  let current = startPath;
  const markers = [".git", "package.json", "bun.lock", "tsconfig.json"];

  while (current !== "/") {
    for (const marker of markers) {
      if (await Bun.file(join(current, marker)).exists()) {
        return current;
      }
    }
    const parent = join(current, "..");
    if (parent === current) break;
    current = parent;
  }

  return startPath;
}
