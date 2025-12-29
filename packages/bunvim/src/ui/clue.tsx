import type { KeymapDefinition } from "../api/keymap";

type ClueProps = {
	pendingKeys: string;
	mappings: KeymapDefinition[];
	scrollTop: number;
};

export function Clue({ pendingKeys, mappings, scrollTop }: ClueProps) {
	const filtered = mappings.filter((m) => m.lhs.startsWith(pendingKeys));

	if (filtered.length === 0) return null;

	return (
		<box
			position="absolute"
			right={1}
			bottom={2}
			width={40}
			height={Math.min(12, filtered.length + 2)}
			backgroundColor="#24283b"
			flexDirection="column"
			paddingLeft={1}
			paddingRight={1}
		>
			<box flexDirection="row" alignItems="center" marginBottom={1}>
				<box
					style={{
						width: 1,
						height: 1,
						backgroundColor: "#e0af68",
						marginRight: 1,
					}}
				/>
				<text fg="#e0af68">CLUES: {pendingKeys}</text>
			</box>
			<box flexDirection="column" flexGrow={1}>
				{filtered.slice(scrollTop, scrollTop + 10).map((m, i) => (
					<box
						key={i}
						flexDirection="row"
						justifyContent="space-between"
						style={{ backgroundColor: undefined }}
					>
						<text fg="#7aa2f7" style={{ paddingLeft: 1 }}>
							{m.lhs.slice(pendingKeys.length) || "⏎"}
						</text>
						<text fg="#565f89" style={{ paddingRight: 1 }}>
							{m.opts.desc || "..."}
						</text>
					</box>
				))}
			</box>
			{filtered.length > 10 && (
				<box height={1}>
					<text fg="#3b4261">
						{scrollTop + 1}-{Math.min(scrollTop + 10, filtered.length)} /{" "}
						{filtered.length}
					</text>
				</box>
			)}
		</box>
	);
}
