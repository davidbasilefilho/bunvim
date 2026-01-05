import { useKeyboard } from "@opentui/react";
import { Activity, useState } from "react";

export type CompletionItem = {
	label: string;
	detail?: string;
	kind?: string;
};

type CompletionMenuProps = {
	items: CompletionItem[];
	onSelect: (item: CompletionItem) => void;
	onClose: () => void;
};

export function CompletionMenu({
	items,
	onSelect,
	onClose,
}: CompletionMenuProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useKeyboard((key) => {
		if (key.name === "escape" || (key.ctrl && key.name === "e")) {
			onClose();
			return;
		}

		if (key.name === "return" || (key.ctrl && key.name === "y")) {
			const item = items[selectedIndex];
			if (item) {
				onSelect(item);
			}
			return;
		}

		if (key.name === "up" || (key.ctrl && key.name === "p")) {
			setSelectedIndex((i) => Math.max(0, i - 1));
			return;
		}

		if (key.name === "down" || (key.ctrl && key.name === "n")) {
			setSelectedIndex((i) => Math.min(items.length - 1, i + 1));
			return;
		}
	});

	if (items.length === 0) return null;

	return (
		<box
			flexDirection="column"
			backgroundColor="#1a1b26"
			border={true}
			borderColor="#7aa2f7"
			width={40}
			height={Math.min(10, items.length)}
		>
			{items.map((item, i) => (
				<box
					key={i}
					flexDirection="row"
					style={{
						backgroundColor: i === selectedIndex ? "#3b4261" : undefined,
						paddingLeft: 1,
					}}
				>
					<text fg="#7aa2f7" style={{ width: 2 }}>
						{item.kind?.[0] || " "}
					</text>
					<text fg={i === selectedIndex ? "#c0caf5" : "#a9b1d6"}>
						{item.label}
					</text>
					<Activity mode={item.detail ? "visible" : "hidden"}>
						<text fg="#565f89" style={{ marginLeft: 1 }}>
							{item.detail ?? ""}
						</text>
					</Activity>
				</box>
			))}
		</box>
	);
}
