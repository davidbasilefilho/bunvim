import os from "node:os";
import path from "node:path";

import { Effect } from "effect";

const homedir = os.homedir();

export const config = path.join(homedir, ".config", "bvim");
export const data = path.join(homedir, ".local", "share", "bvim");
export const cache = path.join(homedir, ".cache", "bvim");
export const grammars = path.join(cache, "grammars");

export const ensureDirs = Effect.gen(function* (_) {
  const dirs = [config, data, cache, grammars];
  for (const dir of dirs) {
    yield* _(
      Effect.tryPromise({
        try: () => Bun.write(path.join(dir, ".keep"), ""),
        catch: (e) => e,
      }),
    );
  }
});
