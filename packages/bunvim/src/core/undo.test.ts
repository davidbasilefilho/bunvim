import { beforeEach, describe, expect, it } from "bun:test";
import * as Buffer from "./buffer";
import * as Undo from "./undo";

describe("Undo System", () => {
	beforeEach(() => {
		Undo.init();
	});

	it("initializes correctly", () => {
		const node = Undo.getCurrentNode();
		expect(node).toBeDefined();
		expect(node?.id).toBe(0);
		expect(node?.edits).toEqual([]);
	});

	it("adds entries", () => {
		Undo.addEntry([{ type: "insert", pos: { line: 0, column: 0 }, text: "a" }]);
		const node = Undo.getCurrentNode();
		expect(node?.id).toBe(1);
		expect(node?.parent).toBe(0);
		expect(node?.edits.length).toBe(1);
	});

	it("undoes insertion", () => {
		let buf = Buffer.createState("");
		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Buffer.insertAt(buf, { line: 0, column: 0 }, "hello")!;
		Undo.addEntry([
			{ type: "insert", pos: { line: 0, column: 0 }, text: "hello" },
		]);

		// biome-ignore lint/style/noNonNullAssertion: testing
		const reverted = Undo.undo(buf)!;
		expect(reverted).toBeDefined();
		if (reverted) {
			expect(Buffer.getText(reverted)).toBe("");
		}
	});

	it("undoes deletion", () => {
		let buf = Buffer.createState("hello");
		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Buffer.deleteInRange(buf, {
			start: { line: 0, column: 0 },
			end: { line: 0, column: 5 },
		})!;
		Undo.addEntry([
			{
				type: "delete",
				range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
				text: "hello",
			},
		]);

		// biome-ignore lint/style/noNonNullAssertion: testing
		const reverted = Undo.undo(buf)!;
		expect(reverted).toBeDefined();
		if (reverted) {
			expect(Buffer.getText(reverted)).toBe("hello");
		}
	});

	it("redoes changes", () => {
		let buf = Buffer.createState("");

		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Buffer.insertAt(buf, { line: 0, column: 0 }, "hello")!;
		Undo.addEntry([
			{ type: "insert", pos: { line: 0, column: 0 }, text: "hello" },
		]);

		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Undo.undo(buf)!;
		expect(Buffer.getText(buf)).toBe("");

		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Undo.redo(buf)!;
		expect(Buffer.getText(buf)).toBe("hello");
	});

	it("branches correctly", () => {
		Undo.addEntry([{ type: "insert", pos: { line: 0, column: 0 }, text: "a" }]);
		// biome-ignore lint/style/noNonNullAssertion: testing
		const id1 = Undo.getCurrentNode()!.id;

		let buf = Buffer.createState("a");
		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Undo.undo(buf)!;

		Undo.addEntry([{ type: "insert", pos: { line: 0, column: 0 }, text: "b" }]);
		// biome-ignore lint/style/noNonNullAssertion: testing
		const id2 = Undo.getCurrentNode()!.id;

		expect(id1).not.toBe(id2);

		const root = Undo.getNode(0);
		expect(root?.children).toContain(id1);
		expect(root?.children).toContain(id2);
		expect(root?.children[root.children.length - 1]).toBe(id2);
	});

	it("undoes deletion", () => {
		let buf = Buffer.createState("hello");
		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Buffer.deleteInRange(buf, {
			start: { line: 0, column: 0 },
			end: { line: 0, column: 5 },
		})!;
		Undo.addEntry([
			{
				type: "delete",
				range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
				text: "hello",
			},
		]);

		const reverted = Undo.undo(buf);
		expect(reverted).toBeDefined();
		if (reverted) {
			expect(Buffer.getText(reverted)).toBe("hello");
		}
	});

	it("redoes changes", () => {
		let buf = Buffer.createState("");

		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Buffer.insertAt(buf, { line: 0, column: 0 }, "hello")!;
		Undo.addEntry([
			{ type: "insert", pos: { line: 0, column: 0 }, text: "hello" },
		]);

		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Undo.undo(buf)!;
		expect(Buffer.getText(buf)).toBe("");

		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Undo.redo(buf)!;
		expect(Buffer.getText(buf)).toBe("hello");
	});

	it("branches correctly", () => {
		Undo.addEntry([{ type: "insert", pos: { line: 0, column: 0 }, text: "a" }]);
		const id1 = Undo.getCurrentNode()?.id;

		let buf = Buffer.createState("a");
		// biome-ignore lint/style/noNonNullAssertion: testing
		buf = Undo.undo(buf)!;

		Undo.addEntry([{ type: "insert", pos: { line: 0, column: 0 }, text: "b" }]);
		const id2 = Undo.getCurrentNode()?.id;

		expect(id1).not.toBe(id2);

		const root = Undo.getNode(0);
		expect(root?.children).toContain(id1);
		expect(root?.children).toContain(id2);
		expect(root?.children[root.children.length - 1]).toBe(id2);
	});
});
