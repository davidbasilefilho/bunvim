import * as Buffer from "./buffer";
import * as Window from "./window";

export type EditorState = {
	buffers: Map<number, Buffer.BufferState>;
	windows: Map<number, Window.Window>;
	activeWindowId: number;
	nextBufferId: number;
};

const state: EditorState = {
	buffers: new Map(),
	windows: new Map(),
	activeWindowId: 0,
	nextBufferId: 1,
};

export function init(initialContent: string) {
	const bufId = 0;
	state.buffers.set(bufId, Buffer.createState(initialContent));
	const win = Window.create(bufId);
	state.windows.set(win.id, win);
	state.activeWindowId = win.id;
}

export function get_state() {
	return state;
}

export function get_active_window(): Window.Window | undefined {
	return state.windows.get(state.activeWindowId);
}

export function get_buffer(id: number): Buffer.BufferState | undefined {
	return state.buffers.get(id);
}
