import { describe, expect, it } from "bun:test";
import * as Rope from "./rope";

describe("Rope", () => {
	it("creates an empty rope", () => {
		const r = Rope.empty();
		expect(Rope.getText(r)).toBe("");
		expect(Rope.length(r)).toBe(0);
		expect(Rope.lineCount(r)).toBe(1);
	});

	it("creates a rope from string", () => {
		const text = "Hello\nWorld";
		const r = Rope.fromString(text);
		expect(Rope.getText(r)).toBe(text);
		expect(Rope.length(r)).toBe(text.length);
		expect(Rope.lineCount(r)).toBe(2);
	});

	it("gets line content", () => {
		const r = Rope.fromString("line1\nline2\nline3");
		expect(Rope.getLine(r, 0)).toBe("line1");
		expect(Rope.getLine(r, 1)).toBe("line2");
		expect(Rope.getLine(r, 2)).toBe("line3");
		expect(Rope.getLine(r, 3)).toBeUndefined();
	});

	it("gets line length", () => {
		const r = Rope.fromString("abc\ndef");
		expect(Rope.getLineLength(r, 0)).toBe(3);
		expect(Rope.getLineLength(r, 1)).toBe(3);
		expect(Rope.getLineLength(r, 2)).toBeUndefined();
	});

	it("converts offset to position", () => {
		const r = Rope.fromString("abc\ndef");
		// "a" at 0 -> 0,0
		expect(Rope.offsetToPosition(r, 0)).toEqual({ line: 0, column: 0 });
		// "b" at 1 -> 0,1
		expect(Rope.offsetToPosition(r, 1)).toEqual({ line: 0, column: 1 });
		// "\n" at 3 -> 0,3
		expect(Rope.offsetToPosition(r, 3)).toEqual({ line: 0, column: 3 });
		// "d" at 4 -> 1,0
		expect(Rope.offsetToPosition(r, 4)).toEqual({ line: 1, column: 0 });
		// EOF at 7 -> 1,3
		expect(Rope.offsetToPosition(r, 7)).toEqual({ line: 1, column: 3 });
		// Out of bounds
		expect(Rope.offsetToPosition(r, 8)).toBeUndefined();
	});

	it("converts position to offset", () => {
		const r = Rope.fromString("abc\ndef");
		expect(Rope.positionToOffset(r, { line: 0, column: 0 })).toBe(0);
		expect(Rope.positionToOffset(r, { line: 0, column: 3 })).toBe(3);
		expect(Rope.positionToOffset(r, { line: 1, column: 0 })).toBe(4);
		expect(Rope.positionToOffset(r, { line: 1, column: 3 })).toBe(7);
		expect(Rope.positionToOffset(r, { line: 2, column: 0 })).toBeUndefined();
	});

	it("inserts text", () => {
		const r = Rope.fromString("Hello World");
		const r2 = Rope.insert(r, 6, "Beautiful ");
		expect(Rope.getText(r2)).toBe("Hello Beautiful World");
	});

	it("deletes range", () => {
		const r = Rope.fromString("Hello Beautiful World");
		const r2 = Rope.deleteRange(r, 6, 16);
		expect(Rope.getText(r2)).toBe("Hello World");
	});

	it("replaces range", () => {
		const r = Rope.fromString("Hello World");
		const r2 = Rope.replace(r, 6, 11, "Bunvim");
		expect(Rope.getText(r2)).toBe("Hello Bunvim");
	});

	it("slices text", () => {
		const r = Rope.fromString("Hello World");
		expect(Rope.slice(r, 0, 5)).toBe("Hello");
		expect(Rope.slice(r, 6)).toBe("World");
	});
});
