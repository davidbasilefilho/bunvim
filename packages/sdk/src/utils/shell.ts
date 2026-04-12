import { $ } from "bun";
import { Data, Effect } from "effect";

export class ShellError extends Data.TaggedError("ShellError")<{
  message: string;
}> {}

export function runCommand(
  command: string,
  options?: { cwd?: string; env?: Record<string, string> },
) {
  if (!command) return Effect.succeed("");

  return Effect.tryPromise({
    try: () =>
      $`sh -c ${command}`
        .cwd(options?.cwd ?? process.cwd())
        .env({ ...process.env, ...options?.env })
        .text(),
    catch: (e) => new ShellError({ message: String(e) }),
  });
}
