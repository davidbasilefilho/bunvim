import { homedir } from "node:os";
import { join } from "node:path";

import { Data, Effect } from "effect";

export class ConfigLoadError extends Data.TaggedError("ConfigLoadError")<{
  message: string;
}> {}

export function loadConfig() {
  return Effect.gen(function* () {
    const configPath = join(homedir(), ".config", "bvim", "init.ts");
    const file = Bun.file(configPath);

    const exists = yield* Effect.tryPromise({
      try: () => file.exists(),
      catch: (e) => new ConfigLoadError({ message: String(e) }),
    });

    if (exists) {
      yield* Effect.tryPromise({
        try: () => import(configPath),
        catch: (e) => new ConfigLoadError({ message: String(e) }),
      });
    }
  });
}
