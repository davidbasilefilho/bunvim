import { useEffect, useState } from "react";
import type { KeymapDefinition } from "../api/keymap";
import { subscribe } from "../api/status";
import { getColors } from "../theme/manager";
import { Window } from "./window";

type ClueProps = {
	pendingKeys: string;
	mappings: readonly KeymapDefinition[];
	scrollTop: number;
	onSelect: () => void;
};

export function Clue({ pendingKeys, mappings, scrollTop }: ClueProps) {
	const colors = getColors();
	const filtered = mappings.filter((m) => m.lhs.startsWith(pendingKeys));
	const [hasStats, setHasStats] = useState(false);

	useEffect(() => {
		return subscribe((items) => {
			setHasStats(items.length > 0);
		});
	}, []);

	if (filtered.length === 0) return null;

	const bottomOffset = hasStats ? 6 : 2;

	return (
		<Window
			id={998}
			type="floating"
			anchor="bottom-right"
			margins={{ right: 1, bottom: bottomOffset }}
			width={40}
			height={Math.min(12, filtered.length + 2)}
			hideTabline={true}
			singleBuffer={true}
		>
			<box flexGrow={1} flexDirection="column" backgroundColor={colors.clue.bg}>
				<box
					flexDirection="row"
					alignItems="center"
					paddingRight={1}
					paddingTop={1}
					paddingBottom={1}
				>
					<box
						style={{
							width: 1,
							height: 1,
							backgroundColor: colors.clue.title,
							marginRight: 1,
						}}
					/>
					<text fg={colors.clue.title}>CLUES: {pendingKeys}</text>
				</box>
				<box flexDirection="column" flexGrow={1}>
					{filtered.slice(scrollTop, scrollTop + 10).map((m, i) => (
						<box
							key={i}
							flexDirection="row"
							justifyContent="space-between"
							style={{ backgroundColor: undefined }}
						>
							<text fg={colors.clue.key} style={{ paddingLeft: 1 }}>
								{m.lhs.slice(pendingKeys.length) || "⏎"}
							</text>
							<text fg={colors.clue.desc} style={{ paddingRight: 1 }}>
								{m.opts.desc || "..."}
							</text>
						</box>
					))}
				</box>
				{filtered.length > 10 && (
					<box height={1}>
						<text fg={colors.muted}>
							{scrollTop + 1}-{Math.min(scrollTop + 10, filtered.length)} /{" "}
							{filtered.length}
						</text>
					</box>
				)}
			</box>
		</Window>
	);
}
