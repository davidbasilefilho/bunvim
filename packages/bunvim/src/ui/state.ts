import type * as Buffer from "../core/buffer";
import type * as Keymap from "../keybindings/keymap";
import type { PickerSource } from "../picker/source";
import type { HighlightRange } from "../treesitter";

export type WindowState = {
	id: number;
	bufId: number;
	bufferIds: number[];
	split?: "h" | "v";
	cursorLine: number;
	cursorColumn: number;
	scrollTop: number;
	scrollLeft: number;
};

export type EditorUiState = {
	buffers: Buffer.BufferState[];
	windows: WindowState[];
	activeWindowId: number;
	mode: Keymap.EditorMode;
	pendingKeys: string;
	clueScrollTop: number;
	visualAnchorLine: number;
	visualAnchorColumn: number;
	yankRegister: string;
	activePicker?: {
		source: PickerSource;
	};
	highlights: Record<number, HighlightRange[]>;
	isHomeBuffer: boolean;
	lastSearch?: {
		pattern: string;
		direction: "forward" | "backward";
	};
	quitDialog?: {
		bufId: number;
		onConfirm: () => void;
		onCancel: () => void;
	};
	hoverPopup?: {
		contents: string;
		line: number;
		column: number;
	};
};
