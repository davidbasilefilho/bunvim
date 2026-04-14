import { join, delimiter } from "node:path";

import { $ } from "bun";
import { Data, Effect } from "effect";

export class ShellError extends Data.TaggedError("ShellError")<{
  message: string;
}> {}

const buildEnv = (options?: { env?: Record<string, string> }) => {
  const env = { ...process.env, ...options?.env };
  if (process.platform !== "win32") return env;

  const userProfile = process.env.USERPROFILE;
  if (userProfile) {
    const scoopShims = join(userProfile, "scoop", "shims");
    const currentPath = env.PATH ?? env.Path ?? "";
    env.PATH = currentPath ? `${scoopShims}${delimiter}${currentPath}` : scoopShims;
    env.Path = env.PATH;
  }

  return env;
};

export function runCommand(
  command: string,
  options?: { cwd?: string; env?: Record<string, string> },
) {
  if (!command) return Effect.succeed("");

  return Effect.tryPromise({
    try: () =>
      $`sh -c ${command}`
        .cwd(options?.cwd ?? process.cwd())
        .env(buildEnv(options))
        .text(),
    catch: (e) => new ShellError({ message: String(e) }),
  });
}
