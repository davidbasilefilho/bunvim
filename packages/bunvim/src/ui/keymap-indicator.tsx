type KeymapIndicatorProps = {
	keys: { key: string; description: string }[];
};

export function KeymapIndicator({ keys }: KeymapIndicatorProps) {
	return (
		<box flexDirection="row" style={{ backgroundColor: "#1f2335", height: 1 }}>
			{keys.map((k, i) => (
				<box key={i} flexDirection="row" style={{ marginRight: 2 }}>
					<text fg="#bb9af7" style={{ paddingLeft: 1 }}>
						{k.key}
					</text>
					<text fg="#565f89"> {k.description}</text>
				</box>
			))}
		</box>
	);
}
