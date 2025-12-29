import * as Window from "../core/window";

export function get_current_win(): number {
	return 1;
}

export function win_get_buf(win: number): number {
	return Window.get(win)?.buf ?? 0;
}

export function win_set_buf(win: number, buf: number) {
	const w = Window.get(win);
	if (w) {
		w.buf = buf;
	}
}

export function win_get_cursor(win: number): [number, number] {
	const w = Window.get(win);
	if (w) {
		return [w.cursor.line + 1, w.cursor.column];
	}
	return [1, 0];
}

export function win_set_cursor(win: number, pos: [number, number]) {
	const w = Window.get(win);
	if (w) {
		w.cursor = { line: pos[0] - 1, column: pos[1] };
	}
}
