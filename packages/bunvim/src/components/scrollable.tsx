import type React from "react";

export type ScrollableProps = {
	children: React.ReactNode;
	height?: number | "auto" | `${number}%`;
	width?: number | "auto" | `${number}%`;
};

export function Scrollable({
	children,
	height = "100%",
	width = "100%",
}: ScrollableProps) {
	// In a real TUI, scrollable usually implies handling scroll events and viewport.
	// Since OpenTUI `box` supports `onMouseScroll`, we wrap children in a box.
	// A "styled scrollbar" in TUI is often just a visual indicator on the right.
	// For this task, we'll create a layout that reserves space for a scrollbar.

	return (
		<box
			width={width}
			height={height}
			flexDirection="row"
			style={{ overflow: "hidden" }} // Hypothetical style property or behavior
		>
			<box flexGrow={1} flexDirection="column">
				{children}
			</box>
			<box
				width={1}
				height="100%"
				style={{ backgroundColor: "#292e42" }}
				flexDirection="column"
			>
				{/* Mock scrollbar thumb */}
				<box
					style={{
						height: "20%", // arbitrary thumb height
						backgroundColor: "#7aa2f7",
					}}
				/>
			</box>
		</box>
	);
}
