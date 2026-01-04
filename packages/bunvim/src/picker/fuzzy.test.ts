import { describe, expect, it } from "bun:test";
import { fuzzyMatch } from "./fuzzy";

describe("Fuzzy Match", () => {
	it("matches exact substring", () => {
		expect(fuzzyMatch("test", "this is a test")).toBe(100);
	});

	it("matches fuzzy", () => {
		expect(fuzzyMatch("fb", "foobar")).toBeGreaterThan(0);
		expect(fuzzyMatch("bun", "bunvim")).toBeGreaterThan(0);
	});

	it("fails on non-match", () => {
		expect(fuzzyMatch("xyz", "abc")).toBe(0);
	});

	it("scores better for consecutive matches", () => {
		const score1 = fuzzyMatch("abc", "abcde"); // Consecutive
		const score2 = fuzzyMatch("abc", "axbxc"); // Non-consecutive
		expect(score1).toBeGreaterThan(score2);
	});

	it("is case insensitive", () => {
		expect(fuzzyMatch("Test", "test")).toBe(100);
		expect(fuzzyMatch("test", "TEST")).toBe(100);
	});
});
