import * as Options from "./options";

export interface Vim {
	opt: Options.VimOptions;
	g: Record<string, unknown>;
}

export const vim: Vim = {
	opt: Options.opt,
	g: {},
};

export function createVim(): Vim {
	return {
		opt: Options.opt,
		g: {},
	};
}
