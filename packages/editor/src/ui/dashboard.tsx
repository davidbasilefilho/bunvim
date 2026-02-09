import { getColors } from "@bunvim/sdk";
import { createMemo, createSignal, For } from "solid-js";

interface DashboardAction {
	label: string;
	shortcut: string;
	id: string;
}

const DASHBOARD_ACTIONS: DashboardAction[] = [
	{ label: "New File", shortcut: "e", id: "new-file" },
	{ label: "Find File", shortcut: "f", id: "find-file" },
	{ label: "Grep", shortcut: "g", id: "grep" },
	{ label: "Recent Files", shortcut: "r", id: "recent" },
	{ label: "Quit", shortcut: "q", id: "quit" },
];

type DashboardKeyHandler = (key: {
	name?: string;
	sequence?: string;
	ctrl?: boolean;
}) => boolean;

interface DashboardProps {
	onAction: (actionId: string) => void;
	onReady: (handler: DashboardKeyHandler) => void;
	version?: string;
}

export function Dashboard(props: DashboardProps) {
	const colors = createMemo(() => getColors());
	const [selectedIndex, setSelectedIndex] = createSignal(0);

	const handleDashboardKey: DashboardKeyHandler = (key) => {
		if (key.name === "j" || key.name === "down") {
			setSelectedIndex((i) => Math.min(i + 1, DASHBOARD_ACTIONS.length - 1));
			return true;
		}
		if (key.name === "k" || key.name === "up") {
			setSelectedIndex((i) => Math.max(i - 1, 0));
			return true;
		}
		if (key.name === "return") {
			const act = DASHBOARD_ACTIONS[selectedIndex()];
			if (act) props.onAction(act.id);
			return true;
		}

		const seq = key.sequence;
		if (seq && seq.length === 1) {
			const match = DASHBOARD_ACTIONS.find((a) => a.shortcut === seq);
			if (match) {
				props.onAction(match.id);
				return true;
			}
		}

		return false;
	};

	props.onReady(handleDashboardKey);

	return (
		<box
			flexGrow={1}
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			style={{ backgroundColor: colors().bg }}
		>
			<ascii_font text="BUNVIM" font="block" color={colors().cursor} />

			<box height={1} />

			<text fg={colors().muted}>{props.version ?? "v0.1.0"}</text>

			<box height={2} />

			<box flexDirection="column" alignItems="flex-start" style={{ width: 30 }}>
				<For each={DASHBOARD_ACTIONS}>
					{(action, idx) => {
						const isSelected = () => idx() === selectedIndex();
						return (
							<box
								flexDirection="row"
								style={{
									width: 30,
									height: 1,
									backgroundColor: isSelected() ? colors().surface : undefined,
								}}
							>
								<text fg={colors().cursor} style={{ width: 3 }}>
									{isSelected() ? ">" : " "}
								</text>
								<text fg={colors().info} style={{ width: 3 }}>
									{action.shortcut}
								</text>
								<text fg={colors().fg}>{action.label}</text>
							</box>
						);
					}}
				</For>
			</box>

			<box height={2} />

			<text fg={colors().muted}>Press key or navigate with j/k</text>
		</box>
	);
}

export { DASHBOARD_ACTIONS, type DashboardAction, type DashboardKeyHandler };
