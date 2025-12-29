type TablineProps = {
	buffers: Array<{ id: number; name: string }>;
	activeBufferId: number;
};

export function Tabline({ buffers, activeBufferId }: TablineProps) {
	if (buffers.length < 2) return null;

	return (
		<box flexDirection="row" style={{ height: 1, backgroundColor: "#222222" }}>
			{buffers.map((buf) => (
				<box
					key={buf.id}
					style={{
						paddingLeft: 1,
						paddingRight: 1,
						backgroundColor: buf.id === activeBufferId ? "#333333" : "#1a1a1a",
					}}
				>
					<text fg={buf.id === activeBufferId ? "#00ff00" : "#aaaaaa"}>
						{buf.id === activeBufferId
							? `■ ${buf.name || "[No Name]"}`
							: buf.name || "[No Name]"}
					</text>
				</box>
			))}
		</box>
	);
}
