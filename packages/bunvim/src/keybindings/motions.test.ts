import { describe, expect, it } from "bun:test";
import * as Buffer from "../core/buffer";
import * as Motions from "./motions";

describe("Motions", () => {
	const buffer = Buffer.createState("hello world\nline two\n\nline four");

	it("moves left", () => {
		const pos = { line: 0, column: 5 }; // ' '
		const res = Motions.left(buffer, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 4 });
	});

	it("moves right", () => {
		const pos = { line: 0, column: 5 }; // ' '
		const res = Motions.right(buffer, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 6 });
	});

	it("moves down", () => {
		const pos = { line: 0, column: 0 };
		const res = Motions.down(buffer, pos, 1);
		expect(res.position).toEqual({ line: 1, column: 0 });
	});

	it("moves up", () => {
		const pos = { line: 1, column: 0 };
		const res = Motions.up(buffer, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 0 });
	});

	it("goes to line start", () => {
		const pos = { line: 0, column: 5 };
		const res = Motions.lineStart(buffer, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 0 });
	});

	it("goes to line end", () => {
		const pos = { line: 0, column: 0 };
		const res = Motions.lineEnd(buffer, pos, 1);
		// "hello world".length = 11, max index 10
		expect(res.position).toEqual({ line: 0, column: 10 });
	});

	it("goes to first non-blank", () => {
		const buf = Buffer.createState("  indent");
		const pos = { line: 0, column: 0 };
		const res = Motions.firstNonBlank(buf, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 2 });
	});

	it("moves by word forward", () => {
		const pos = { line: 0, column: 0 }; // 'h'
		const res = Motions.wordForward(buffer, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 6 }); // 'w'
	});

	it("moves by word backward", () => {
		const pos = { line: 0, column: 6 }; // 'w'
		const res = Motions.wordBackward(buffer, pos, 1);
		expect(res.position).toEqual({ line: 0, column: 0 }); // 'h'
	});

	it("handles paragraph motion", () => {
		// "hello world\nline two\n\nline four"
		// 0: hello world
		// 1: line two
		// 2:
		// 3: line four
		const pos = { line: 0, column: 0 };
		const res = Motions.paragraphForward(buffer, pos, 1);
		// Should stop at the blank line 2? Or after it?
		// Logic: while ... if inBlank && !isBlank ... else if !inBlank && isBlank -> stop.
		// Start: line 0 (!inBlank). line 1 (!inBlank). line 2 (isBlank) -> stop.
		expect(res.position.line).toBe(2);
	});
});
