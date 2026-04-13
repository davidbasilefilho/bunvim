import type { KeyEvent } from "../keybindings/keymap";

export interface TextInputConfig {
	onChar?: (char: string) => void;
	onBackspace?: () => void;
	onEnter?: () => void;
	onEscape?: () => void;
	enabled?: () => boolean;
}

export interface TextInputHandler {
	handleKey: (key: KeyEvent) => boolean;
}

export function useTextInput(config: TextInputConfig): TextInputHandler {
	const isEnabled = config.enabled ?? (() => true);

	return {
		handleKey: (key: KeyEvent): boolean => {
			if (!isEnabled()) return false;
			return handleKeyEvent(key, config);
		},
	};
}

function handleKeyEvent(key: KeyEvent, config: TextInputConfig): boolean {
	if (key.key === "escape" || key.sequence === "\x1b") {
		config.onEscape?.();
		return true;
	}

	if (key.key === "backspace") {
		config.onBackspace?.();
		return true;
	}

	if (key.key === "return") {
		config.onEnter?.();
		return true;
	}

	if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
		config.onChar?.(key.sequence);
		return true;
	}

	return false;
}
