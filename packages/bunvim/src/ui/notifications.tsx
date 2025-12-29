import { useEffect, useState } from "react";
import { getNotifications, type Notification } from "../api/notify";

export function Notifications() {
	const [list, setList] = useState<Notification[]>([]);

	useEffect(() => {
		const timer = setInterval(() => {
			setList([...getNotifications()]);
		}, 100);
		return () => clearInterval(timer);
	}, []);

	if (list.length === 0) return null;

	return (
		<box
			position="absolute"
			right={1}
			top={2}
			width={40}
			flexDirection="column"
			alignItems="flex-end"
		>
			{list.map((n) => (
				<box
					key={n.id}
					backgroundColor={
						n.level === "error"
							? "#f7768e"
							: n.level === "warn"
								? "#e0af68"
								: n.level === "success"
									? "#9ece6a"
									: "#1f2335"
					}
					paddingLeft={1}
					paddingRight={1}
					marginBottom={1}
				>
					<text fg={n.level === "info" ? "#c0caf5" : "#1a1b26"}>
						{n.message}
					</text>
				</box>
			))}
		</box>
	);
}
