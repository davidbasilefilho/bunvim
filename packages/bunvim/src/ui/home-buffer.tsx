import { useTerminalDimensions } from "@opentui/react";
import * as Options from "../api/options";

type KeybindHint = {
	key: string;
	description: string;
	icon?: string;
};

const KEYBIND_HINTS: KeybindHint[] = [
	{ key: "e", description: "New file", icon: "" },
	{ key: "ff", description: "Find file", icon: "" },
	{ key: "f/", description: "Find text", icon: "" },
	{ key: "/", description: "Grep in file", icon: "" },
	{ key: "b", description: "Buffers", icon: "" },
	{ key: "r", description: "Recent files", icon: "" },
	{ key: "m", description: "Marks", icon: "" },
	{ key: "q", description: "Quit", icon: "" },
];

export function HomeBuffer({ onAction }: { onAction?: (key: string) => void }) {
	const { width: _width, height: _height } = useTerminalDimensions();
	const showIcon = Options.opt.nerdFont;
	const leader = Options.opt.leader === "<Space>" ? "SPC" : Options.opt.leader;

	return (
		<box
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			style={{
				flexGrow: 1,
				backgroundColor: "#1a1b26",
			}}
		>
			<box flexDirection="column" alignItems="center">
				<ascii-font text="bunvim" font="block" color="#7aa2f7" />

				<text fg="#565f89" style={{ marginTop: 2 }}>
					Neovim-like editor built with TypeScript and Bun
				</text>

				<box
					flexDirection="column"
					alignItems="flex-start"
					style={{ marginTop: 4 }}
				>
					{KEYBIND_HINTS.map((hint) => (
						<box
							role="button"
							key={hint.key}
							flexDirection="row"
							style={{ marginBottom: 1 }}
							onMouseDown={() => onAction?.(hint.key)}
						>
							<text fg="#bb9af7" style={{ width: 12 }}>
								{leader} {hint.key}
							</text>
							{showIcon && hint.icon && (
								<text fg="#7aa2f7" style={{ width: 3 }}>
									{hint.icon}
								</text>
							)}
							<text fg="#c0caf5">{hint.description}</text>
						</box>
					))}
				</box>

				<box flexDirection="row" style={{ marginTop: 3 }}>
					<text fg="#565f89">Press </text>
					<text fg="#e0af68">:</text>
					<text fg="#565f89"> to enter command mode</text>
				</box>
			</box>
		</box>
	);
}
