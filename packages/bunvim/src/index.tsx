import fs from "node:fs";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Effect } from "effect";
import { vim } from "./api/vim";
import { loadConfig } from "./config/loader";
import { EditorView } from "./ui/editor-view";

const args = process.argv.slice(2);
let initialFile: string | undefined;

if (args.length > 0) {
	const arg = args[0];
	if (arg) {
		try {
			const stat = fs.statSync(arg);
			if (stat.isDirectory()) {
				process.chdir(arg);
			} else if (stat.isFile()) {
				initialFile = arg;
			}
		} catch {
			// Assume it's a new file if it doesn't exist
			initialFile = arg;
		}
	}
}

await Effect.runPromise(
	Effect.gen(function* (_) {
		yield* _(vim.dirs.ensureDirs);
		yield* _(loadConfig());
	}),
);

const renderer = await createCliRenderer({
	useMouse: true,
	enableMouseMovement: true,
	exitOnCtrlC: false,
});

process.on("SIGINT", () => {});

const TERMINAL_CLEANUP =
	"\x1b[?1049l" + // Leave alternate screen buffer
	"\x1b[?2004l" + // Disable bracketed paste mode
	"\x1b[<u" + // Pop kitty keyboard protocol flags
	"\x1b[=0u" + // Set kitty keyboard protocol flags to 0
	"\x1b[>4;0m" + // Disable modifyOtherKeys mode
	"\x1b[?25h" + // Show cursor
	"\x1b[?1000l" + // Disable basic mouse mode
	"\x1b[?1002l" + // Disable button event tracking
	"\x1b[?1003l" + // Disable any event tracking
	"\x1b[?1006l" + // Disable SGR mouse mode
	"\x1b[0m" + // Reset text attributes
	"\x1b[?1l"; // Reset cursor keys to normal mode

function cleanupTerminal() {
	try {
		fs.writeSync(1, TERMINAL_CLEANUP);
	} catch {}
}

process.on("exit", cleanupTerminal);
process.on("SIGTERM", () => {
	cleanupTerminal();
	process.exit(0);
});
process.on("uncaughtException", () => {
	cleanupTerminal();
	process.exit(1);
});

export { cleanupTerminal };

createRoot(renderer).render(<EditorView initialFile={initialFile} />);
