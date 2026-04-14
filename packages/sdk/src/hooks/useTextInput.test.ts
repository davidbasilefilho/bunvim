import { describe, expect, test } from "bun:test";

import { useTextInput } from "./useTextInput";

describe("useTextInput", () => {
  test("accepts printable characters from key.key when sequence is empty", () => {
    let received = "";
    const input = useTextInput({
      onChar: (char) => {
        received = char;
      },
    });

    const handled = input.handleKey({
      key: "a",
      ctrl: false,
      meta: false,
      shift: false,
      sequence: "",
    });

    expect(handled).toBe(true);
    expect(received).toBe("a");
  });

  test("continues to handle special keys", () => {
    let backspaceCount = 0;
    let enterCount = 0;
    let escapeCount = 0;
    const input = useTextInput({
      onBackspace: () => {
        backspaceCount += 1;
      },
      onEnter: () => {
        enterCount += 1;
      },
      onEscape: () => {
        escapeCount += 1;
      },
    });

    expect(
      input.handleKey({
        key: "backspace",
        ctrl: false,
        meta: false,
        shift: false,
        sequence: "",
      }),
    ).toBe(true);
    expect(backspaceCount).toBe(1);

    expect(
      input.handleKey({
        key: "return",
        ctrl: false,
        meta: false,
        shift: false,
        sequence: "",
      }),
    ).toBe(true);
    expect(enterCount).toBe(1);

    expect(
      input.handleKey({
        key: "escape",
        ctrl: false,
        meta: false,
        shift: false,
        sequence: "",
      }),
    ).toBe(true);
    expect(escapeCount).toBe(1);
  });
});
