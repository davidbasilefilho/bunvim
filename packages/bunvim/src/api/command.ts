import type { Effect } from "effect";

export type CommandHandler = (
	args: string,
) => void | Effect.Effect<void, never, never>;

export type CommandDefinition = {
	name: string;
	handler: CommandHandler;
	desc?: string;
};

const commands: Map<string, CommandDefinition> = new Map();

export function register(name: string, handler: CommandHandler, desc?: string) {
	commands.set(name, { name, handler, desc });
}

export function unregister(name: string) {
	commands.delete(name);
}

export function get(name: string): CommandDefinition | undefined {
	return commands.get(name);
}

export function getAll(): CommandDefinition[] {
	return Array.from(commands.values());
}
