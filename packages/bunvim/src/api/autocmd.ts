import type { Effect } from "effect";

export type AutocmdEvent =
	| "BufEnter"
	| "BufLeave"
	| "BufRead"
	| "BufWrite"
	| "BufWritePre"
	| "BufWritePost"
	| "BufNew"
	| "BufDelete"
	| "BufHidden"
	| "BufWinEnter"
	| "BufWinLeave"
	| "WinEnter"
	| "WinLeave"
	| "WinNew"
	| "WinClosed"
	| "CursorHold"
	| "CursorMoved"
	| "InsertEnter"
	| "InsertLeave"
	| "TextChanged"
	| "TextChangedI"
	| "TextYankPost"
	| "FileType"
	| "LspAttach"
	| "LspDetach"
	| "VimEnter"
	| "VimLeave"
	| "VimResized";

export type AutocmdArgs = {
	id: number;
	event: AutocmdEvent;
	group?: string;
	match: string;
	buf: number;
	file: string;
	data: unknown;
};

export type AutocmdCallback = (
	args: AutocmdArgs,
) => void | Effect.Effect<void, never, never>;

export type AutocmdOpts = {
	pattern?: string | string[];
	callback: AutocmdCallback;
	group?: string;
	once?: boolean;
	desc?: string;
};

type RegisteredAutocmd = {
	id: number;
	event: AutocmdEvent;
	pattern: string | string[];
	callback: AutocmdCallback;
	group?: string;
	once?: boolean;
	desc?: string;
};

const autocmds: RegisteredAutocmd[] = [];
let nextId = 1;

export function create(
	event: AutocmdEvent | AutocmdEvent[],
	opts: AutocmdOpts,
): number {
	const events = Array.isArray(event) ? event : [event];
	const id = nextId++;
	for (const e of events) {
		autocmds.push({
			id,
			event: e,
			pattern: opts.pattern ?? "*",
			callback: opts.callback,
			group: opts.group,
			once: opts.once,
			desc: opts.desc,
		});
	}
	return id;
}

export function remove(id: number) {
	for (let i = autocmds.length - 1; i >= 0; i--) {
		const au = autocmds[i];
		if (au && au.id === id) {
			autocmds.splice(i, 1);
		}
	}
}

export function trigger(
	event: AutocmdEvent,
	opts: { pattern?: string; data?: unknown } = {},
) {
	for (let i = autocmds.length - 1; i >= 0; i--) {
		const au = autocmds[i];
		if (au && au.event === event) {
			const match = opts.pattern ?? "*";
			if (au.pattern === "*" || au.pattern === match) {
				const args: AutocmdArgs = {
					id: au.id,
					event,
					group: au.group,
					match,
					buf: 0,
					file: "",
					data: opts.data,
				};
				const _result = au.callback(args);
				if (au.once) {
					autocmds.splice(i, 1);
				}
			}
		}
	}
}
