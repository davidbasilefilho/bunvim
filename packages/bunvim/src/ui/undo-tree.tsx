import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import * as Undo from "../core/undo";

type UndoTreeProps = {
	onRestore: (nodeId: number) => void;
	onClose: () => void;
};

export function UndoTree({ onRestore, onClose }: UndoTreeProps) {
	const [selectedId, setSelectedId] = useState(Undo.getCurrentNode()?.id ?? 0);

	useKeyboard((key) => {
		if (key.name === "escape" || (key.ctrl && key.name === "c")) {
			onClose();
			return;
		}

		if (key.name === "return") {
			onRestore(selectedId);
			onClose();
			return;
		}

		const current = Undo.getNode(selectedId);
		if (!current) return;

		if (
			(key.name === "up" || key.name === "k") &&
			current.parent !== undefined
		) {
			setSelectedId(current.parent);
			return;
		}

		if (
			(key.name === "down" || key.name === "j") &&
			current.children.length > 0
		) {
			setSelectedId(current.children[current.children.length - 1]!);
			return;
		}

		if (
			(key.name === "left" || key.name === "h") &&
			current.parent !== undefined
		) {
			const parent = Undo.getNode(current.parent);
			if (parent) {
				const idx = parent.children.indexOf(current.id);
				if (idx > 0) {
					setSelectedId(parent.children[idx - 1]!);
				}
			}
			return;
		}

		if (
			(key.name === "right" || key.name === "l") &&
			current.parent !== undefined
		) {
			const parent = Undo.getNode(current.parent);
			if (parent) {
				const idx = parent.children.indexOf(current.id);
				if (idx < parent.children.length - 1) {
					setSelectedId(parent.children[idx + 1]!);
				}
			}
			return;
		}
	});

	return (
		<box
			position="absolute"
			left={0}
			top={0}
			width={30}
			height="100%"
			backgroundColor="#16161e"
			flexDirection="column"
			padding={1}
		>
			<box flexDirection="row" alignItems="center" marginBottom={1}>
				<box
					style={{
						width: 1,
						height: 1,
						backgroundColor: "#bb9af7",
						marginRight: 1,
					}}
				/>
				<text fg="#bb9af7">UNDO TREE</text>
			</box>
			<box flexGrow={1} flexDirection="column">
				<text fg="#565f89">Node: {selectedId}</text>
				<text fg="#c0caf5">Navigation: hjkl</text>
				<text fg="#c0caf5">Restore: Enter</text>
			</box>
		</box>
	);
}
