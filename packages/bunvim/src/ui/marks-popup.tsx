import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { Mark } from "../marks/store";

type MarksPopupProps = {
	marks: Mark[];
	onSelect: (mark: Mark) => void;
	onRemove: (index: number) => void;
	onClose: () => void;
};

export function MarksPopup({
	marks,
	onSelect,
	onRemove,
	onClose,
}: MarksPopupProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useKeyboard((key) => {
		if (key.name === "escape" || (key.ctrl && key.name === "c")) {
			onClose();
			return;
		}

		if (key.name === "return") {
			const mark = marks[selectedIndex];
			if (mark) {
				onSelect(mark);
			}
			return;
		}

		if (key.name === "up" || key.name === "k") {
			setSelectedIndex((i) => Math.max(0, i - 1));
			return;
		}

		if (key.name === "down" || key.name === "j") {
			setSelectedIndex((i) => Math.min(marks.length - 1, i + 1));
			return;
		}

		if (key.name === "d" || key.name === "x") {
			onRemove(selectedIndex);
			setSelectedIndex((i) => Math.max(0, Math.min(marks.length - 2, i)));
			return;
		}

		const num = Number.parseInt(key.sequence || "", 10);
		if (num >= 1 && num <= 9) {
			const mark = marks[num - 1];
			if (mark) {
				onSelect(mark);
			}
		}
	});

	return (
		<box
			position="absolute"
			left="25%"
			top="20%"
			width="50%"
			height="60%"
			backgroundColor="#1a1b26"
			flexDirection="column"
			padding={1}
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
				<text fg="#e0af68">MARKS</text>
			</box>
			<box flexGrow={1} flexDirection="column">
				{marks.length === 0 ? (
					<text fg="#565f89">No marks set. Press leader+a to add.</text>
				) : (
					marks.map((mark, i) => (
						<box
							key={i}
							flexDirection="row"
							style={{
								backgroundColor: i === selectedIndex ? "#3b4261" : undefined,
								paddingLeft: 1,
							}}
						>
							<text fg="#bb9af7" style={{ width: 3 }}>
								{i + 1}
							</text>
							<text fg={i === selectedIndex ? "#c0caf5" : "#a9b1d6"}>
								{mark.path}
							</text>
						</box>
					))
				)}
			</box>
			<box
				height={1}
				flexDirection="row"
				backgroundColor="#1f2335"
				paddingLeft={1}
			>
				<text fg="#565f89">j/k navigate | ⏎ select | d remove | esc close</text>
			</box>
		</box>
	);
}
