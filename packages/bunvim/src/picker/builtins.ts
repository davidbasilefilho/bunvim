import { Effect, pipe } from "effect";
import * as Buffer from "../core/buffer";
import { runCommand } from "../utils/shell";
import type { PickerSource } from "./source";

export const bufferSource: PickerSource = {
	name: "Buffers",
	getItems: (_query: string) =>
		Effect.succeed(
			Buffer.getListedBuffers().map((buf) => ({
				text: buf.props.name || buf.props.path || "[No Name]",
				data: { bufId: buf.id },
			})),
		),
};

export const filesSource: PickerSource = {
	name: "Files",
	getItems: (_query: string) =>
		pipe(
			runCommand([
				"fd",
				"--type",
				"f",
				"--hidden",
				"--exclude",
				".git",
				"--exclude",
				"node_modules",
			]),
			Effect.map((output) =>
				output
					.split("\n")
					.filter(Boolean)
					.map((file) => ({
						text: file,
						data: { file },
					})),
			),
			Effect.catchAll(() => Effect.succeed([])),
		),
};

export const grepSource = (file?: string): PickerSource => ({
	name: file ? `Grep: ${file}` : "Grep",
	getItems: (query: string) => {
		if (query.length < 2) return Effect.succeed([]);

		const args = ["rg", "--vimgrep", "--smart-case", query];
		if (file) {
			args.push(file);
		}
		return pipe(
			runCommand(args),
			Effect.map((output) =>
				output
					.split("\n")
					.filter(Boolean)
					.slice(0, 100)
					.map((line) => {
						const parts = line.split(":");
						const fileName = parts[0] || "";
						const lineNum = parts[1] || "1";
						const col = parts[2] || "1";
						const rest = parts.slice(3).join(":");
						return {
							text: file
								? `${lineNum}: ${rest.trim()}`
								: `${fileName}:${lineNum}: ${rest.trim()}`,
							data: {
								file: fileName,
								line: Number.parseInt(lineNum, 10),
								col: Number.parseInt(col, 10),
							},
						};
					}),
			),
			Effect.catchAll(() => Effect.succeed([])),
		);
	},
});

export const commandSource: PickerSource = {
	name: "Commands",
	getItems: (_query: string) =>
		Effect.succeed([
			{ text: "q" },
			{ text: "w" },
			{ text: "wq" },
			{ text: "help" },
		]),
};
