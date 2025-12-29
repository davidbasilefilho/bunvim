import type React from "react";
import { Window } from "./window";

type DialogProps = {
	title: string;
	description: string;
	onClose: () => void;
	children?: React.ReactNode;
};

export function Dialog({ title, description, onClose, children }: DialogProps) {
	return (
		<Window
			id={888}
			type="floating"
			anchor="center"
			width={50}
			height={10}
			title={title}
			dim={true}
		>
			<box
				flexDirection="column"
				padding={1}
				style={{ backgroundColor: "#16161e" }}
			>
				<DialogDescription text={description} />
				<box flexGrow={1} style={{ marginTop: 1 }}>
					{children}
				</box>
			</box>
		</Window>
	);
}

export function DialogDescription({ text }: { text: string }) {
	return <text fg="#c0caf5">{text}</text>;
}

export function DialogList({ children }: { children: React.ReactNode }) {
	return (
		<box flexDirection="column" style={{ marginTop: 1 }}>
			{children}
		</box>
	);
}

export function DialogItem({
	label,
	selected,
	onSelect,
}: {
	label: string;
	selected?: boolean;
	onSelect: () => void;
}) {
	return (
		<box
			onMouseDown={onSelect}
			style={{
				paddingLeft: 1,
				backgroundColor: selected ? "#292e42" : undefined,
			}}
		>
			<text fg={selected ? "#7aa2f7" : "#a9b1d6"}>
				{selected ? "❯ " : "  "}
				{label}
			</text>
		</box>
	);
}
