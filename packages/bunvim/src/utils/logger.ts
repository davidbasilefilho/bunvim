import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { Effect, Logger } from "effect";
import { cache } from "../api/dirs";

const logFile = path.join(cache, "bvim.log");

const ensureLogDir = (): void => {
	try {
		mkdirSync(cache, { recursive: true });
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
	// Also log to console for debugging in dev mode
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

export const logSync = {
	info: (message: string, data?: unknown): void => {
		ensureLogDir();
		const formatted = formatLogEntry(
			"INFO",
			data ? `${message}${serializeData(data)}` : message,
			new Date(),
		);
		console.log(formatted.trim());
		appendFileSync(logFile, formatted);
	},
	warn: (message: string, data?: unknown): void => {
		ensureLogDir();
		const formatted = formatLogEntry(
			"WARN",
			data ? `${message}${serializeData(data)}` : message,
			new Date(),
		);
		console.log(formatted.trim());
		appendFileSync(logFile, formatted);
	},
	error: (message: string, data?: unknown): void => {
		ensureLogDir();
		const formatted = formatLogEntry(
			"ERROR",
			data ? `${message}${serializeData(data)}` : message,
			new Date(),
		);
		console.log(formatted.trim());
		appendFileSync(logFile, formatted);
	},
	debug: (message: string, data?: unknown): void => {
		ensureLogDir();
		const formatted = formatLogEntry(
			"DEBUG",
			data ? `${message}${serializeData(data)}` : message,
			new Date(),
		);
		console.log(formatted.trim());
		appendFileSync(logFile, formatted);
	},
};
