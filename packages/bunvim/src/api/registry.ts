import type { Theme } from "../theme/builtin";
import type { Plugin } from "./plugin";

export interface RegistryState {
	plugins: Map<string, Plugin>;
	themes: Map<string, Theme>;
	lspServers: Map<string, { command: string; args?: string[] }>;
	dapAdapters: Map<string, { command: string; args?: string[] }>;
}

const state: RegistryState = {
	plugins: new Map(),
	themes: new Map(),
	lspServers: new Map(),
	dapAdapters: new Map(),
};

export const registry = {
	registerPlugin(plugin: Plugin) {
		state.plugins.set(plugin.name, plugin);
	},
	getPlugin(name: string) {
		return state.plugins.get(name);
	},
	registerTheme(theme: Theme) {
		state.themes.set(theme.name, theme);
	},
	getTheme(name: string) {
		return state.themes.get(name);
	},
	registerLspServer(
		name: string,
		config: { command: string; args?: string[] },
	) {
		state.lspServers.set(name, config);
	},
	getLspServer(name: string) {
		return state.lspServers.get(name);
	},
	registerDapAdapter(
		name: string,
		config: { command: string; args?: string[] },
	) {
		state.dapAdapters.set(name, config);
	},
	getDapAdapter(name: string) {
		return state.dapAdapters.get(name);
	},
};
