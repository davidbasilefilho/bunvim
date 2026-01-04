import { existsSync, readdirSync, renameSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Console, Effect } from "effect";

const homedir = os.homedir();
const cache = path.join(homedir, ".cache", "bvim");
const grammars = path.join(cache, "grammars");

const fixGrammar = (pkgName: string) =>
	Effect.gen(function* (_) {
		yield* _(Console.log(`Fixing ${pkgName}`));
		const pkgPath = path.join(grammars, "node_modules", pkgName);
		yield* _(Console.log(`pkgPath: ${pkgPath}`));

		const exists = yield* _(Effect.try(() => existsSync(pkgPath)));

		if (exists) {
			yield* _(Console.log("pkgPath exists"));
		} else {
			yield* _(Console.log("pkgPath DOES NOT exist"));
			return;
		}

		const prebuilds = path.join(pkgPath, "prebuilds");
		const hasPrebuilds = yield* _(Effect.try(() => existsSync(prebuilds)));

		if (hasPrebuilds) {
			const platforms = yield* _(Effect.try(() => readdirSync(prebuilds)));
			yield* _(Console.log(`Platforms: ${platforms}`));

			for (const platform of platforms) {
				const platformDir = path.join(prebuilds, platform);
				const isDir = yield* _(
					Effect.try(() => statSync(platformDir).isDirectory()),
				);

				if (isDir) {
					const files = yield* _(Effect.try(() => readdirSync(platformDir)));
					yield* _(Console.log(`Files in ${platform}: ${files}`));

					for (const file of files) {
						if (file.includes("+") && file.endsWith(".node")) {
							const newName = file.split("+").pop();
							if (newName) {
								yield* _(
									Console.log(
										`Renaming ${file} to ${newName} in ${platformDir}`,
									),
								);
								yield* _(
									Effect.try(() =>
										renameSync(
											path.join(platformDir, file),
											path.join(platformDir, newName),
										),
									),
								);
							}
						}
					}
				}
			}
		} else {
			yield* _(Console.log("No prebuilds dir found"));
		}
	}).pipe(
		Effect.catchAll((e) =>
			Console.error(`Failed to fix grammar ${pkgName}`, e),
		),
	);

const program = Effect.gen(function* (_) {
	yield* _(fixGrammar("@tree-sitter-grammars/tree-sitter-yaml"));
	yield* _(fixGrammar("@tree-sitter-grammars/tree-sitter-toml"));
});

Effect.runPromise(program);
