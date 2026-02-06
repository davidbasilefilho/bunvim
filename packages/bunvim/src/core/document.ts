import { detectLanguage, initializeParsers } from "../treesitter";
import * as Buffer from "./buffer";

export type Document = {
	readonly id: number;
	buffer: Buffer.BufferState;
	path?: string;
	language: string;
	dirty: boolean;
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

	if (doc.language !== "text") {
		initializeParsers();
	}

	return doc;
}

export function get(id: number): Document | undefined {
	return documents.get(id);
}

export function getAll(): Document[] {
	return Array.from(documents.values());
}
