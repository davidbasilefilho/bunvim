import {
	type Position,
	position,
	positionCompare,
	positionEquals,
	type Range,
	range,
} from "../utils/position";

export type Selection = {
	readonly anchor: Position;
	readonly head: Position;
};

export const selection = (anchor: Position, head: Position): Selection => ({
	anchor,
	head,
});

export const cursor = (line: number, column: number): Selection => {
	const pos = position(line, column);
	return selection(pos, pos);
};

export const cursorAt = (pos: Position): Selection => selection(pos, pos);

export const isCollapsed = (sel: Selection): boolean =>
	positionEquals(sel.anchor, sel.head);

export const selectionEquals = (a: Selection, b: Selection): boolean =>
	positionEquals(a.anchor, b.anchor) && positionEquals(a.head, b.head);

export const selectionToRange = (sel: Selection): Range => {
	const cmp = positionCompare(sel.anchor, sel.head);
	if (cmp <= 0) {
		return range(sel.anchor, sel.head);
	}
	return range(sel.head, sel.anchor);
};

export const selectionStart = (sel: Selection): Position => {
	const cmp = positionCompare(sel.anchor, sel.head);
	return cmp <= 0 ? sel.anchor : sel.head;
};

export const selectionEnd = (sel: Selection): Position => {
	const cmp = positionCompare(sel.anchor, sel.head);
	return cmp <= 0 ? sel.head : sel.anchor;
};

export const isForward = (sel: Selection): boolean =>
	positionCompare(sel.anchor, sel.head) <= 0;

export const isBackward = (sel: Selection): boolean =>
	positionCompare(sel.anchor, sel.head) > 0;

export const extendTo = (sel: Selection, newHead: Position): Selection =>
	selection(sel.anchor, newHead);

export const collapseToHead = (sel: Selection): Selection =>
	selection(sel.head, sel.head);

export const collapseToAnchor = (sel: Selection): Selection =>
	selection(sel.anchor, sel.anchor);

export const collapseToStart = (sel: Selection): Selection => {
	const start = selectionStart(sel);
	return selection(start, start);
};

export const collapseToEnd = (sel: Selection): Selection => {
	const end = selectionEnd(sel);
	return selection(end, end);
};

export const flip = (sel: Selection): Selection =>
	selection(sel.head, sel.anchor);

export const translate = (
	sel: Selection,
	deltaLine: number,
	deltaColumn: number,
): Selection =>
	selection(
		position(sel.anchor.line + deltaLine, sel.anchor.column + deltaColumn),
		position(sel.head.line + deltaLine, sel.head.column + deltaColumn),
	);

export const moveTo = (_sel: Selection, newPos: Position): Selection =>
	selection(newPos, newPos);

export type SelectionDirection = "forward" | "backward";

export const direction = (sel: Selection): SelectionDirection =>
	isForward(sel) ? "forward" : "backward";

export type Selections = {
	readonly selections: readonly Selection[];
};

export const single = (sel: Selection): Selections => ({
	selections: [sel],
});

export const primary = (sels: Selections): Selection =>
	sels.selections[sels.selections.length - 1] ?? cursor(0, 0);

export const add = (sels: Selections, sel: Selection): Selections => ({
	selections: [...sels.selections, sel],
});

export const map = (
	sels: Selections,
	fn: (sel: Selection, index: number) => Selection,
): Selections => ({
	selections: sels.selections.map(fn),
});

export const reduce = <T>(
	sels: Selections,
	fn: (acc: T, sel: Selection, index: number) => T,
	initial: T,
): T => sels.selections.reduce(fn, initial);
