import {
	bufferActions,
	editorUiActions,
	insert,
	normal,
	registerKeymap,
	visual,
	windowActions,
} from "@bunvim/sdk";

export function registerDefaultKeymaps() {
	registerKeymap({
		lhs: "h",
		mode: "n",
		description: "Move left",
		rhs: () => {
			const win = windowActions.getActive();
			if (win)
				windowActions.setCursor(
					win.id,
					win.cursor.line,
					Math.max(0, win.cursor.column - 1),
				);
		},
	});

	registerKeymap({
		lhs: "j",
		mode: "n",
		description: "Move down",
		rhs: () => {
			const win = windowActions.getActive();
			if (win)
				windowActions.setCursor(win.id, win.cursor.line + 1, win.cursor.column);
		},
	});

	registerKeymap({
		lhs: "k",
		mode: "n",
		description: "Move up",
		rhs: () => {
			const win = windowActions.getActive();
			if (win)
				windowActions.setCursor(
					win.id,
					Math.max(0, win.cursor.line - 1),
					win.cursor.column,
				);
		},
	});

	registerKeymap({
		lhs: "l",
		mode: "n",
		description: "Move right",
		rhs: () => {
			const win = windowActions.getActive();
			if (win)
				windowActions.setCursor(win.id, win.cursor.line, win.cursor.column + 1);
		},
	});

	registerKeymap({
		lhs: "i",
		mode: "n",
		description: "Enter insert mode",
		rhs: () => {
			editorUiActions.setMode(insert());
		},
	});

	registerKeymap({
		lhs: "v",
		mode: "n",
		description: "Enter visual mode",
		rhs: () => {
			const win = windowActions.getActive();
			if (win) {
				editorUiActions.setVisualAnchor(win.cursor.line, win.cursor.column);
			}
			editorUiActions.setMode(visual());
		},
	});

	registerKeymap({
		lhs: ":",
		mode: "n",
		description: "Enter command mode",
		rhs: () => {
			editorUiActions.setMode({ type: "command", input: "" });
		},
	});

	registerKeymap({
		lhs: "<C-c>",
		mode: "i",
		description: "Exit insert mode",
		rhs: () => {
			editorUiActions.setMode(normal());
		},
	});

	registerKeymap({
		lhs: "<Esc>",
		mode: ["i", "v", "c"],
		description: "Exit to normal mode",
		rhs: () => {
			editorUiActions.setMode(normal());
		},
	});
}
