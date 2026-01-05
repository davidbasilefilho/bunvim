import { create } from "zustand";

interface GlobalState {
	terminalWidth: number;
	terminalHeight: number;
	setTerminalSize: (width: number, height: number) => void;
}

export const useStore = create<GlobalState>((set) => ({
	terminalWidth: 80,
	terminalHeight: 24,
	setTerminalSize: (width, height) =>
		set({ terminalWidth: width, terminalHeight: height }),
}));
