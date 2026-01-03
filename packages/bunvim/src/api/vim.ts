import * as autocmd from "./autocmd";
import * as buffer from "./buffer";
import * as command from "./command";
import * as dirs from "./dirs";
import * as filetype from "./filetype";
import * as keymap from "./keymap";
import * as notify from "./notify";
import * as options from "./options";
import * as plugin from "./plugin";
import { registry } from "./registry";
import * as status from "./status";
import * as store from "./store";
import * as window from "./window";

export const vim = {
	get opt() {
		return options.opt;
	},
	api: {
		keymap,
		autocmd,
		filetype,
		plugin,
		buffer,
		window,
		notify,
		command,
		registry,
		status,
	},
	keymap,
	autocmd,
	filetype,
	plugin,
	buffer,
	window,
	notify,
	command,
	dirs,
	store,
	status,
	g: {} as Record<string, unknown>,
};

export type { AutocmdEvent, AutocmdOpts } from "./autocmd";
export type { KeymapHandler, KeymapOptions } from "./keymap";
export type { Plugin } from "./plugin";
