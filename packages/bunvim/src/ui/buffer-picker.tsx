import { useState } from "react";
import * as Document from "../core/document";

type BufferPickerProps = {
	onSelect: (docId: number) => void;
	onClose: () => void;
};

export function BufferPicker({
	onSelect: _onSelect,
	onClose: _onClose,
}: BufferPickerProps) {
	const docs = Document.getAll();
	const [filter, _setFilter] = useState("");

	const filteredDocs = docs.filter((doc) =>
		(doc.path || "").toLowerCase().includes(filter.toLowerCase()),
	);

	return (
		<box
			position="absolute"
			left="25%"
			top="25%"
			width="50%"
			height="50%"
			backgroundColor="#1a1a1a"
			flexDirection="column"
		>
			<box
				flexDirection="row"
				backgroundColor="#333333"
				paddingLeft={1}
				height={1}
			>
				<box style={{ width: 1, backgroundColor: "#00aaff", marginRight: 1 }} />
				<text fg="#00aaff">Buffers</text>
			</box>
			<box height={1} paddingLeft={1} marginTop={1}>
				<text fg="#ffffff">Filter: </text>
				<text fg="#ffff00">{filter}</text>
			</box>
			<box flexGrow={1} flexDirection="column" marginTop={1}>
				{filteredDocs.map((doc) => (
					<box key={doc.id} style={{ paddingLeft: 1 }}>
						<text fg="#ffffff">{doc.path || "[No Name]"}</text>
						{doc.dirty && <text fg="#ff0000"> *</text>}
					</box>
				))}
			</box>
		</box>
	);
}
