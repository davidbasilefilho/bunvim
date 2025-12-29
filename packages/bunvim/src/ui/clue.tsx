import type { KeymapDefinition } from "../api/keymap";
import { getColors } from "../theme/manager";

type ClueProps = {
	pendingKeys: string;
	mappings: KeymapDefinition[];
	scrollTop: number;
};

export function Clue({ pendingKeys, mappings, scrollTop }: ClueProps) {
	const colors = getColors();
	const filtered = mappings.filter((m) => m.lhs.startsWith(pendingKeys));

	if (filtered.length === 0) return null;

	return (
		<box
			position="absolute"
			right={1}
			bottom={2}
			width={40}
			height={Math.min(12, filtered.length + 2)}
			backgroundColor={colors.clue.bg}
			flexDirection="column"
			paddingLeft={1}
			paddingRight={1}
		>
			<box flexDirection="row" alignItems="center" marginBottom={1}>
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
	);
}
