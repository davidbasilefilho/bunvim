import { useEffect, useState } from "react";
import { type StatusItem, subscribe } from "../api/status";
import { getColors } from "../theme/manager";

export function Statistics() {
	const colors = getColors();
	const [items, setItems] = useState<StatusItem[]>([]);

	useEffect(() => {
		return subscribe(setItems);
	}, []);

	if (items.length === 0) return null;

	return (
		<box
			position="absolute"
			right={1}
			bottom={2}
			flexDirection="column"
			alignItems="flex-end"
		>
			{items.map((item) => (
				<box
					key={item.id}
					backgroundColor={colors.surface}
					paddingLeft={1}
					paddingRight={1}
					marginBottom={1}
				>
					<text
						fg={
							item.type === "error"
								? colors.error
								: item.type === "success"
									? colors.success
									: item.type === "loading"
										? colors.info
										: colors.fg
						}
					>
						{item.type === "loading" ? "⟳ " : ""}
						{item.message}
					</text>
				</box>
			))}
		</box>
	);
}
