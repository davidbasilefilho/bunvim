import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { Effect, Logger } from "effect";

const logDir =
	process.env.XDG_CACHE_HOME ||
	path.join(process.env.HOME || "", ".cache", "bvim");
const logFile = path.join(logDir, "bvim.log");

const ensureLogDir = (): void => {
	try {
		mkdirSync(logDir, { recursive: true });
	} catch {}
};

const serializeData = (data: unknown): string => {
	if (data === undefined) return "";
	if (data instanceof Error) {
		return ` ${JSON.stringify({ name: data.name, message: data.message, stack: data.stack })}`;
	}
	return ` ${JSON.stringify(data)}`;
};

const formatLogEntry = (
	level: string,
	message: string,
	timestamp: Date,
): string => {
	return `[${timestamp.toISOString()}] [${level}] ${message}\n`;
};

const fileLogger = Logger.make<unknown, void>(({ logLevel, message, date }) => {
	ensureLogDir();
	const formatted = formatLogEntry(logLevel.label, String(message), date);
	if (process.env.NODE_ENV !== "production") {
		console.log(formatted.trim());
	}
	try {
		appendFileSync(logFile, formatted);
	} catch {}
});

export const FileLoggerLayer = Logger.replace(Logger.defaultLogger, fileLogger);

export const withFileLogger = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	Effect.provide(effect, FileLoggerLayer);

export const log = {
	info: (message: string, data?: unknown): Effect.Effect<void> =>
		Effect.log(data ? `${message}${serializeData(data)}` : message),

	warn: (message: string, data?: unknown): Effect.Effect<void> =>
		Effect.logWarning(data ? `${message}${serializeData(data)}` : message),

	error: (message: string, data?: unknown): Effect.Effect<void> =>
		Effect.logError(data ? `${message}${serializeData(data)}` : message),

	debug: (message: string, data?: unknown): Effect.Effect<void> =>
		Effect.logDebug(data ? `${message}${serializeData(data)}` : message),
};

const writeLogEntry = (
	level: string,
	message: string,
	data?: unknown,
): void => {
	ensureLogDir();
	const formatted = formatLogEntry(
		level,
		data ? `${message}${serializeData(data)}` : message,
		new Date(),
	);
	console.log(formatted.trim());
	appendFileSync(logFile, formatted);
};

export const logSync = {
	info: (message: string, data?: unknown): void =>
		writeLogEntry("INFO", message, data),
	warn: (message: string, data?: unknown): void =>
		writeLogEntry("WARN", message, data),
	error: (message: string, data?: unknown): void =>
		writeLogEntry("ERROR", message, data),
	debug: (message: string, data?: unknown): void =>
		writeLogEntry("DEBUG", message, data),
};
