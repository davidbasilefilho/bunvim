export type Mode =
  | { type: "normal" }
  | { type: "insert" }
  | { type: "visual"; subtype: "char" | "line" | "block" }
  | { type: "command"; input: string; prompt?: string }
  | { type: "search"; direction: "forward" | "backward"; input: string }
  | { type: "operator-pending"; operator: string; count: number | undefined };

export type ModeType = Mode["type"];

export const normal = (): Mode => ({ type: "normal" });
export const insert = (): Mode => ({ type: "insert" });
export const visual = (): Mode => ({ type: "visual", subtype: "char" });
export const visualLine = (): Mode => ({ type: "visual", subtype: "line" });
export const visualBlock = (): Mode => ({ type: "visual", subtype: "block" });
export const command = (input = "", prompt?: string): Mode => ({
  type: "command",
  input,
  prompt,
});
export const search = (direction: "forward" | "backward", input = ""): Mode => ({
  type: "search",
  direction,
  input,
});

export const operatorPending = (operator: string, count: number | undefined = undefined): Mode => ({
  type: "operator-pending",
  operator,
  count,
});

export const isNormal = (mode: Mode): mode is { type: "normal" } => mode.type === "normal";

export const isInsert = (mode: Mode): mode is { type: "insert" } => mode.type === "insert";

export const isVisual = (
  mode: Mode,
): mode is { type: "visual"; subtype: "char" | "line" | "block" } => mode.type === "visual";

export const isCommand = (mode: Mode): mode is { type: "command"; input: string } =>
  mode.type === "command";

export const isSearch = (
  mode: Mode,
): mode is {
  type: "search";
  direction: "forward" | "backward";
  input: string;
} => mode.type === "search";

export const isOperatorPending = (
  mode: Mode,
): mode is {
  type: "operator-pending";
  operator: string;
  count: number | undefined;
} => mode.type === "operator-pending";

export const displayName = (mode: Mode): string => {
  switch (mode.type) {
    case "normal":
      return "NORMAL";
    case "insert":
      return "INSERT";
    case "visual":
      switch (mode.subtype) {
        case "char":
          return "VISUAL";
        case "line":
          return "V-LINE";
        case "block":
          return "V-BLOCK";
      }
      break;
    case "command":
      return "COMMAND";
    case "search":
      return mode.direction === "forward" ? "SEARCH" : "SEARCH BACKWARD";
    case "operator-pending":
      return `PENDING: ${mode.operator}`;
  }
};

export const indicator = (mode: Mode): string => {
  switch (mode.type) {
    case "normal":
      return "";
    case "insert":
      return "-- INSERT --";
    case "visual":
      switch (mode.subtype) {
        case "char":
          return "-- VISUAL --";
        case "line":
          return "-- VISUAL LINE --";
        case "block":
          return "-- VISUAL BLOCK --";
      }
      break;
    case "command":
      return `:${mode.input}`;
    case "search":
      return mode.direction === "forward" ? `/${mode.input}` : `?${mode.input}`;
    case "operator-pending":
      return "";
  }
};

export const allowsTextInput = (mode: Mode): boolean =>
  mode.type === "insert" || mode.type === "command" || mode.type === "search";

export type ModeState = {
  readonly current: Mode;
  readonly previous: Mode;
};

export const initialState = (): ModeState => ({
  current: normal(),
  previous: normal(),
});

export const transition = (state: ModeState, next: Mode): ModeState => ({
  current: next,
  previous: state.current,
});

export const revert = (state: ModeState): ModeState => ({
  current: state.previous,
  previous: state.current,
});
