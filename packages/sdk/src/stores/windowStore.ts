import { createStore } from "solid-js/store";
import type { Position, WindowId, WindowState } from "./windowTypes";

interface WindowStoreState {
	windows: WindowState[];
	activeWindowId: number;
	nextWindowId: number;
}

const [windowStore, setWindowStore] = createStore<WindowStoreState>({
	windows: [],
	activeWindowId: 0,
	nextWindowId: 1,
});

export function create(bufId: number): WindowState {
	const id = windowStore.nextWindowId;
	const win: WindowState = {
		id,
		bufId,
		bufferIds: [bufId],
		cursor: { line: 0, column: 0 },
		scrollTop: 0,
		scrollLeft: 0,
		width: 80,
		height: 24,
	};

	setWindowStore({
		windows: [...windowStore.windows, win],
		nextWindowId: id + 1,
	});
	return win;
}

export function get(id: WindowId): WindowState | undefined {
	return windowStore.windows.find((w) => w.id === id);
}

export function getActive(): WindowState | undefined {
	return windowStore.windows.find((w) => w.id === windowStore.activeWindowId);
}

export function getAll(): WindowState[] {
	return windowStore.windows;
}

export function setActive(id: WindowId): void {
	setWindowStore("activeWindowId", id);
}

export function update(
	id: WindowId,
	updater: (win: WindowState) => WindowState,
): WindowState | undefined {
	const current = get(id);
	if (!current) return undefined;
	const updated = updater(current);
	setWindowStore(
		"windows",
		windowStore.windows.map((w) => (w.id === id ? updated : w)),
	);
	return updated;
}

export function setCursor(
	id: WindowId,
	line: number,
	column: number,
): WindowState | undefined {
	return update(id, (win) => ({ ...win, cursor: { line, column } }));
}

export function setScroll(
	id: WindowId,
	scrollTop: number,
	scrollLeft?: number,
): WindowState | undefined {
	return update(id, (win) => ({
		...win,
		scrollTop,
		...(scrollLeft !== undefined && { scrollLeft }),
	}));
}

export function setBuffer(
	id: WindowId,
	bufId: number,
): WindowState | undefined {
	return update(id, (win) => {
		const newBufferIds = win.bufferIds.includes(bufId)
			? win.bufferIds
			: [...win.bufferIds, bufId];
		return { ...win, bufId, bufferIds: newBufferIds };
	});
}

export function remove(id: WindowId): boolean {
	const win = get(id);
	if (!win) return false;

	setWindowStore(
		"windows",
		windowStore.windows.filter((w) => w.id !== id),
	);

	if (windowStore.activeWindowId === id) {
		const remaining = windowStore.windows.filter((w) => w.id !== id);
		setWindowStore("activeWindowId", remaining[0]?.id ?? 0);
	}

	return true;
}

const resolveDirectionIndex = (
	currentIdx: number,
	direction: "h" | "j" | "k" | "l",
	length: number,
): number => {
	if (direction === "h" || direction === "k") {
		return (currentIdx - 1 + length) % length;
	}
	return (currentIdx + 1) % length;
};

export function moveFocus(direction: "h" | "j" | "k" | "l"): void {
	const currentIdx = windowStore.windows.findIndex(
		(w) => w.id === windowStore.activeWindowId,
	);
	if (currentIdx === -1) return;

	const nextIdx = resolveDirectionIndex(
		currentIdx,
		direction,
		windowStore.windows.length,
	);
	const nextWin = windowStore.windows[nextIdx];
	if (nextWin) {
		setWindowStore("activeWindowId", nextWin.id);
	}
}

export function moveBuffer(direction: "h" | "j" | "k" | "l"): void {
	const currentIdx = windowStore.windows.findIndex(
		(w) => w.id === windowStore.activeWindowId,
	);
	if (currentIdx === -1) return;

	const nextIdx = resolveDirectionIndex(
		currentIdx,
		direction,
		windowStore.windows.length,
	);

	if (nextIdx === currentIdx) return;

	const currentWin = windowStore.windows[currentIdx];
	const nextWin = windowStore.windows[nextIdx];
	if (!currentWin || !nextWin) return;

	const currentBufId = currentWin.bufId;
	const nextBufId = nextWin.bufId;

	setWindowStore(
		"windows",
		windowStore.windows.map((w) => {
			if (w.id === currentWin.id) {
				return {
					...w,
					bufId: nextBufId,
					bufferIds: w.bufferIds.includes(nextBufId)
						? w.bufferIds
						: [...w.bufferIds, nextBufId],
				};
			}
			if (w.id === nextWin.id) {
				return {
					...w,
					bufId: currentBufId,
					bufferIds: w.bufferIds.includes(currentBufId)
						? w.bufferIds
						: [...w.bufferIds, currentBufId],
				};
			}
			return w;
		}),
	);

	setWindowStore("activeWindowId", nextWin.id);
}

export function addBufferToWindow(id: WindowId, bufId: number): void {
	update(id, (win) => {
		if (win.bufferIds.includes(bufId)) return win;
		return { ...win, bufferIds: [...win.bufferIds, bufId] };
	});
}

export function removeBufferFromWindow(id: WindowId, bufId: number): void {
	update(id, (win) => {
		const newBufferIds = win.bufferIds.filter((bid) => bid !== bufId);
		if (newBufferIds.length === 0) return win;
		return {
			...win,
			bufferIds: newBufferIds,
			bufId: win.bufId === bufId ? newBufferIds[0]! : win.bufId,
		};
	});
}

export { windowStore, setWindowStore };
