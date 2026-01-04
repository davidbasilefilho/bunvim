import { describe, expect, it } from "bun:test";
import * as Buffer from "./buffer";

describe("Buffer Core", () => {
	it("creates a buffer state", () => {
		const state = Buffer.createState("hello world");
		expect(Buffer.getText(state)).toBe("hello world");
		expect(state.modified).toBe(false);
		expect(state.version).toBe(0);
	});

	it("inserts text", () => {
		const state = Buffer.createState("hello world");
		const newState = Buffer.insertAt(
			state,
			{ line: 0, column: 5 },
			" beautiful",
		);
		expect(newState).toBeDefined();
		if (newState) {
			expect(Buffer.getText(newState)).toBe("hello beautiful world");
			expect(newState.modified).toBe(true);
			expect(newState.version).toBe(1);
		}
	});

	it("deletes text", () => {
		const state = Buffer.createState("hello beautiful world");
		const newState = Buffer.deleteInRange(state, {
			start: { line: 0, column: 5 },
			end: { line: 0, column: 15 },
		});
		expect(newState).toBeDefined();
		if (newState) {
			expect(Buffer.getText(newState)).toBe("hello world");
			expect(newState.modified).toBe(true);
		}
	});

	it("replaces text", () => {
		const state = Buffer.createState("hello world");
		const newState = Buffer.replaceInRange(
			state,
			{ start: { line: 0, column: 6 }, end: { line: 0, column: 11 } },
			"bunvim",
		);
		expect(newState).toBeDefined();
		if (newState) {
			expect(Buffer.getText(newState)).toBe("hello bunvim");
		}
	});

	it("gets text in range", () => {
		const state = Buffer.createState("line1\nline2\nline3");
		const text = Buffer.getTextInRange(state, {
			start: { line: 0, column: 0 },
			end: { line: 1, column: 0 },
		});
		expect(text).toBe("line1\n");
	});

	it("handles multiline operations", () => {
		const state = Buffer.createState("line1\nline2");
		const newState = Buffer.insertAt(
			state,
			{ line: 0, column: 5 },
			"\ninserted",
		);
		expect(newState).toBeDefined();
		if (newState) {
			expect(Buffer.getText(newState)).toBe("line1\ninserted\nline2");
			expect(Buffer.lineCount(newState)).toBe(3);
		}
	});
});
