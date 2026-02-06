import type { Mode } from "@bunvim/sdk";
import { displayName } from "@bunvim/sdk";
import { Show } from "solid-js";

type StatuslineProps = {
	mode: Mode;
	cursorLine: number;
	cursorColumn: number;
	bufferName?: string;
	modified?: boolean;
	pendingKeys?: string;
};

const modeColors: Record<string, string> = {
	insert: "#9ece6a",
	visual: "#bb9af7",
	command: "#ff9e64",
	search: "#ff9e64",
	"operator-pending": "#3d59a1",
	normal: "#3d59a1",
};

function getModeBg(mode: Mode): string {
	return modeColors[mode.type] ?? "#3d59a1";
}

export function Statusline(props: StatuslineProps) {
	const position = () => `${props.cursorLine + 1}:${props.cursorColumn + 1}`;

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
					bg={getModeBg(props.mode)}
					fg="#1a1b26"
					style={{ paddingLeft: 1, paddingRight: 1 }}
				>
					{displayName(props.mode)}
				</text>
			</box>

			<box flexDirection="row" alignItems="center">
				<Show when={props.pendingKeys}>
					<text fg="#e0af68" style={{ paddingRight: 1 }}>
						{props.pendingKeys}
					</text>
				</Show>
				<text fg="#c0caf5" style={{ paddingLeft: 1, paddingRight: 1 }}>
					{position()}
				</text>
			</box>
		</box>
	);
}
