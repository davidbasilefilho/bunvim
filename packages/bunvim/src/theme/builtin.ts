export interface Theme {
	readonly name: string;
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
		readonly constant: string;
	};
}

export const tokyoNight: Theme = {
	name: "tokyo-night",
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
		constant: "#ff9e64",
	},
};

export const catppuccin: Theme = {
	name: "catppuccin",
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
		constant: "#fab387",
	},
};
