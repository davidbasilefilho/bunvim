import { Effect } from "effect";
import { registry } from "./registry";

export interface Plugin {
	name: string;
	setup: () => void | Effect.Effect<void, never, never>;
	cleanup?: () => void | Effect.Effect<void, never, never>;
}

export function load(pluginName: string) {
	return Effect.gen(function* () {
		const module = yield* Effect.tryPromise({
			try: () => import(pluginName),
			catch: (e) => new Error(`Failed to import plugin ${pluginName}: ${e}`),
		});
		const plugin = module.default || module;
		yield* register(plugin).pipe(
			Effect.catchAll(() => Effect.succeed(undefined)),
		);
	});
}

export function register(plugin: Plugin): Effect.Effect<void, never, never> {
	return Effect.gen(function* () {
		const result = plugin.setup();
		if (Effect.isEffect(result)) {
			yield* result;
		}
		registry.registerPlugin(plugin);
	});
}

export function unregister(name: string): Effect.Effect<void, never, never> {
	return Effect.gen(function* () {
		const plugin = registry.getPlugin(name);
		if (plugin?.cleanup) {
			const result = plugin.cleanup();
			if (Effect.isEffect(result)) {
				yield* result;
			}
		}
	});
}
