import type { Position, Range } from "../utils/position";
import { isTreeSitterAvailable } from "./parser";
import type { TreeSitterNode, TreeSitterTree } from "./types";

export type TextObjectResult = {
	readonly range: Range;
};

export function getFunctionObject(
	tree: TreeSitterTree,
	pos: Position,
	type: "inner" | "around",
): TextObjectResult | undefined {
	if (!isTreeSitterAvailable() || !tree) return undefined;

	const node = tree.rootNode.namedDescendantForPosition({
		row: pos.line,
		column: pos.column,
	});

	let current: TreeSitterNode | null = node;
	while (current) {
		if (
			current.type.includes("function") ||
			current.type === "method_definition" ||
			current.type === "function_declaration" ||
			current.type === "arrow_function"
		) {
			if (type === "around") {
				return {
					range: {
						start: {
							line: current.startPosition.row,
							column: current.startPosition.column,
						},
						end: {
							line: current.endPosition.row,
							column: current.endPosition.column,
						},
					},
				};
			}

			const body = current.namedChildren.find(
				(c) => c.type.includes("statement_block") || c.type.includes("block"),
			);
			if (body) {
				return {
					range: {
						start: {
							line: body.startPosition.row,
							column: body.startPosition.column + 1,
						},
						end: {
							line: body.endPosition.row,
							column: body.endPosition.column - 1,
						},
					},
				};
			}
			return {
				range: {
					start: {
						line: current.startPosition.row,
						column: current.startPosition.column,
					},
					end: {
						line: current.endPosition.row,
						column: current.endPosition.column,
					},
				},
			};
		}
		current = current.parent;
	}

	return undefined;
}

export function getClassObject(
	tree: TreeSitterTree,
	pos: Position,
	type: "inner" | "around",
): TextObjectResult | undefined {
	if (!isTreeSitterAvailable() || !tree) return undefined;

	const node = tree.rootNode.namedDescendantForPosition({
		row: pos.line,
		column: pos.column,
	});

	let current: TreeSitterNode | null = node;
	while (current) {
		if (
			current.type === "class_declaration" ||
			current.type === "class" ||
			current.type === "class_definition" ||
			current.type === "interface_declaration"
		) {
			if (type === "around") {
				return {
					range: {
						start: {
							line: current.startPosition.row,
							column: current.startPosition.column,
						},
						end: {
							line: current.endPosition.row,
							column: current.endPosition.column,
						},
					},
				};
			}

			const body = current.namedChildren.find(
				(c) =>
					c.type === "class_body" ||
					c.type === "interface_body" ||
					c.type.includes("block"),
			);
			if (body) {
				return {
					range: {
						start: {
							line: body.startPosition.row,
							column: body.startPosition.column + 1,
						},
						end: {
							line: body.endPosition.row,
							column: body.endPosition.column - 1,
						},
					},
				};
			}
			return {
				range: {
					start: {
						line: current.startPosition.row,
						column: current.startPosition.column,
					},
					end: {
						line: current.endPosition.row,
						column: current.endPosition.column,
					},
				},
			};
		}
		current = current.parent;
	}

	return undefined;
}
