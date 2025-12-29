import { Effect } from "effect";
import type { Tree } from "tree-sitter";
import { detectLanguage, getGrammar } from "../treesitter/grammars";
import { parse } from "../treesitter/parser";
import * as Buffer from "./buffer";

export type Document = {
	readonly id: number;
	buffer: Buffer.BufferState;
	path?: string;
	language: string;
	dirty: boolean;
	tree?: Tree;
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

export const updateTree = (doc: Document) =>
	Effect.gen(function* (_) {
		if (doc.language === "text") return;
		const grammar = yield* _(getGrammar(doc.language));
		const content = Buffer.getText(doc.buffer);
		const tree = yield* _(parse(content, grammar));
		(doc as any).tree = tree;
	});

export function get(id: number): Document | undefined {
	return documents.get(id);
}

export function getAll(): Document[] {
	return Array.from(documents.values());
}
