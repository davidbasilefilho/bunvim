import { Effect } from "effect";
import { detectLanguage, getGrammar } from "../treesitter/grammars";
import { applyEdits, parse } from "../treesitter/parser";
import type { TreeSitterLanguage, TreeSitterTree } from "../treesitter/types";
import * as Buffer from "./buffer";

export type Document = {
	readonly id: number;
	buffer: Buffer.BufferState;
	path?: string;
	language: string;
	dirty: boolean;
	tree?: TreeSitterTree;
};

let nextDocId = 1;
const documents: Map<number, Document> = new Map();

export function create(content: string, path?: string): Document {
	const id = nextDocId++;
	const doc: Document = {
		id,
		buffer: Buffer.createState(content),
		path,
		language: path ? detectLanguage(path) : "text",
		dirty: false,
	};
	documents.set(id, doc);
	return doc;
}

export const updateTree = (doc: Document, changes?: Buffer.BufferChange[]) =>
	Effect.gen(function* (_) {
		if (doc.language === "text") return;
		const grammar = yield* _(getGrammar(doc.language));
		const content = Buffer.getText(doc.buffer);

		let oldTree = doc.tree;
		if (oldTree && changes && changes.length > 0) {
			applyEdits(oldTree, changes, doc.buffer);
		} else if (changes && changes.length > 0) {
			oldTree = undefined;
		}

		const tree = yield* _(
			parse(content, grammar as TreeSitterLanguage, oldTree),
		);
		doc.tree = tree;
	});

export function get(id: number): Document | undefined {
	return documents.get(id);
}

export function getAll(): Document[] {
	return Array.from(documents.values());
}
