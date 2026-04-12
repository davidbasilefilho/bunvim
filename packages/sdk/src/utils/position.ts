/**
 * Zero-indexed line and column position in a text buffer.
 *
 * @example
 *   ```typescript
 *   const pos: Position = { line: 0, column: 5 };
 *   ```;
 */
export type Position = {
  readonly line: number;
  readonly column: number;
};

/**
 * Create a new position.
 *
 * @example
 *   ```typescript
 *   const pos = position(0, 5);
 *   ```;
 */
export const position = (line: number, column: number): Position => ({
  line,
  column,
});

/** Check if two positions are equal. */
export const positionEquals = (a: Position, b: Position): boolean =>
  a.line === b.line && a.column === b.column;

/** Compare two positions. Returns negative if a < b, positive if a > b, zero if equal. */
export const positionCompare = (a: Position, b: Position): number => {
  if (a.line !== b.line) return a.line - b.line;
  return a.column - b.column;
};

/** Check if position a is before position b. */
export const positionIsBefore = (a: Position, b: Position): boolean => positionCompare(a, b) < 0;

/** Check if position a is after position b. */
export const positionIsAfter = (a: Position, b: Position): boolean => positionCompare(a, b) > 0;

/**
 * A range between two positions (start inclusive, end exclusive).
 *
 * @example
 *   ```typescript
 *   const range: Range = {
 *     start: { line: 0, column: 0 },
 *     end: { line: 0, column: 10 },
 *   };
 *   ```;
 */
export type Range = {
  readonly start: Position;
  readonly end: Position;
};

/**
 * Create a new range.
 *
 * @example
 *   ```typescript
 *   const r = range(position(0, 0), position(0, 10));
 *   ```;
 */
export const range = (start: Position, end: Position): Range => ({
  start,
  end,
});

/**
 * Create a range from line/column coordinates.
 *
 * @example
 *   ```typescript
 *   const r = rangeFromCoords(0, 0, 0, 10);
 *   ```;
 */
export const rangeFromCoords = (
  startLine: number,
  startColumn: number,
  endLine: number,
  endColumn: number,
): Range => ({
  start: position(startLine, startColumn),
  end: position(endLine, endColumn),
});

/** Check if two ranges are equal. */
export const rangeEquals = (a: Range, b: Range): boolean =>
  positionEquals(a.start, b.start) && positionEquals(a.end, b.end);

/** Check if a range is empty (start equals end). */
export const rangeIsEmpty = (r: Range): boolean => positionEquals(r.start, r.end);

/** Check if a position is contained within a range. */
export const rangeContainsPosition = (r: Range, pos: Position): boolean => {
  if (positionIsBefore(pos, r.start)) return false;
  if (positionIsAfter(pos, r.end)) return false;
  if (positionEquals(pos, r.end)) return false;
  return true;
};

/** Check if range a fully contains range b. */
export const rangeContainsRange = (a: Range, b: Range): boolean =>
  !positionIsBefore(b.start, a.start) && !positionIsAfter(b.end, a.end);

/** Check if two ranges intersect. */
export const rangeIntersects = (a: Range, b: Range): boolean =>
  !positionIsAfter(a.start, b.end) && !positionIsBefore(a.end, b.start);

/** Get the intersection of two ranges. Returns undefined if they don't intersect. */
export const rangeIntersection = (a: Range, b: Range): Range | undefined => {
  if (!rangeIntersects(a, b)) return undefined;
  const start = positionIsAfter(a.start, b.start) ? a.start : b.start;
  const end = positionIsBefore(a.end, b.end) ? a.end : b.end;
  return range(start, end);
};

/** Normalize a range so that start is before end. */
export const rangeNormalize = (r: Range): Range => {
  if (positionIsAfter(r.start, r.end)) {
    return range(r.end, r.start);
  }
  return r;
};

/** Create a zero-width range at a position (cursor position). */
export const cursorRange = (pos: Position): Range => range(pos, pos);

/** Get the number of lines spanned by a range (0 = single line). */
export const rangeLineSpan = (r: Range): number => r.end.line - r.start.line;
