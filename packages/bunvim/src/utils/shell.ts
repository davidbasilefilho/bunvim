import { Effect } from "effect";

export class ShellError extends Error {
	readonly _tag = "ShellError";
}

export function runCommand(command: string[], options?: { cwd?: string }) {
	return Effect.tryPromise({
		try: async () => {
			const proc = Bun.spawn(command, { cwd: options?.cwd });
			const output = await new Response(proc.stdout).text();
			return output;
		},
		catch: (e) => new ShellError(String(e)),
	});
}
