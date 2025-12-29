import type { Effect } from "effect";
import * as Options from "./options";

export type KeymapOptions = {
	remap?: boolean;
	silent?: boolean;
	expr?: boolean;
	desc?: string;
	nowait?: boolean;
};

export type KeymapHandler = () => void | Effect.Effect<void, any, any>;

export type KeymapDefinition = {
	mode: string | string[];
	lhs: string;
	rhs: string | KeymapHandler;
	opts: KeymapOptions;
};

const keymaps: KeymapDefinition[] = [];

function expandLeader(lhs: string): string {
	const leader = Options.opt.leader;
	const leaderChar = leader === "<Space>" ? " " : leader;
	return lhs.replace(/<leader>/gi, leaderChar);
}

export function set(
	mode: string | string[],
	lhs: string,
	rhs: string | KeymapHandler,
	opts: KeymapOptions = {},
) {
	const expandedLhs = expandLeader(lhs);
	keymaps.push({ mode, lhs: expandedLhs, rhs, opts });
}

export function del(mode: string | string[], lhs: string) {
	const expandedLhs = expandLeader(lhs);
	const modes = Array.isArray(mode) ? mode : [mode];
	const index = keymaps.findIndex(
		(k) =>
			expandedLhs === k.lhs &&
			(Array.isArray(k.mode)
				? k.mode.some((m) => modes.includes(m))
				: modes.includes(k.mode)),
	);
	if (index !== -1) {
		keymaps.splice(index, 1);
	}
}

export function get_keymaps(): ReadonlyArray<KeymapDefinition> {
	return keymaps;
}
