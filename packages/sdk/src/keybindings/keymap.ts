import type { Mode as EditorMode } from "../modes/mode";

export type KeyEvent = {
  readonly key: string;
  readonly ctrl: boolean;
  readonly meta: boolean;
  readonly shift: boolean;
  readonly sequence: string;
};

export type { EditorMode };

export type KeySequenceState = {
  readonly keys: string[];
  readonly count: string;
  readonly timeoutId: ReturnType<typeof setTimeout> | undefined;
};

export type KeymapHandler = () => void;

export interface KeymapEntry {
  lhs: string;
  rhs: KeymapHandler | string;
  mode: string | string[];
  description?: string;
}

export type KeyHandlerResult =
  | { type: "callback"; callback: KeymapHandler }
  | { type: "mode-change"; mode: EditorMode }
  | { type: "command-update"; input: string }
  | { type: "command-execute"; command: string }
  | { type: "command-cancel" }
  | { type: "pending" }
  | { type: "unhandled" };

const TIMEOUT_MS = 1000;

let keymaps: KeymapEntry[] = [];

export function registerKeymap(entry: KeymapEntry): void {
  keymaps.push(entry);
}

export function get_keymaps(): KeymapEntry[] {
  return keymaps;
}

export function getMatchingKeymaps(prefix: string, mode: EditorMode): KeymapEntry[] {
  const shortName = modeToShortName(mode);
  const mappings = keymaps.filter((m) => {
    const modes = Array.isArray(m.mode) ? m.mode : [m.mode];
    return modes.includes(shortName);
  });

  if (prefix === "") {
    return [];
  }

  return mappings.filter((m) => m.lhs.startsWith(prefix) && m.lhs.length > prefix.length);
}

export function clear(): void {
  keymaps = [];
}

export const createInitialState = (): KeySequenceState => ({
  keys: [],
  count: "",
  timeoutId: undefined,
});

export const clearState = (state: KeySequenceState): KeySequenceState => {
  if (state.timeoutId !== undefined) {
    clearTimeout(state.timeoutId);
  }
  return createInitialState();
};

const getKeyString = (keys: string[]): string => keys.join("");

const isDigit = (key: string): boolean => /^[1-9]$/.test(key);
const isDigitOrZero = (key: string): boolean => /^[0-9]$/.test(key);

const modeToShortName = (mode: EditorMode): string => {
  switch (mode.type) {
    case "normal":
      return "n";
    case "insert":
      return "i";
    case "visual":
      return mode.subtype === "line" ? "x" : mode.subtype === "block" ? "b" : "v";
    case "command":
      return "c";
    case "search":
      return "c";
    case "operator-pending":
      return "o";
    default:
      return "n";
  }
};

const getMappingsForMode = (mode: EditorMode) => {
  const shortName = modeToShortName(mode);
  return keymaps.filter((m) => {
    const modes = Array.isArray(m.mode) ? m.mode : [m.mode];
    return modes.includes(shortName);
  });
};

const findExactMatch = (keys: string[], mode: EditorMode) => {
  const keyStr = getKeyString(keys);
  const mappings = getMappingsForMode(mode);
  const matches = mappings.filter((m) => m.lhs === keyStr);
  if (matches.length === 0) return undefined;
  const longerMatches = mappings.filter(
    (m) => m.lhs.startsWith(keyStr) && m.lhs.length > keyStr.length,
  );
  if (longerMatches.length > 0) return "pending";
  return matches[0];
};

const hasAnyPrefixMatch = (keys: string[], mode: EditorMode) => {
  const keyStr = getKeyString(keys);
  const mappings = getMappingsForMode(mode);
  return mappings.some((m) => m.lhs.startsWith(keyStr) && m.lhs.length > keyStr.length);
};

export type ProcessKeyParams = {
  state: KeySequenceState;
  key: KeyEvent;
  mode: EditorMode;
  onTimeout: (result: KeyHandlerResult) => void;
};

export const processKey = (
  params: ProcessKeyParams,
): { result: KeyHandlerResult; newState: KeySequenceState } => {
  const { state, key, mode, onTimeout } = params;

  if (state.timeoutId !== undefined) {
    clearTimeout(state.timeoutId);
  }

  let keyChar = key.key;

  if (!key.ctrl && !key.meta && key.shift && keyChar.length === 1) {
    keyChar = keyChar.toUpperCase();
  }

  if (key.ctrl) {
    if (keyChar === "h" || keyChar === "backspace" || keyChar === "\x08") {
      keyChar = "<C-h>";
    } else if (keyChar === "i" || keyChar === "tab" || keyChar === "\x09") {
      keyChar = "<C-i>";
    } else if (keyChar === "j" || keyChar === "\x0a") {
      keyChar = "<C-j>";
    } else if (keyChar === "k" || keyChar === "\x0b") {
      keyChar = "<C-k>";
    } else if (keyChar === "l" || keyChar === "\x0c") {
      keyChar = "<C-l>";
    } else if (keyChar === "space" || keyChar === " ") {
      keyChar = "<C-Space>";
    } else if (keyChar.length === 1) {
      keyChar = `<C-${key.shift ? keyChar.toUpperCase() : keyChar.toLowerCase()}>`;
    }
  } else if (key.meta && keyChar.length === 1) {
    keyChar = `<M-${key.shift ? keyChar.toUpperCase() : keyChar.toLowerCase()}>`;
  }

  if (key.ctrl && (key.key === "c" || key.key === "C" || keyChar === "<C-c>")) {
    if (mode.type === "normal") {
      return { result: { type: "pending" }, newState: clearState(state) };
    }
    return {
      result: { type: "mode-change", mode: { type: "normal" } },
      newState: clearState(state),
    };
  }

  if (mode.type === "command" || mode.type === "search") {
    return processCommandMode(state, key, mode.input);
  }

  if (state.keys.length === 0 && isDigit(keyChar) && mode.type !== "insert") {
    const newState: KeySequenceState = {
      keys: [],
      count: state.count + keyChar,
      timeoutId: undefined,
    };
    return { result: { type: "pending" }, newState };
  }
  if (state.count.length > 0 && isDigitOrZero(keyChar) && mode.type !== "insert") {
    const newState: KeySequenceState = {
      keys: state.keys,
      count: state.count + keyChar,
      timeoutId: undefined,
    };
    return { result: { type: "pending" }, newState };
  }

  const newKeys = [...state.keys, keyChar];
  const match = findExactMatch(newKeys, mode);

  if (match === "pending") {
    const timeoutId = setTimeout(() => {
      const mappings = getMappingsForMode(mode);
      const exact = mappings.find((m) => m.lhs === getKeyString(newKeys));
      if (exact && typeof exact.rhs === "function") {
        onTimeout({ type: "callback", callback: exact.rhs });
      } else {
        onTimeout({ type: "command-cancel" });
      }
    }, TIMEOUT_MS);

    return {
      result: { type: "pending" },
      newState: { ...state, keys: newKeys, timeoutId },
    };
  }

  if (match && typeof match.rhs === "function") {
    return {
      result: { type: "callback", callback: match.rhs },
      newState: clearState(state),
    };
  }

  if (hasAnyPrefixMatch(newKeys, mode)) {
    const timeoutId = setTimeout(() => {
      onTimeout({ type: "command-cancel" });
    }, TIMEOUT_MS);
    return {
      result: { type: "pending" },
      newState: { ...state, keys: newKeys, timeoutId },
    };
  }

  return { result: { type: "unhandled" }, newState: clearState(state) };
};

const processCommandMode = (
  state: KeySequenceState,
  key: KeyEvent,
  currentInput: string,
): { result: KeyHandlerResult; newState: KeySequenceState } => {
  if (key.key === "escape" || (key.ctrl && key.key === "c")) {
    return {
      result: { type: "command-cancel" },
      newState: clearState(state),
    };
  }

  if (key.key === "return" || key.sequence === "\r") {
    return {
      result: { type: "command-execute", command: currentInput },
      newState: clearState(state),
    };
  }

  if (key.key === "backspace" || key.sequence === "\x7f") {
    if (currentInput.length === 0) {
      return {
        result: { type: "command-cancel" },
        newState: clearState(state),
      };
    }
    return {
      result: { type: "command-update", input: currentInput.slice(0, -1) },
      newState: state,
    };
  }

  if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
    return {
      result: { type: "command-update", input: currentInput + key.sequence },
      newState: state,
    };
  }

  return { result: { type: "unhandled" }, newState: state };
};
