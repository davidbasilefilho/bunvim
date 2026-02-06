import { createSignal } from "solid-js";

interface TerminalState {
	width: number;
	height: number;
}

const [terminalState, setTerminalState] = createSignal<TerminalState>({
	width: 80,
	height: 24,
});

export function setSize(width: number, height: number): void {
	setTerminalState({ width, height });
}

export { terminalState, setTerminalState };
