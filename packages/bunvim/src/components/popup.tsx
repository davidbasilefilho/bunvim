import type React from "react";

type PopupProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	title?: string;
	children: React.ReactNode;
	focused?: boolean;
};

export function Popup({
	x,
	y,
	width,
	height,
	title,
	children,
	focused,
}: PopupProps) {
	return (
		<box
			position="absolute"
			left={x}
			top={y}
			width={width}
			height={height}
			border={true}
			borderColor={focused ? "#7aa2f7" : "#3b4261"}
			title={title}
			backgroundColor="#16161e"
		>
			{children}
		</box>
	);
}
