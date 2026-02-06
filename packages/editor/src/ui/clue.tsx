import { getColors } from "@bunvim/sdk";
import { createMemo, For, Show } from "solid-js";

interface ClueProps {
	pendingKeys: string;
	mappings: Array<{ lhs: string; description?: string }>;
	scrollTop: number;
}

export function Clue(props: ClueProps) {
	const colors = createMemo(() => getColors());

	const filtered = createMemo(() =>
		props.mappings.filter((m) => m.lhs.startsWith(props.pendingKeys)),
	);

	return (
		<Show when={filtered().length > 0}>
			<box
				position="absolute"
				right={1}
				bottom={2}
				width={40}
				height={Math.min(12, filtered().length + 2)}
				style={{
					backgroundColor: colors().clue.bg,
					border: true,
					borderStyle: "single",
					borderColor: colors().clue.border,
				}}
			>
				<box
					flexDirection="row"
					alignItems="center"
					style={{
						paddingLeft: 1,
						paddingTop: 1,
						paddingBottom: 1,
					}}
				>
					<box
						style={{
							width: 1,
							height: 1,
							backgroundColor: colors().clue.title,
							marginRight: 1,
						}}
					/>
					<text fg={colors().clue.title}>CLUES: {props.pendingKeys}</text>
				</box>
				<box flexDirection="column" flexGrow={1}>
					<For each={filtered().slice(props.scrollTop, props.scrollTop + 10)}>
						{(m) => (
							<box
								flexDirection="row"
								justifyContent="space-between"
								style={{ backgroundColor: undefined }}
							>
								<text fg={colors().clue.key} style={{ paddingLeft: 1 }}>
									{m.lhs.slice(props.pendingKeys.length) || "⏎"}
								</text>
								<text fg={colors().clue.desc} style={{ paddingRight: 1 }}>
									{m.description || "..."}
								</text>
							</box>
						)}
					</For>
				</box>
				<Show when={filtered().length > 10}>
					<box height={1}>
						<text fg={colors().muted}>
							{props.scrollTop + 1}-
							{Math.min(props.scrollTop + 10, filtered().length)} /{" "}
							{filtered().length}
						</text>
					</box>
				</Show>
			</box>
		</Show>
	);
}
