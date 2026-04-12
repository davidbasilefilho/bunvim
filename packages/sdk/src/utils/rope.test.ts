import { describe, expect, test } from "bun:test";

import * as Rope from "./rope";

const multiLineText = "Hello\nWorld\nTest";
const textWithTrailingNewline = "Hello\nWorld\n";
const textWithMultipleEmptyLines = "\n\n\n";

describe("empty", () => {
  test("creates empty rope", () => {
    const rope = Rope.empty();
    expect(rope.content).toBe("");
    expect(rope.lineStarts).toEqual([0]);
  });

  test("empty rope has length 0", () => {
    expect(Rope.length(Rope.empty())).toBe(0);
  });

  test("empty rope has line count 1", () => {
    expect(Rope.lineCount(Rope.empty())).toBe(1);
  });
});

describe("fromString", () => {
  test("creates rope from string", () => {
    const rope = Rope.fromString("Hello");
    expect(rope.content).toBe("Hello");
    expect(rope.lineStarts).toEqual([0]);
  });

  test("creates rope from empty string", () => {
    const rope = Rope.fromString("");
    expect(rope.content).toBe("");
    expect(rope.lineStarts).toEqual([0]);
  });

  test("creates rope from single character", () => {
    const rope = Rope.fromString("x");
    expect(rope.content).toBe("x");
    expect(rope.lineStarts).toEqual([0]);
  });

  test("creates rope with multiple lines", () => {
    const rope = Rope.fromString(multiLineText);
    expect(rope.content).toBe(multiLineText);
    expect(rope.lineStarts).toEqual([0, 6, 12]);
  });

  test("creates rope with trailing newline", () => {
    const rope = Rope.fromString(textWithTrailingNewline);
    expect(rope.content).toBe(textWithTrailingNewline);
    expect(rope.lineStarts).toEqual([0, 6, 12]);
  });

  test("creates rope starting with newline", () => {
    const rope = Rope.fromString("\nHello");
    expect(rope.lineStarts).toEqual([0, 1]);
  });

  test("creates rope with only newlines", () => {
    const rope = Rope.fromString(textWithMultipleEmptyLines);
    expect(rope.lineStarts).toEqual([0, 1, 2, 3]);
  });
});

describe("length", () => {
  test("returns correct character length", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.length(rope)).toBe(5);
  });

  test("returns 0 for empty rope", () => {
    expect(Rope.length(Rope.empty())).toBe(0);
  });

  test("returns correct length for multi-line text", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.length(rope)).toBe(16);
  });

  test("counts newline characters", () => {
    const rope = Rope.fromString("\n\n\n");
    expect(Rope.length(rope)).toBe(3);
  });
});

describe("lineCount", () => {
  test("returns correct line count for single line", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.lineCount(rope)).toBe(1);
  });

  test("returns correct line count for multi-line text", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.lineCount(rope)).toBe(3);
  });

  test("returns 1 for empty rope", () => {
    expect(Rope.lineCount(Rope.empty())).toBe(1);
  });

  test("returns correct count for text with trailing newline", () => {
    const rope = Rope.fromString(textWithTrailingNewline);
    expect(Rope.lineCount(rope)).toBe(3);
  });

  test("returns correct count for text starting with newline", () => {
    const rope = Rope.fromString("\nHello");
    expect(Rope.lineCount(rope)).toBe(2);
  });

  test("returns correct count for multiple empty lines", () => {
    const rope = Rope.fromString(textWithMultipleEmptyLines);
    expect(Rope.lineCount(rope)).toBe(4);
  });
});

describe("getLine", () => {
  test("returns correct line for single line text", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.getLine(rope, 0)).toBe("Hello");
  });

  test("returns correct line for multi-line text", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.getLine(rope, 0)).toBe("Hello");
    expect(Rope.getLine(rope, 1)).toBe("World");
    expect(Rope.getLine(rope, 2)).toBe("Test");
  });

  test("returns undefined for out-of-bounds line", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.getLine(rope, -1)).toBeUndefined();
    expect(Rope.getLine(rope, 1)).toBeUndefined();
  });

  test("returns undefined for out-of-bounds in multi-line", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.getLine(rope, 3)).toBeUndefined();
    expect(Rope.getLine(rope, 100)).toBeUndefined();
  });

  test("handles empty first line", () => {
    const rope = Rope.fromString("\nHello");
    expect(Rope.getLine(rope, 0)).toBe("");
    expect(Rope.getLine(rope, 1)).toBe("Hello");
  });

  test("handles line with trailing newline", () => {
    const rope = Rope.fromString("Hello\n");
    expect(Rope.getLine(rope, 0)).toBe("Hello");
  });

  test("handles empty lines", () => {
    const rope = Rope.fromString("\n\n\n");
    expect(Rope.getLine(rope, 0)).toBe("");
    expect(Rope.getLine(rope, 1)).toBe("");
    expect(Rope.getLine(rope, 2)).toBe("");
    expect(Rope.getLine(rope, 3)).toBe("");
  });

  test("handles empty rope", () => {
    expect(Rope.getLine(Rope.empty(), 0)).toBe("");
  });
});

describe("getLineLength", () => {
  test("returns correct line length", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.getLineLength(rope, 0)).toBe(5);
    expect(Rope.getLineLength(rope, 1)).toBe(5);
    expect(Rope.getLineLength(rope, 2)).toBe(4);
  });

  test("returns undefined for out-of-bounds", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.getLineLength(rope, -1)).toBeUndefined();
    expect(Rope.getLineLength(rope, 1)).toBeUndefined();
  });

  test("handles lines with trailing newline", () => {
    const rope = Rope.fromString("Hello\nWorld");
    expect(Rope.getLineLength(rope, 0)).toBe(5);
    expect(Rope.getLineLength(rope, 1)).toBe(5);
  });

  test("handles lines without trailing newline", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.getLineLength(rope, 0)).toBe(5);
  });

  test("handles empty lines", () => {
    const rope = Rope.fromString("\nHello");
    expect(Rope.getLineLength(rope, 0)).toBe(0);
    expect(Rope.getLineLength(rope, 1)).toBe(5);
  });
});

describe("offsetToPosition", () => {
  test("converts offset to position", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.offsetToPosition(rope, 0)).toEqual({ line: 0, column: 0 });
    expect(Rope.offsetToPosition(rope, 5)).toEqual({ line: 0, column: 5 });
    expect(Rope.offsetToPosition(rope, 6)).toEqual({ line: 1, column: 0 });
    expect(Rope.offsetToPosition(rope, 7)).toEqual({ line: 1, column: 1 });
    expect(Rope.offsetToPosition(rope, 12)).toEqual({ line: 2, column: 0 });
    expect(Rope.offsetToPosition(rope, 15)).toEqual({ line: 2, column: 3 });
  });

  test("returns undefined for out-of-bounds offset", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.offsetToPosition(rope, -1)).toBeUndefined();
    expect(Rope.offsetToPosition(rope, 6)).toBeUndefined();
  });

  test("handles offset at end of content", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.offsetToPosition(rope, 5)).toEqual({ line: 0, column: 5 });
  });

  test("handles empty rope", () => {
    expect(Rope.offsetToPosition(Rope.empty(), 0)).toEqual({
      line: 0,
      column: 0,
    });
  });

  test("handles offset at newlines", () => {
    const rope = Rope.fromString("Hello\nWorld");
    expect(Rope.offsetToPosition(rope, 5)).toEqual({ line: 0, column: 5 });
    expect(Rope.offsetToPosition(rope, 6)).toEqual({ line: 1, column: 0 });
  });

  test("handles text starting with newline", () => {
    const rope = Rope.fromString("\nHello");
    expect(Rope.offsetToPosition(rope, 0)).toEqual({ line: 0, column: 0 });
    expect(Rope.offsetToPosition(rope, 1)).toEqual({ line: 1, column: 0 });
  });
});

describe("positionToOffset", () => {
  test("converts position to offset", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.positionToOffset(rope, { line: 0, column: 0 })).toBe(0);
    expect(Rope.positionToOffset(rope, { line: 0, column: 5 })).toBe(5);
    expect(Rope.positionToOffset(rope, { line: 1, column: 0 })).toBe(6);
    expect(Rope.positionToOffset(rope, { line: 2, column: 0 })).toBe(12);
    expect(Rope.positionToOffset(rope, { line: 2, column: 3 })).toBe(15);
  });

  test("returns undefined for invalid position", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.positionToOffset(rope, { line: -1, column: 0 })).toBeUndefined();
    expect(Rope.positionToOffset(rope, { line: 0, column: -1 })).toBeUndefined();
    expect(Rope.positionToOffset(rope, { line: 1, column: 0 })).toBeUndefined();
    expect(Rope.positionToOffset(rope, { line: 0, column: 6 })).toBeUndefined();
  });

  test("handles position at end of line", () => {
    const rope = Rope.fromString("Hello\nWorld");
    expect(Rope.positionToOffset(rope, { line: 0, column: 5 })).toBe(5);
    expect(Rope.positionToOffset(rope, { line: 1, column: 5 })).toBe(11);
  });

  test("handles empty rope", () => {
    expect(Rope.positionToOffset(Rope.empty(), { line: 0, column: 0 })).toBe(0);
  });

  test("handles position with newline", () => {
    const rope = Rope.fromString("Hello\nWorld");
    expect(Rope.positionToOffset(rope, { line: 1, column: 0 })).toBe(6);
  });

  test("handles position at newline character", () => {
    const rope = Rope.fromString("Hello\nWorld");
    expect(Rope.positionToOffset(rope, { line: 0, column: 5 })).toBe(5);
    expect(Rope.positionToOffset(rope, { line: 0, column: 6 })).toBe(6);
  });
});

describe("slice", () => {
  test("extracts substring", () => {
    const rope = Rope.fromString("Hello World");
    expect(Rope.slice(rope, 0, 5)).toBe("Hello");
    expect(Rope.slice(rope, 6, 11)).toBe("World");
    expect(Rope.slice(rope, 3, 8)).toBe("lo Wo");
  });

  test("handles invalid range", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.slice(rope, 3, 2)).toBe("");
    expect(Rope.slice(rope, -1, 3)).toBe("");
  });

  test("extracts single character", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.slice(rope, 0, 1)).toBe("H");
    expect(Rope.slice(rope, 4, 5)).toBe("o");
  });

  test("handles no end parameter", () => {
    const rope = Rope.fromString("Hello World");
    expect(Rope.slice(rope, 6)).toBe("World");
  });

  test("handles empty rope", () => {
    expect(Rope.slice(Rope.empty(), 0, 0)).toBe("");
  });

  test("handles range beyond content", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.slice(rope, 3, 10)).toBe("lo");
  });
});

describe("insert", () => {
  test("inserts text at offset", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.insert(rope, 6, "Beautiful ");
    expect(Rope.getText(result)).toBe("Hello Beautiful World");
  });

  test("inserts at beginning", () => {
    const rope = Rope.fromString("World");
    const result = Rope.insert(rope, 0, "Hello ");
    expect(Rope.getText(result)).toBe("Hello World");
  });

  test("inserts at end", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.insert(rope, 5, " World");
    expect(Rope.getText(result)).toBe("Hello World");
  });

  test("inserts empty string", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.insert(rope, 3, "");
    expect(Rope.getText(result)).toBe("Hello");
  });

  test("returns original for out-of-bounds offset", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.insert(rope, -1, "x");
    expect(Rope.getText(result)).toBe("Hello");
    const result2 = Rope.insert(rope, 6, "x");
    expect(Rope.getText(result2)).toBe("Hello");
  });

  test("handles newlines in inserted text", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.insert(rope, 5, "\nNew Line\n");
    expect(Rope.getText(result)).toBe("Hello\nNew Line\n World");
    expect(Rope.lineCount(result)).toBe(3);
  });

  test("handles inserting into empty rope", () => {
    const result = Rope.insert(Rope.empty(), 0, "Hello");
    expect(Rope.getText(result)).toBe("Hello");
  });
});

describe("deleteRange", () => {
  test("deletes range", () => {
    const rope = Rope.fromString("Hello Beautiful World");
    const result = Rope.deleteRange(rope, 6, 16);
    expect(Rope.getText(result)).toBe("Hello World");
  });

  test("deletes from beginning", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.deleteRange(rope, 0, 6);
    expect(Rope.getText(result)).toBe("World");
  });

  test("deletes from end", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.deleteRange(rope, 5, 11);
    expect(Rope.getText(result)).toBe("Hello");
  });

  test("returns original for invalid range", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.deleteRange(rope, -1, 3);
    expect(Rope.getText(result)).toBe("Hello");
    const result2 = Rope.deleteRange(rope, 3, 6);
    expect(Rope.getText(result2)).toBe("Hello");
    const result3 = Rope.deleteRange(rope, 4, 2);
    expect(Rope.getText(result3)).toBe("Hello");
  });

  test("handles deleting empty range", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.deleteRange(rope, 2, 2);
    expect(Rope.getText(result)).toBe("Hello");
  });

  test("handles deleting entire content", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.deleteRange(rope, 0, 5);
    expect(Rope.getText(result)).toBe("");
    expect(Rope.lineCount(result)).toBe(1);
  });

  test("handles deleting with newlines", () => {
    const rope = Rope.fromString("Hello\nWorld\nTest");
    const result = Rope.deleteRange(rope, 5, 12);
    expect(Rope.getText(result)).toBe("HelloTest");
    expect(Rope.lineCount(result)).toBe(1);
  });

  test("handles single character deletion", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.deleteRange(rope, 0, 1);
    expect(Rope.getText(result)).toBe("ello");
  });
});

describe("replace", () => {
  test("replaces range with new text", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.replace(rope, 6, 11, "Universe");
    expect(Rope.getText(result)).toBe("Hello Universe");
  });

  test("replaces from beginning", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.replace(rope, 0, 5, "Hi");
    expect(Rope.getText(result)).toBe("Hi World");
  });

  test("replaces entire content", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.replace(rope, 0, 5, "World");
    expect(Rope.getText(result)).toBe("World");
  });

  test("returns original for invalid range", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.replace(rope, -1, 3, "x");
    expect(Rope.getText(result)).toBe("Hello");
    const result2 = Rope.replace(rope, 3, 6, "x");
    expect(Rope.getText(result2)).toBe("Hello");
    const result3 = Rope.replace(rope, 4, 2, "x");
    expect(Rope.getText(result3)).toBe("Hello");
  });

  test("handles replacement with empty string", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.replace(rope, 5, 6, "");
    expect(Rope.getText(result)).toBe("HelloWorld");
  });

  test("handles replacement with longer text", () => {
    const rope = Rope.fromString("Hi");
    const result = Rope.replace(rope, 0, 2, "Hello World");
    expect(Rope.getText(result)).toBe("Hello World");
  });

  test("handles replacement with newlines", () => {
    const rope = Rope.fromString("Hello World");
    const result = Rope.replace(rope, 5, 6, "\n");
    expect(Rope.getText(result)).toBe("Hello\nWorld");
    expect(Rope.lineCount(result)).toBe(2);
  });

  test("handles single character replacement", () => {
    const rope = Rope.fromString("Hello");
    const result = Rope.replace(rope, 0, 1, "J");
    expect(Rope.getText(result)).toBe("Jello");
  });
});

describe("getText", () => {
  test("returns full text content", () => {
    const rope = Rope.fromString("Hello");
    expect(Rope.getText(rope)).toBe("Hello");
  });

  test("returns empty string for empty rope", () => {
    expect(Rope.getText(Rope.empty())).toBe("");
  });

  test("returns text with newlines intact", () => {
    const rope = Rope.fromString(multiLineText);
    expect(Rope.getText(rope)).toBe(multiLineText);
  });
});
