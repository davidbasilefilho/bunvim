import { $ } from "bun";
import { Effect } from "effect";

export class ShellError extends Error {
	readonly _tag = "ShellError";
}

export function runCommand(
	command: string,
	options?: { cwd?: string; env?: Record<string, string> },
) {
	return Effect.tryPromise({
		try: async () => {
			if (!command) return "";
			const output = await $`sh -c ${command}`
				.cwd(options?.cwd ?? process.cwd())
				.env({ ...process.env, ...options?.env })
				.text();
			return output;
		},
		catch: (e) => new ShellError(String(e)),
	});
}
