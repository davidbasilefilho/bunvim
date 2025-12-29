import {
	type Position,
	position,
	positionCompare,
	positionEquals,
	type Range,
	range,
} from "../utils/position";

/**
 * A selection with anchor and head positions.
 * Anchor is where the selection started, head is where the cursor is.
 * In Neovim, visual mode selections include the character under the cursor.
 *
 * @example
 * ```typescript
 * // Cursor at line 0, column 5 (no selection)
 * const cursor = selection(position(0, 5), position(0, 5))
 *
 * // Visual selection from column 2 to column 5
 * const visual = selection(position(0, 2), position(0, 5))
 * ```
 */
export type Selection = {
	readonly anchor: Position;
	readonly head: Position;
};

/**
 * Create a new selection.
 *
 * @param anchor - Where the selection started
 * @param head - Where the cursor is (end of selection)
 */
export const selection = (anchor: Position, head: Position): Selection => ({
	anchor,
	head,
});

/**
 * Create a cursor (zero-width selection at a position).
 *
 * @example
 * ```typescript
 * const cur = cursor(0, 5)  // Line 0, column 5
 * ```
 */
export const cursor = (line: number, column: number): Selection => {
	const pos = position(line, column);
	return selection(pos, pos);
};

/**
 * Create a selection from a position.
 */
export const cursorAt = (pos: Position): Selection => selection(pos, pos);

/**
 * Check if selection is collapsed (cursor, no selection).
 */
export const isCollapsed = (sel: Selection): boolean =>
	positionEquals(sel.anchor, sel.head);

/**
 * Check if two selections are equal.
 */
export const selectionEquals = (a: Selection, b: Selection): boolean =>
	positionEquals(a.anchor, b.anchor) && positionEquals(a.head, b.head);

/**
 * Get the normalized range of a selection (start before end).
 * The range is inclusive of both start and end for Neovim visual mode semantics.
 */
export const selectionToRange = (sel: Selection): Range => {
	const cmp = positionCompare(sel.anchor, sel.head);
	if (cmp <= 0) {
		return range(sel.anchor, sel.head);
	}
	return range(sel.head, sel.anchor);
};

/**
 * Get the start position of a selection (minimum of anchor and head).
 */
export const selectionStart = (sel: Selection): Position => {
	const cmp = positionCompare(sel.anchor, sel.head);
	return cmp <= 0 ? sel.anchor : sel.head;
};

/**
 * Get the end position of a selection (maximum of anchor and head).
 */
export const selectionEnd = (sel: Selection): Position => {
	const cmp = positionCompare(sel.anchor, sel.head);
	return cmp <= 0 ? sel.head : sel.anchor;
};

/**
 * Check if selection is forward (anchor before head).
 */
export const isForward = (sel: Selection): boolean =>
	positionCompare(sel.anchor, sel.head) <= 0;

/**
 * Check if selection is backward (anchor after head).
 */
export const isBackward = (sel: Selection): boolean =>
	positionCompare(sel.anchor, sel.head) > 0;

/**
 * Move selection head to a new position (extends selection).
 */
export const extendTo = (sel: Selection, newHead: Position): Selection =>
	selection(sel.anchor, newHead);

/**
 * Collapse selection to its head position.
 */
export const collapseToHead = (sel: Selection): Selection =>
	selection(sel.head, sel.head);

/**
 * Collapse selection to its anchor position.
 */
export const collapseToAnchor = (sel: Selection): Selection =>
	selection(sel.anchor, sel.anchor);

/**
 * Collapse selection to its start position.
 */
export const collapseToStart = (sel: Selection): Selection => {
	const start = selectionStart(sel);
	return selection(start, start);
};

/**
 * Collapse selection to its end position.
 */
export const collapseToEnd = (sel: Selection): Selection => {
	const end = selectionEnd(sel);
	return selection(end, end);
};

/**
 * Flip anchor and head.
 */
export const flip = (sel: Selection): Selection =>
	selection(sel.head, sel.anchor);

/**
 * Move both anchor and head by delta.
 */
export const translate = (
	sel: Selection,
	deltaLine: number,
	deltaColumn: number,
): Selection =>
	selection(
		position(sel.anchor.line + deltaLine, sel.anchor.column + deltaColumn),
		position(sel.head.line + deltaLine, sel.head.column + deltaColumn),
	);

/**
 * Move cursor (collapsed selection) to a new position.
 */
export const moveTo = (_sel: Selection, newPos: Position): Selection =>
	selection(newPos, newPos);

/**
 * Selection direction for visual mode.
 */
export type SelectionDirection = "forward" | "backward";

/**
 * Get the direction of a selection.
 */
export const direction = (sel: Selection): SelectionDirection =>
	isForward(sel) ? "forward" : "backward";

/**
 * Multiple selections (for multi-cursor support).
 * Primary selection is the last one in the array.
 */
export type Selections = {
	readonly selections: readonly Selection[];
};

/**
 * Create single selection.
 */
export const single = (sel: Selection): Selections => ({
	selections: [sel],
});

/**
 * Get the primary (main) selection.
 */
export const primary = (sels: Selections): Selection =>
	sels.selections[sels.selections.length - 1] ?? cursor(0, 0);

/**
 * Add a selection.
 */
export const add = (sels: Selections, sel: Selection): Selections => ({
	selections: [...sels.selections, sel],
});

/**
 * Map over all selections.
 */
export const map = (
	sels: Selections,
	fn: (sel: Selection, index: number) => Selection,
): Selections => ({
	selections: sels.selections.map(fn),
});

/**
 * Reduce selections to a single value.
 */
export const reduce = <T>(
	sels: Selections,
	fn: (acc: T, sel: Selection, index: number) => T,
	initial: T,
): T => sels.selections.reduce(fn, initial);
