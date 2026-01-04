import { beforeEach, describe, expect, it } from "bun:test";
import * as Keymap from "./keymap";

describe("Keymap API", () => {
	beforeEach(() => {});

	it("sets a keymap", () => {
		const handler = () => {};
		Keymap.set("n", "<leader>t", handler);
		const maps = Keymap.get_keymaps();
		const found = maps.find((k) => k.lhs === " t" && k.mode.includes("n"));
		expect(found).toBeDefined();
		expect(found?.rhs).toBe(handler);
	});

	it("expands leader key", () => {
		Keymap.set("n", "<leader>a", "action");
		const maps = Keymap.get_keymaps();
		const found = maps.find((k) => k.lhs === " a");
		expect(found).toBeDefined();
	});

	it("deletes a keymap", () => {
		Keymap.set("n", "todelete", "action");
		expect(
			Keymap.get_keymaps().find((k) => k.lhs === "todelete"),
		).toBeDefined();

		Keymap.del("n", "todelete");
		expect(
			Keymap.get_keymaps().find((k) => k.lhs === "todelete"),
		).toBeUndefined();
	});

	it("handles multiple modes", () => {
		Keymap.set(["n", "v"], "multimode", "action");
		const maps = Keymap.get_keymaps();
		const found = maps.find((k) => k.lhs === "multimode");
		expect(found).toBeDefined();
		expect(found?.mode).toEqual(["n", "v"]);
	});
});
