import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { EditorMode } from "../keybindings/keymap";
import type { PickerSource } from "../picker/source";
import type { HighlightRange } from "../treesitter";

export interface QuitDialogState {
  bufId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface HoverPopupState {
  contents: string;
  line: number;
  column: number;
}

interface EditorUiStoreState {
  mode: EditorMode;
  pendingKeys: string;
  visualAnchorLine: number;
  visualAnchorColumn: number;
  yankRegister: string;
  highlights: Record<number, HighlightRange[]>;
  isHomeBuffer: boolean;
  lastSearch?: {
    pattern: string;
    direction: "forward" | "backward";
  };
  quitDialog?: QuitDialogState;
  hoverPopup?: HoverPopupState;
}

const [editorUiStore, setEditorUiStore] = createStore<EditorUiStoreState>({
  mode: { type: "normal" },
  pendingKeys: "",
  visualAnchorLine: 0,
  visualAnchorColumn: 0,
  yankRegister: "",
  highlights: {},
  isHomeBuffer: true,
});

const [activePicker, setActivePicker] = createSignal<PickerSource | undefined>();

export function setMode(mode: EditorMode): void {
  setEditorUiStore("mode", mode);
}

export function setPendingKeys(keys: string): void {
  setEditorUiStore("pendingKeys", keys);
}

export function appendPendingKey(key: string): void {
  setEditorUiStore("pendingKeys", (keys) => keys + key);
}

export function clearPendingKeys(): void {
  setEditorUiStore("pendingKeys", "");
}

export function setVisualAnchor(line: number, column: number): void {
  setEditorUiStore({
    visualAnchorLine: line,
    visualAnchorColumn: column,
  });
}

export function setYankRegister(text: string): void {
  setEditorUiStore("yankRegister", text);
}

export function setHighlights(bufferId: number, highlights: HighlightRange[]): void {
  setEditorUiStore("highlights", bufferId, highlights);
}

export function setIsHomeBuffer(isHome: boolean): void {
  setEditorUiStore("isHomeBuffer", isHome);
}

export function setLastSearch(pattern: string, direction: "forward" | "backward"): void {
  setEditorUiStore("lastSearch", { pattern, direction });
}

export function showQuitDialog(bufId: number, onConfirm: () => void, onCancel: () => void): void {
  setEditorUiStore("quitDialog", { bufId, onConfirm, onCancel });
}

export function closeQuitDialog(): void {
  setEditorUiStore("quitDialog", undefined);
}

export function showHoverPopup(contents: string, line: number, column: number): void {
  setEditorUiStore("hoverPopup", { contents, line, column });
}

export function closeHoverPopup(): void {
  setEditorUiStore("hoverPopup", undefined);
}

export { editorUiStore, setEditorUiStore, activePicker, setActivePicker };
