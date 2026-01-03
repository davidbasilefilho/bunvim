import { $ } from "bun";
import { Effect } from "effect";

export class ShellError extends Error {
	readonly _tag = "ShellError";
}

export function runCommand(command: string[], options?: { cwd?: string }) {
	return Effect.tryPromise({
		try: async () => {
			const [cmd, ...args] = command;
			if (!cmd) return "";
			const output = await $`${cmd} ${args}`
				.cwd(options?.cwd ?? process.cwd())
				.text();
			return output;
		},
		catch: (e) => new ShellError(String(e)),
	});
}
