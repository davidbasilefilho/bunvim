import { describe, expect, test } from "bun:test";

import { createInitialState, processKey } from "./keymap";

describe("processKey", () => {
  test("uses key.key fallback for command-mode typing", () => {
    const result = processKey({
      state: createInitialState(),
      key: {
        key: "w",
        ctrl: false,
        meta: false,
        shift: false,
        sequence: "",
      },
      mode: { type: "command", input: "" },
      onTimeout: () => {},
    });

    expect(result.result).toEqual({ type: "command-update", input: "w" });
  });

  test("uses key.key fallback for search-mode typing", () => {
    const result = processKey({
      state: createInitialState(),
      key: {
        key: "f",
        ctrl: false,
        meta: false,
        shift: false,
        sequence: "",
      },
      mode: { type: "search", input: "", direction: "forward" },
      onTimeout: () => {},
    });

    expect(result.result).toEqual({ type: "command-update", input: "f" });
  });
});
