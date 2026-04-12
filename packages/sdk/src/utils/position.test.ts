import { describe, expect, test } from "bun:test";

import {
  position,
  positionEquals,
  positionCompare,
  positionIsBefore,
  positionIsAfter,
  range,
  rangeFromCoords,
  rangeEquals,
  rangeIsEmpty,
  rangeContainsPosition,
  rangeContainsRange,
  rangeIntersects,
  rangeIntersection,
  rangeNormalize,
  cursorRange,
  rangeLineSpan,
} from "./position";

describe("position", () => {
  test("creates position with line and column", () => {
    const pos = position(5, 10);
    expect(pos.line).toBe(5);
    expect(pos.column).toBe(10);
  });

  test("creates position with zero values", () => {
    const pos = position(0, 0);
    expect(pos.line).toBe(0);
    expect(pos.column).toBe(0);
  });
});

describe("positionEquals", () => {
  test("returns true for equal positions", () => {
    const a = position(3, 5);
    const b = position(3, 5);
    expect(positionEquals(a, b)).toBe(true);
  });

  test("returns false for unequal line", () => {
    const a = position(3, 5);
    const b = position(4, 5);
    expect(positionEquals(a, b)).toBe(false);
  });

  test("returns false for unequal column", () => {
    const a = position(3, 5);
    const b = position(3, 6);
    expect(positionEquals(a, b)).toBe(false);
  });

  test("returns false when both differ", () => {
    const a = position(3, 5);
    const b = position(4, 6);
    expect(positionEquals(a, b)).toBe(false);
  });
});

describe("positionCompare", () => {
  test("returns zero for equal positions", () => {
    const a = position(3, 5);
    const b = position(3, 5);
    expect(positionCompare(a, b)).toBe(0);
  });

  test("returns negative when a line < b line", () => {
    const a = position(2, 10);
    const b = position(3, 5);
    expect(positionCompare(a, b)).toBeLessThan(0);
  });

  test("returns positive when a line > b line", () => {
    const a = position(4, 5);
    const b = position(3, 10);
    expect(positionCompare(a, b)).toBeGreaterThan(0);
  });

  test("returns negative when same line and a column < b column", () => {
    const a = position(3, 3);
    const b = position(3, 5);
    expect(positionCompare(a, b)).toBeLessThan(0);
  });

  test("returns positive when same line and a column > b column", () => {
    const a = position(3, 7);
    const b = position(3, 5);
    expect(positionCompare(a, b)).toBeGreaterThan(0);
  });

  test("compares by line first, then column", () => {
    const a = position(2, 100);
    const b = position(3, 1);
    expect(positionCompare(a, b)).toBeLessThan(0);
  });
});

describe("positionIsBefore", () => {
  test("returns true when position is before", () => {
    const a = position(2, 5);
    const b = position(3, 5);
    expect(positionIsBefore(a, b)).toBe(true);
  });

  test("returns true when same line but before column", () => {
    const a = position(3, 3);
    const b = position(3, 5);
    expect(positionIsBefore(a, b)).toBe(true);
  });

  test("returns false when position is after", () => {
    const a = position(4, 5);
    const b = position(3, 5);
    expect(positionIsBefore(a, b)).toBe(false);
  });

  test("returns false when positions are equal", () => {
    const a = position(3, 5);
    const b = position(3, 5);
    expect(positionIsBefore(a, b)).toBe(false);
  });
});

describe("positionIsAfter", () => {
  test("returns true when position is after", () => {
    const a = position(4, 5);
    const b = position(3, 5);
    expect(positionIsAfter(a, b)).toBe(true);
  });

  test("returns true when same line but after column", () => {
    const a = position(3, 7);
    const b = position(3, 5);
    expect(positionIsAfter(a, b)).toBe(true);
  });

  test("returns false when position is before", () => {
    const a = position(2, 5);
    const b = position(3, 5);
    expect(positionIsAfter(a, b)).toBe(false);
  });

  test("returns false when positions are equal", () => {
    const a = position(3, 5);
    const b = position(3, 5);
    expect(positionIsAfter(a, b)).toBe(false);
  });
});

describe("range", () => {
  test("creates range with start and end positions", () => {
    const start = position(0, 0);
    const end = position(0, 10);
    const r = range(start, end);
    expect(r.start).toBe(start);
    expect(r.end).toBe(end);
  });

  test("creates range spanning multiple lines", () => {
    const start = position(0, 5);
    const end = position(3, 10);
    const r = range(start, end);
    expect(r.start.line).toBe(0);
    expect(r.end.line).toBe(3);
  });
});

describe("rangeFromCoords", () => {
  test("creates range from coordinates", () => {
    const r = rangeFromCoords(0, 0, 0, 10);
    expect(r.start.line).toBe(0);
    expect(r.start.column).toBe(0);
    expect(r.end.line).toBe(0);
    expect(r.end.column).toBe(10);
  });

  test("creates multi-line range from coordinates", () => {
    const r = rangeFromCoords(1, 5, 3, 15);
    expect(r.start.line).toBe(1);
    expect(r.start.column).toBe(5);
    expect(r.end.line).toBe(3);
    expect(r.end.column).toBe(15);
  });
});

describe("rangeEquals", () => {
  test("returns true for equal ranges", () => {
    const a = range(position(0, 0), position(0, 10));
    const b = range(position(0, 0), position(0, 10));
    expect(rangeEquals(a, b)).toBe(true);
  });

  test("returns false when start differs", () => {
    const a = range(position(0, 0), position(0, 10));
    const b = range(position(1, 0), position(0, 10));
    expect(rangeEquals(a, b)).toBe(false);
  });

  test("returns false when end differs", () => {
    const a = range(position(0, 0), position(0, 10));
    const b = range(position(0, 0), position(0, 11));
    expect(rangeEquals(a, b)).toBe(false);
  });

  test("returns false when both differ", () => {
    const a = range(position(0, 0), position(0, 10));
    const b = range(position(1, 5), position(2, 15));
    expect(rangeEquals(a, b)).toBe(false);
  });
});

describe("rangeIsEmpty", () => {
  test("returns true for empty range", () => {
    const pos = position(5, 10);
    const r = range(pos, pos);
    expect(rangeIsEmpty(r)).toBe(true);
  });

  test("returns true for zero-length range", () => {
    const r = cursorRange(position(3, 5));
    expect(rangeIsEmpty(r)).toBe(true);
  });

  test("returns false for non-empty range", () => {
    const r = range(position(0, 0), position(0, 1));
    expect(rangeIsEmpty(r)).toBe(false);
  });

  test("returns false for multi-line non-empty range", () => {
    const r = range(position(0, 5), position(1, 5));
    expect(rangeIsEmpty(r)).toBe(false);
  });
});

describe("range position accessors", () => {
  test("extracts start position from range", () => {
    const start = position(2, 5);
    const end = position(3, 10);
    const r = range(start, end);
    expect(r.start.line).toBe(2);
    expect(r.start.column).toBe(5);
  });

  test("extracts end position from range", () => {
    const start = position(2, 5);
    const end = position(3, 10);
    const r = range(start, end);
    expect(r.end.line).toBe(3);
    expect(r.end.column).toBe(10);
  });
});

describe("rangeContainsPosition", () => {
  test("returns true for position inside range", () => {
    const r = range(position(0, 0), position(0, 10));
    const pos = position(0, 5);
    expect(rangeContainsPosition(r, pos)).toBe(true);
  });

  test("returns true for position at start", () => {
    const r = range(position(2, 5), position(3, 10));
    const pos = position(2, 5);
    expect(rangeContainsPosition(r, pos)).toBe(true);
  });

  test("returns false for position at end", () => {
    const r = range(position(0, 0), position(0, 10));
    const pos = position(0, 10);
    expect(rangeContainsPosition(r, pos)).toBe(false);
  });

  test("returns false for position before range", () => {
    const r = range(position(1, 5), position(3, 10));
    const pos = position(0, 5);
    expect(rangeContainsPosition(r, pos)).toBe(false);
  });

  test("returns false for position after range", () => {
    const r = range(position(0, 0), position(0, 5));
    const pos = position(0, 10);
    expect(rangeContainsPosition(r, pos)).toBe(false);
  });

  test("returns false for position outside line range", () => {
    const r = range(position(2, 0), position(2, 10));
    const pos = position(3, 5);
    expect(rangeContainsPosition(r, pos)).toBe(false);
  });

  test("handles same line different column", () => {
    const r = range(position(5, 10), position(5, 20));
    expect(rangeContainsPosition(r, position(5, 15))).toBe(true);
    expect(rangeContainsPosition(r, position(5, 5))).toBe(false);
    expect(rangeContainsPosition(r, position(5, 25))).toBe(false);
  });

  test("handles same column different line", () => {
    const r = range(position(2, 5), position(4, 5));
    expect(rangeContainsPosition(r, position(3, 5))).toBe(true);
    expect(rangeContainsPosition(r, position(1, 5))).toBe(false);
    expect(rangeContainsPosition(r, position(5, 5))).toBe(false);
  });
});

describe("rangeContainsRange", () => {
  test("returns true when inner range is fully contained", () => {
    const outer = range(position(0, 0), position(10, 0));
    const inner = range(position(2, 5), position(5, 10));
    expect(rangeContainsRange(outer, inner)).toBe(true);
  });

  test("returns true for equal ranges", () => {
    const a = range(position(0, 0), position(5, 0));
    const b = range(position(0, 0), position(5, 0));
    expect(rangeContainsRange(a, b)).toBe(true);
  });

  test("returns false when inner starts before outer", () => {
    const outer = range(position(2, 0), position(10, 0));
    const inner = range(position(0, 5), position(5, 10));
    expect(rangeContainsRange(outer, inner)).toBe(false);
  });

  test("returns false when inner ends after outer", () => {
    const outer = range(position(0, 0), position(5, 0));
    const inner = range(position(2, 5), position(10, 10));
    expect(rangeContainsRange(outer, inner)).toBe(false);
  });
});

describe("rangeIntersects", () => {
  test("returns true for overlapping ranges", () => {
    const a = range(position(0, 0), position(5, 0));
    const b = range(position(3, 0), position(8, 0));
    expect(rangeIntersects(a, b)).toBe(true);
  });

  test("returns true when one range contains the other", () => {
    const a = range(position(0, 0), position(10, 0));
    const b = range(position(3, 0), position(5, 0));
    expect(rangeIntersects(a, b)).toBe(true);
  });

  test("returns false for non-overlapping ranges", () => {
    const a = range(position(0, 0), position(3, 0));
    const b = range(position(5, 0), position(8, 0));
    expect(rangeIntersects(a, b)).toBe(false);
  });

  test("returns true for adjacent ranges (touching at endpoint)", () => {
    const a = range(position(0, 0), position(3, 0));
    const b = range(position(3, 0), position(5, 0));
    expect(rangeIntersects(a, b)).toBe(true);
  });
});

describe("rangeIntersection", () => {
  test("returns intersection of overlapping ranges", () => {
    const a = range(position(0, 0), position(5, 10));
    const b = range(position(3, 5), position(8, 0));
    const result = rangeIntersection(a, b);
    expect(result).not.toBeUndefined();
    expect(positionEquals(result!.start, position(3, 5))).toBe(true);
    expect(positionEquals(result!.end, position(5, 10))).toBe(true);
  });

  test("returns undefined for non-overlapping ranges", () => {
    const a = range(position(0, 0), position(3, 0));
    const b = range(position(5, 0), position(8, 0));
    expect(rangeIntersection(a, b)).toBeUndefined();
  });

  test("returns same range when ranges are equal", () => {
    const a = range(position(2, 5), position(4, 10));
    const b = range(position(2, 5), position(4, 10));
    const result = rangeIntersection(a, b);
    expect(rangeEquals(result!, a)).toBe(true);
  });
});

describe("rangeNormalize", () => {
  test("returns same range when start is before end", () => {
    const r = range(position(0, 0), position(5, 10));
    const normalized = rangeNormalize(r);
    expect(rangeEquals(normalized, r)).toBe(true);
  });

  test("swaps start and end when start is after end", () => {
    const r = range(position(5, 10), position(0, 0));
    const normalized = rangeNormalize(r);
    expect(positionEquals(normalized.start, position(0, 0))).toBe(true);
    expect(positionEquals(normalized.end, position(5, 10))).toBe(true);
  });

  test("returns same range when start equals end", () => {
    const r = cursorRange(position(3, 5));
    const normalized = rangeNormalize(r);
    expect(rangeEquals(normalized, r)).toBe(true);
  });
});

describe("cursorRange", () => {
  test("creates zero-width range at position", () => {
    const pos = position(3, 5);
    const r = cursorRange(pos);
    expect(positionEquals(r.start, pos)).toBe(true);
    expect(positionEquals(r.end, pos)).toBe(true);
    expect(rangeIsEmpty(r)).toBe(true);
  });
});

describe("rangeLineSpan", () => {
  test("returns 0 for single line range", () => {
    const r = range(position(5, 0), position(5, 10));
    expect(rangeLineSpan(r)).toBe(0);
  });

  test("returns correct span for multi-line range", () => {
    const r = range(position(2, 0), position(5, 0));
    expect(rangeLineSpan(r)).toBe(3);
  });

  test("returns 0 for empty range", () => {
    const r = cursorRange(position(3, 5));
    expect(rangeLineSpan(r)).toBe(0);
  });

  test("returns positive for same column different line", () => {
    const r = range(position(2, 5), position(5, 5));
    expect(rangeLineSpan(r)).toBe(3);
  });
});
