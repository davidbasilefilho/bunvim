import fs from "node:fs";

import { bufferActions } from "@bunvim/sdk";
import { createCliRenderer } from "@opentui/core";
import { render } from "@opentui/solid";

import { EditorView } from "./ui/editor-view";
import { createLogger } from "./utils/logger";

const logger = createLogger();

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
			initialFile = arg;
		}
	}
}

if (initialFile) {
	try {
		const content = fs.readFileSync(initialFile, "utf-8");
		bufferActions.createState(content, { type: "file", path: initialFile });
	} catch {
		bufferActions.createState("", { type: "scratch", name: "untitled" });
	}
} else {
	bufferActions.createState("", { type: "scratch", name: "untitled" });
}

const TERMINAL_CLEANUP =
	"\x1b[?1049l" +
	"\x1b[?2004l" +
	"\x1b[<u" +
	"\x1b[=0u" +
	"\x1b[>4;0m" +
	"\x1b[?25h" +
	"\x1b[?1000l" +
	"\x1b[?1002l" +
	"\x1b[?1003l" +
	"\x1b[?1006l" +
	"\x1b[0m" +
	"\x1b[?1l";

function cleanupTerminal() {
	try {
		fs.writeSync(1, TERMINAL_CLEANUP);
	} catch {}
}

process.on("SIGINT", () => {});
process.on("exit", cleanupTerminal);
process.on("SIGTERM", () => {
	cleanupTerminal();
	process.exit(0);
});
process.on("uncaughtException", (err) => {
	logger.error("Uncaught Exception", err.stack);
	cleanupTerminal();
	process.exit(1);
});

const renderer = await createCliRenderer({
	useMouse: true,
	enableMouseMovement: true,
	exitOnCtrlC: false,
});

try {
	render(() => <EditorView initialFile={initialFile} />, renderer);
} catch (err) {
	const error = err instanceof Error ? err : new Error(String(err));
	logger.error("Render failed", error.stack);
	console.error(error);
	cleanupTerminal();
	process.exit(1);
}
