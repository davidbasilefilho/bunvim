export interface Theme {
	readonly name: string;
	readonly type: "dark" | "light";
	readonly colors: {
		readonly bg: string;
		readonly fg: string;
		readonly cursor: string;
		readonly selection: string;
		readonly lineNumber: string;
		readonly activeLineNumber: string;
		readonly statuslineBg: string;
		readonly statuslineFg: string;
		readonly comment: string;
		readonly keyword: string;
		readonly string: string;
		readonly function: string;
		readonly type: string;
		readonly variable: string;
		readonly property: string;
		readonly parameter: string;
		readonly operator: string;
		readonly constant: string;
		readonly border: string;
		readonly surface: string;
		readonly overlay: string;
		readonly muted: string;
		readonly match: string;
		readonly error: string;
		readonly warning: string;
		readonly success: string;
		readonly info: string;
		readonly picker: {
			readonly bg: string;
			readonly fg: string;
			readonly border: string;
			readonly selection: {
				readonly bg: string;
				readonly fg: string;
				readonly indicator: string;
			};
			readonly match: string;
			readonly prompt: string;
		};
		readonly clue: {
			readonly bg: string;
			readonly fg: string;
			readonly key: string;
			readonly desc: string;
			readonly title: string;
			readonly border: string;
		};
	};
}

export const tokyoNight: Theme = {
	name: "tokyo-night",
	type: "dark",
	colors: {
		bg: "#1a1b26",
		fg: "#c0caf5",
		cursor: "#7aa2f7",
		selection: "#3b4261",
		lineNumber: "#3b4261",
		activeLineNumber: "#737aa2",
		statuslineBg: "#16161e",
		statuslineFg: "#7aa2f7",
		comment: "#565f89",
		keyword: "#bb9af7",
		string: "#9ece6a",
		function: "#7aa2f7",
		type: "#2ac3de",
		variable: "#c0caf5",
		property: "#7aa2f7",
		parameter: "#e0af68",
		operator: "#89ddff",
		constant: "#ff9e64",
		border: "#16161e",
		surface: "#1f2335",
		overlay: "#24283b",
		muted: "#565f89",
		match: "#db4b4b",
		error: "#db4b4b",
		warning: "#e0af68",
		success: "#9ece6a",
		info: "#7aa2f7",
		picker: {
			bg: "#16161e",
			fg: "#c0caf5",
			border: "#1f2335",
			selection: {
				bg: "#292e42",
				fg: "#7aa2f7",
				indicator: "#7aa2f7",
			},
			match: "#7aa2f7",
			prompt: "#7aa2f7",
		},
		clue: {
			bg: "#16161e",
			fg: "#c0caf5",
			key: "#7aa2f7",
			desc: "#565f89",
			title: "#e0af68",
			border: "#1f2335",
		},
	},
};

export const catppuccin: Theme = {
	name: "catppuccin",
	type: "dark",
	colors: {
		bg: "#1e1e2e",
		fg: "#cdd6f4",
		cursor: "#f5e0dc",
		selection: "#585b70",
		lineNumber: "#585b70",
		activeLineNumber: "#a6adc8",
		statuslineBg: "#11111b",
		statuslineFg: "#cba6f7",
		comment: "#6c7086",
		keyword: "#cba6f7",
		string: "#a6e3a1",
		function: "#89b4fa",
		type: "#f9e2af",
		variable: "#cdd6f4",
		property: "#b4befe",
		parameter: "#eba0ac",
		operator: "#89dceb",
		constant: "#fab387",
		border: "#11111b",
		surface: "#313244",
		overlay: "#45475a",
		muted: "#6c7086",
		match: "#f38ba8",
		error: "#f38ba8",
		warning: "#fab387",
		success: "#a6e3a1",
		info: "#89b4fa",
		picker: {
			bg: "#181825",
			fg: "#cdd6f4",
			border: "#313244",
			selection: {
				bg: "#313244",
				fg: "#cba6f7",
				indicator: "#cba6f7",
			},
			match: "#cba6f7",
			prompt: "#cba6f7",
		},
		clue: {
			bg: "#181825",
			fg: "#cdd6f4",
			key: "#cba6f7",
			desc: "#6c7086",
			title: "#fab387",
			border: "#313244",
		},
	},
};

export const catppuccinMacchiato: Theme = {
	name: "catppuccin-macchiato",
	type: "dark",
	colors: {
		bg: "#24273a",
		fg: "#cad3f5",
		cursor: "#f4dbd6",
		selection: "#5b6078",
		lineNumber: "#5b6078",
		activeLineNumber: "#a5adcb",
		statuslineBg: "#1e2030",
		statuslineFg: "#c6a0f6",
		comment: "#6e738d",
		keyword: "#c6a0f6",
		string: "#a6da95",
		function: "#8aadf4",
		type: "#eed49f",
		variable: "#cad3f5",
		property: "#b7bdf8",
		parameter: "#ee99a0",
		operator: "#91d7e3",
		constant: "#f5a97f",
		border: "#181926",
		surface: "#363a4f",
		overlay: "#494d64",
		muted: "#939ab7",
		match: "#ed8796",
		error: "#ed8796",
		warning: "#eed49f",
		success: "#a6da95",
		info: "#8aadf4",
		picker: {
			bg: "#1e2030",
			fg: "#cad3f5",
			border: "#363a4f",
			selection: {
				bg: "#363a4f",
				fg: "#c6a0f6",
				indicator: "#c6a0f6",
			},
			match: "#8aadf4",
			prompt: "#c6a0f6",
		},
		clue: {
			bg: "#1e2030",
			fg: "#cad3f5",
			key: "#c6a0f6",
			desc: "#939ab7",
			title: "#f5a97f",
			border: "#363a4f",
		},
	},
};
