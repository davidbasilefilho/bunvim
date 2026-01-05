import { Activity } from "react";
import type * as Keymap from "../keybindings/keymap";

type StatuslineProps = {
	mode: Keymap.EditorMode;
	cursorLine: number;
	cursorColumn: number;
	bufferName?: string;
	modified?: boolean;
	pendingKeys?: string;
};

function getModeDisplay(mode: Keymap.EditorMode): { text: string; bg: string } {
	switch (mode.type) {
		case "insert":
			return { text: "INSERT", bg: "#9ece6a" };
		case "visual":
			switch (mode.subtype) {
				case "line":
					return { text: "V-LINE", bg: "#bb9af7" };
				case "block":
					return { text: "V-BLOCK", bg: "#bb9af7" };
				default:
					return { text: "VISUAL", bg: "#bb9af7" };
			}
		case "command":
			return { text: "COMMAND", bg: "#ff9e64" };
		default:
			return { text: "NORMAL", bg: "#3d59a1" };
	}
}

export function Statusline({
	mode,
	cursorLine,
	cursorColumn,
	bufferName,
	pendingKeys,
}: StatuslineProps) {
	const modeInfo = getModeDisplay(mode);
	const position = `${cursorLine + 1}:${cursorColumn + 1}`;
	const _fileName = bufferName || "[No Name]";

	return (
		<box
			flexDirection="row"
			style={{
				height: 1,
				backgroundColor: "#16161e",
				justifyContent: "space-between",
			}}
		>
			<box flexDirection="row" alignItems="center">
				<text
					bg={modeInfo.bg}
					fg="#1a1b26"
					style={{ paddingLeft: 1, paddingRight: 1 }}
				>
					{modeInfo.text}
				</text>
			</box>

			<box flexDirection="row" alignItems="center">
				<Activity mode={pendingKeys ? "visible" : "hidden"}>
					<text fg="#e0af68" style={{ paddingRight: 1 }}>
						{pendingKeys ?? ""}
					</text>
				</Activity>
				<text fg="#c0caf5" style={{ paddingLeft: 1, paddingRight: 1 }}>
					{position}
				</text>
			</box>
		</box>
	);
}
