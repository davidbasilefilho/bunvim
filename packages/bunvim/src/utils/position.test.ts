import { describe, expect, it } from "bun:test";
import * as Position from "./position";

describe("Position", () => {
	it("creates a position", () => {
		const p = Position.position(1, 2);
		expect(p).toEqual({ line: 1, column: 2 });
	});

	it("checks equality", () => {
		const p1 = Position.position(1, 2);
		const p2 = Position.position(1, 2);
		const p3 = Position.position(2, 2);
		expect(Position.positionEquals(p1, p2)).toBe(true);
		expect(Position.positionEquals(p1, p3)).toBe(false);
	});

	it("compares positions", () => {
		const p1 = Position.position(1, 2);
		const p2 = Position.position(1, 3);
		const p3 = Position.position(2, 1);

		expect(Position.positionCompare(p1, p2)).toBeLessThan(0);
		expect(Position.positionCompare(p2, p1)).toBeGreaterThan(0);
		expect(Position.positionCompare(p1, p1)).toBe(0);
		expect(Position.positionCompare(p2, p3)).toBeLessThan(0);
	});

	it("checks isBefore/isAfter", () => {
		const p1 = Position.position(1, 2);
		const p2 = Position.position(1, 3);

		expect(Position.positionIsBefore(p1, p2)).toBe(true);
		expect(Position.positionIsAfter(p2, p1)).toBe(true);
	});
});

describe("Range", () => {
	it("creates a range", () => {
		const start = Position.position(0, 0);
		const end = Position.position(1, 1);
		const r = Position.range(start, end);
		expect(r).toEqual({ start, end });
	});

	it("creates range from coords", () => {
		const r = Position.rangeFromCoords(0, 0, 1, 1);
		expect(r).toEqual({
			start: { line: 0, column: 0 },
			end: { line: 1, column: 1 },
		});
	});

	it("checks range equality", () => {
		const r1 = Position.rangeFromCoords(0, 0, 1, 1);
		const r2 = Position.rangeFromCoords(0, 0, 1, 1);
		const r3 = Position.rangeFromCoords(0, 0, 2, 2);
		expect(Position.rangeEquals(r1, r2)).toBe(true);
		expect(Position.rangeEquals(r1, r3)).toBe(false);
	});

	it("checks if range contains position", () => {
		const r = Position.rangeFromCoords(0, 0, 2, 0);
		const p1 = Position.position(1, 0);
		const p2 = Position.position(3, 0);
		expect(Position.rangeContainsPosition(r, p1)).toBe(true);
		expect(Position.rangeContainsPosition(r, p2)).toBe(false);
	});

	it("normalizes range", () => {
		const start = Position.position(2, 0);
		const end = Position.position(0, 0);
		const r = Position.range(start, end);
		const normalized = Position.rangeNormalize(r);
		expect(normalized.start).toEqual(end);
		expect(normalized.end).toEqual(start);
	});
});
