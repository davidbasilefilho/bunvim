import { describe, test, expect, beforeEach } from "bun:test";

import { position, range } from "../utils/position";
import type { BufferProps } from "./bufferStore";
import {
  createState,
  emptyState,
  getBuffer,
  getAllBuffers,
  getListedBuffers,
  removeBuffer,
  lineCount,
  getLine,
  getText,
  insertAt,
  deleteInRange,
  replaceInRange,
  isModified,
  markSaved,
  getBufferForFile,
  getOrCreateFileBuffer,
  setBufferStore,
  getLineLength,
  getTextInRange,
  offsetToPosition,
  positionToOffset,
  byteLength,
  updateBufferState,
} from "./bufferStore";

function resetBufferStore(): void {
  setBufferStore({
    buffers: [],
    fileBufferPaths: new Map(),
    nextBufferId: 1,
  });
}

describe("createState", () => {
  beforeEach(resetBufferStore);

  test("creates buffer with correct initial state", () => {
    const content = "Hello, World!";
    const props: BufferProps = {
      type: "file",
      path: "/test/file.ts",
      name: "file.ts",
    };

    const buf = createState(content, props);

    expect(buf.id).toBe(1);
    expect(buf.modified).toBe(false);
    expect(buf.version).toBe(0);
    expect(buf.props.type).toBe("file");
    expect(buf.props.path).toBe("/test/file.ts");
    expect(buf.props.name).toBe("file.ts");
    expect(getText(buf)).toBe(content);
  });

  test("handles partial props with defaults", () => {
    const buf = createState("content", { type: "file" });

    expect(buf.props.type).toBe("file");
    expect(buf.props.readonly).toBe(false);
    expect(buf.props.scratch).toBe(false);
    expect(buf.props.listed).toBe(true);
    expect(buf.props.path).toBeUndefined();
    expect(buf.props.name).toBeUndefined();
  });

  test("defaults to scratch type when not specified", () => {
    const buf = createState("content");

    expect(buf.props.type).toBe("scratch");
    expect(buf.props.scratch).toBe(true);
  });

  test("increments buffer id for each new buffer", () => {
    const buf1 = createState("first");
    const buf2 = createState("second");
    const buf3 = createState("third");

    expect(buf1.id).toBe(1);
    expect(buf2.id).toBe(2);
    expect(buf3.id).toBe(3);
  });

  test("registers file buffers in fileBufferPaths", () => {
    const buf = createState("content", {
      type: "file",
      path: "/home/user/doc.txt",
    });

    const retrieved = getBufferForFile("/home/user/doc.txt");
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(buf.id);
  });

  test("emptyState creates empty buffer", () => {
    const buf = emptyState({ type: "scratch" });

    expect(getText(buf)).toBe("");
    expect(buf.props.type).toBe("scratch");
  });
});

describe("getBuffer", () => {
  beforeEach(resetBufferStore);

  test("returns correct buffer by id", () => {
    const buf = createState("test content");

    const retrieved = getBuffer(buf.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(buf.id);
    expect(getText(retrieved!)).toBe("test content");
  });

  test("returns undefined for invalid id", () => {
    createState("content");

    const retrieved = getBuffer(999);

    expect(retrieved).toBeUndefined();
  });

  test("returns undefined for negative id", () => {
    const retrieved = getBuffer(-1);

    expect(retrieved).toBeUndefined();
  });
});

describe("getAllBuffers", () => {
  beforeEach(resetBufferStore);

  test("returns all buffers", () => {
    const buf1 = createState("first");
    const buf2 = createState("second");
    const buf3 = createState("third");

    const all = getAllBuffers();

    expect(all).toHaveLength(3);
    expect(all.map((b) => b.id)).toContain(buf1.id);
    expect(all.map((b) => b.id)).toContain(buf2.id);
    expect(all.map((b) => b.id)).toContain(buf3.id);
  });

  test("returns empty array when no buffers", () => {
    const all = getAllBuffers();

    expect(all).toHaveLength(0);
  });
});

describe("getListedBuffers", () => {
  beforeEach(resetBufferStore);

  test("filters by listed prop", () => {
    const listed = createState("listed", { listed: true });
    createState("unlisted", { listed: false });

    const listedBuffers = getListedBuffers();

    expect(listedBuffers).toHaveLength(1);
    expect(listedBuffers[0].id).toBe(listed.id);
  });

  test("returns all buffers when all are listed", () => {
    createState("buf1");
    createState("buf2");

    const listed = getListedBuffers();

    expect(listed).toHaveLength(2);
  });

  test("returns empty array when no buffers are listed", () => {
    createState("buf1", { listed: false });
    createState("buf2", { listed: false });

    const listed = getListedBuffers();

    expect(listed).toHaveLength(0);
  });
});

describe("removeBuffer", () => {
  beforeEach(resetBufferStore);

  test("removes buffer correctly", () => {
    const buf = createState("content");
    const id = buf.id;

    const removed = removeBuffer(id);

    expect(removed).toBe(true);
    expect(getBuffer(id)).toBeUndefined();
    expect(getAllBuffers()).toHaveLength(0);
  });

  test("returns false for invalid id", () => {
    createState("content");

    const removed = removeBuffer(999);

    expect(removed).toBe(false);
    expect(getAllBuffers()).toHaveLength(1);
  });

  test("removes file buffer from fileBufferPaths", () => {
    const buf = createState("content", { type: "file", path: "/test/file.ts" });

    removeBuffer(buf.id);

    expect(getBufferForFile("/test/file.ts")).toBeUndefined();
  });
});

describe("getBufferForFile", () => {
  beforeEach(resetBufferStore);

  test("returns existing buffer for file path", () => {
    const buf = createState("content", {
      type: "file",
      path: "/path/to/file.ts",
    });

    const retrieved = getBufferForFile("/path/to/file.ts");

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(buf.id);
  });

  test("returns undefined for non-existent path", () => {
    const retrieved = getBufferForFile("/non/existent/path");

    expect(retrieved).toBeUndefined();
  });
});

describe("getOrCreateFileBuffer", () => {
  beforeEach(resetBufferStore);

  test("returns existing buffer if file already open", () => {
    const buf = createState("original", { type: "file", path: "/test.ts" });

    const retrieved = getOrCreateFileBuffer("/test.ts", "new content");

    expect(retrieved.id).toBe(buf.id);
    expect(getText(retrieved)).toBe("original");
  });

  test("creates new buffer if file not open", () => {
    const buf = getOrCreateFileBuffer("/new/file.ts", "content");

    expect(buf.props.type).toBe("file");
    expect(buf.props.path).toBe("/new/file.ts");
    expect(buf.props.name).toBe("file.ts");
    expect(getText(buf)).toBe("content");
  });
});

describe("lineCount", () => {
  test("returns correct line count for single line", () => {
    const buf = createState("single line");

    expect(lineCount(buf)).toBe(1);
  });

  test("returns correct line count for multi-line", () => {
    const buf = createState("line1\nline2\nline3");

    expect(lineCount(buf)).toBe(3);
  });

  test("returns 1 for empty content", () => {
    const buf = createState("");

    expect(lineCount(buf)).toBe(1);
  });

  test("handles trailing newline correctly", () => {
    const buf = createState("line1\nline2\n");

    expect(lineCount(buf)).toBe(3);
  });
});

describe("getLine", () => {
  test("returns correct line content", () => {
    const buf = createState("first\nsecond\nthird");

    expect(getLine(buf, 0)).toBe("first");
    expect(getLine(buf, 1)).toBe("second");
    expect(getLine(buf, 2)).toBe("third");
  });

  test("returns undefined for invalid line number", () => {
    const buf = createState("content");

    expect(getLine(buf, -1)).toBeUndefined();
    expect(getLine(buf, 1)).toBeUndefined();
    expect(getLine(buf, 100)).toBeUndefined();
  });

  test("handles single line buffer", () => {
    const buf = createState("only line");

    expect(getLine(buf, 0)).toBe("only line");
  });

  test("handles empty content", () => {
    const buf = createState("");

    expect(getLine(buf, 0)).toBe("");
  });
});

describe("getLineLength", () => {
  test("returns correct line length", () => {
    const buf = createState("hello\nworld");

    expect(getLineLength(buf, 0)).toBe(5);
    expect(getLineLength(buf, 1)).toBe(5);
  });

  test("returns undefined for invalid line", () => {
    const buf = createState("content");

    expect(getLineLength(buf, -1)).toBeUndefined();
    expect(getLineLength(buf, 10)).toBeUndefined();
  });
});

describe("getText", () => {
  test("returns full text content", () => {
    const content = "line1\nline2\nline3";
    const buf = createState(content);

    expect(getText(buf)).toBe(content);
  });

  test("returns empty string for empty buffer", () => {
    const buf = createState("");

    expect(getText(buf)).toBe("");
  });
});

describe("getTextInRange", () => {
  test("returns text in range", () => {
    const buf = createState("Hello, World!");

    const text = getTextInRange(buf, range(position(0, 0), position(0, 5)));

    expect(text).toBe("Hello");
  });

  test("returns undefined for invalid range", () => {
    const buf = createState("content");

    const text = getTextInRange(buf, range(position(0, 100), position(0, 200)));

    expect(text).toBeUndefined();
  });
});

describe("insertAt", () => {
  test("inserts text at position", () => {
    const buf = createState("Hello World");

    const updated = insertAt(buf, position(0, 5), ",");

    expect(updated).toBeDefined();
    expect(getText(updated!)).toBe("Hello, World");
    expect(updated!.modified).toBe(true);
    expect(updated!.version).toBe(1);
  });

  test("returns undefined for invalid position", () => {
    const buf = createState("content");

    const updated = insertAt(buf, position(10, 0), "text");

    expect(updated).toBeUndefined();
  });

  test("inserts at beginning", () => {
    const buf = createState("World");

    const updated = insertAt(buf, position(0, 0), "Hello ");

    expect(getText(updated!)).toBe("Hello World");
  });

  test("inserts at end", () => {
    const buf = createState("Hello");

    const updated = insertAt(buf, position(0, 5), " World");

    expect(getText(updated!)).toBe("Hello World");
  });
});

describe("deleteInRange", () => {
  test("deletes text in range", () => {
    const buf = createState("Hello, World!");

    const updated = deleteInRange(buf, range(position(0, 5), position(0, 7)));

    expect(updated).toBeDefined();
    expect(getText(updated!)).toBe("HelloWorld!");
    expect(updated!.modified).toBe(true);
    expect(updated!.version).toBe(1);
  });

  test("returns undefined for invalid range", () => {
    const buf = createState("content");

    const updated = deleteInRange(buf, range(position(0, 0), position(10, 0)));

    expect(updated).toBeUndefined();
  });

  test("deletes entire content", () => {
    const buf = createState("Hello");

    const updated = deleteInRange(buf, range(position(0, 0), position(0, 5)));

    expect(getText(updated!)).toBe("");
  });
});

describe("replaceInRange", () => {
  test("replaces text in range", () => {
    const buf = createState("Hello, World!");

    const updated = replaceInRange(buf, range(position(0, 7), position(0, 12)), "Universe");

    expect(updated).toBeDefined();
    expect(getText(updated!)).toBe("Hello, Universe!");
    expect(updated!.modified).toBe(true);
    expect(updated!.version).toBe(1);
  });

  test("returns undefined for invalid range", () => {
    const buf = createState("content");

    const updated = replaceInRange(buf, range(position(0, 0), position(10, 0)), "new");

    expect(updated).toBeUndefined();
  });

  test("replace with empty string is delete", () => {
    const buf = createState("Hello World");

    const updated = replaceInRange(buf, range(position(0, 5), position(0, 6)), "");

    expect(getText(updated!)).toBe("HelloWorld");
  });
});

describe("isModified", () => {
  beforeEach(resetBufferStore);

  test("returns correct modified state", () => {
    const buf = createState("content");

    expect(isModified(buf.id)).toBe(false);
  });

  test("returns true after modification", () => {
    const buf = createState("content");
    const updated = insertAt(buf, position(0, 0), "modified ");
    updateBufferState(buf.id, () => updated!);

    expect(isModified(buf.id)).toBe(true);
  });

  test("returns false for non-existent buffer", () => {
    expect(isModified(999)).toBe(false);
  });
});

describe("markSaved", () => {
  beforeEach(resetBufferStore);

  test("sets modified to false", () => {
    const buf = createState("content");
    let updated = insertAt(buf, position(0, 0), "modified ");

    markSaved(updated!.id);

    expect(isModified(updated!.id)).toBe(false);
  });
});

describe("positionToOffset", () => {
  test("converts position to offset", () => {
    const buf = createState("Hello\nWorld");

    const offset = positionToOffset(buf, position(1, 2));

    expect(offset).toBe(8);
  });

  test("returns undefined for invalid position", () => {
    const buf = createState("content");

    expect(positionToOffset(buf, position(-1, 0))).toBeUndefined();
    expect(positionToOffset(buf, position(0, -1))).toBeUndefined();
    expect(positionToOffset(buf, position(10, 0))).toBeUndefined();
  });
});

describe("offsetToPosition", () => {
  test("converts offset to position", () => {
    const buf = createState("Hello\nWorld");

    const pos = offsetToPosition(buf, 8);

    expect(pos).toEqual({ line: 1, column: 2 });
  });

  test("returns undefined for invalid offset", () => {
    const buf = createState("content");

    expect(offsetToPosition(buf, -1)).toBeUndefined();
    expect(offsetToPosition(buf, 100)).toBeUndefined();
  });
});

describe("byteLength", () => {
  test("returns correct byte length for ASCII", () => {
    expect(byteLength("Hello")).toBe(5);
  });

  test("returns correct byte length for Unicode", () => {
    expect(byteLength("Hello")).toBe(5);
    expect(byteLength("🎉")).toBe(4);
  });
});

describe("edge cases", () => {
  beforeEach(resetBufferStore);

  test("empty content operations", () => {
    const buf = createState("");

    expect(lineCount(buf)).toBe(1);
    expect(getLine(buf, 0)).toBe("");
    expect(getText(buf)).toBe("");

    const updated = insertAt(buf, position(0, 0), "text");
    expect(getText(updated!)).toBe("text");
  });

  test("single line operations", () => {
    const buf = createState("single");

    expect(lineCount(buf)).toBe(1);
    expect(getLine(buf, 0)).toBe("single");

    const updated = deleteInRange(buf, range(position(0, 3), position(0, 6)));
    expect(getText(updated!)).toBe("sin");
  });

  test("multi-line operations", () => {
    const buf = createState("line1\nline2\nline3");

    expect(lineCount(buf)).toBe(3);
    expect(getLine(buf, 1)).toBe("line2");

    const updated = replaceInRange(buf, range(position(1, 0), position(2, 5)), "replacement");
    expect(getText(updated!)).toBe("line1\nreplacement");
  });
});
