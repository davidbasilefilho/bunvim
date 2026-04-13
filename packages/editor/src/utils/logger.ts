import fs from "node:fs";
import path from "node:path";

function getCacheDir(): string {
	const appName = "bunvim";
	let baseDir: string;

	if (process.platform === "win32") {
		baseDir = process.env.LOCALAPPDATA ?? path.join(process.env.APPDATA ?? "", "..", "Local");
	} else if (process.platform === "darwin") {
		baseDir = path.join(process.env.HOME ?? "", "Library", "Caches");
	} else {
		baseDir = process.env.XDG_CACHE_HOME ?? path.join(process.env.HOME ?? "", ".cache");
	}

	const cacheDir = path.join(baseDir, appName);
	try {
		fs.mkdirSync(cacheDir, { recursive: true });
	} catch {}
	return cacheDir;
}

export interface LogEntry {
	timestamp: string;
	level: "error" | "info" | "debug";
	message: string;
	stack?: string;
}

export function createLogger() {
	let logFile: string;

	try {
		const cacheDir = getCacheDir();
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		logFile = path.join(cacheDir, `crash-${timestamp}.log`);
	} catch {
		logFile = path.join(process.cwd(), `crash-${Date.now()}.log`);
	}

	function log(entry: LogEntry): void {
		const lines = [
			`[${entry.timestamp}] [${entry.level.toUpperCase()}]`,
			entry.message,
			entry.stack ?? "",
			"",
		].join("\n");

		try {
			fs.appendFileSync(logFile, lines, "utf-8");
		} catch {
			console.error("Failed to write crash log:", logFile);
			console.error(lines);
		}
	}

	return {
		error(message: string, stack?: string): void {
			console.error("CRASH:", message);
			if (stack) console.error(stack);
			log({ timestamp: new Date().toISOString(), level: "error", message, stack });
		},
		info(message: string): void {
			log({ timestamp: new Date().toISOString(), level: "info", message });
		},
		debug(message: string): void {
			log({ timestamp: new Date().toISOString(), level: "debug", message });
		},
		getLogFile(): string {
			return logFile;
		},
	};
}
