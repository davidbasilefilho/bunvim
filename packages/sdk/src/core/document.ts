import type * as Buffer from "../stores/bufferStore";

export type Document = {
  readonly id: number;
  buffer: Buffer.BufferState;
  path?: string;
  language: string;
  dirty: boolean;
};

let nextDocId = 1;
const documents: Map<number, Document> = new Map();

export function create(buffer: Buffer.BufferState, path?: string, language = "text"): Document {
  const id = nextDocId++;
  const doc: Document = {
    id,
    buffer,
    path,
    language,
    dirty: false,
  };
  documents.set(id, doc);
  return doc;
}

export function get(id: number): Document | undefined {
  return documents.get(id);
}

export function getAll(): Document[] {
  return Array.from(documents.values());
}

export function update(id: number, updates: Partial<Document>): Document | undefined {
  const doc = documents.get(id);
  if (!doc) return undefined;
  const updated = { ...doc, ...updates };
  documents.set(id, updated);
  return updated;
}

export function remove(id: number): boolean {
  return documents.delete(id);
}
