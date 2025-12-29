import * as Options from "../api/options";

type InputPopupProps = {
	label: string;
	value: string;
	icon?: string;
};

export function InputPopup({ label, value, icon }: InputPopupProps) {
	const showIcon = Options.opt.nerdFont;
	const displayIcon = showIcon ? (icon === "/" ? "" : ":") : "";
	const displayLabel = showIcon ? "" : label === "COMMAND" ? "CMD" : label;

	return (
		<box
			position="absolute"
			left="25%"
			top="35%"
			width="50%"
			height={5}
			flexDirection="row"
			alignItems="center"
		>
			<box
				style={{
					width: 1,
					height: 3,
					marginRight: 1,
					backgroundColor: "#7aa2f7",
				}}
			/>
			<box
				flexDirection="row"
				flexGrow={1}
				alignItems="center"
				justifyContent="flex-start"
				style={{
					height: 3,
					backgroundColor: "#24283b",
					paddingLeft: 2,
					paddingRight: 2,
				}}
			>
				{showIcon ? (
					<text fg="#7aa2f7" style={{ marginRight: 1 }}>
						{displayIcon}
					</text>
				) : (
					<text fg="#e0af68" style={{ marginRight: 1 }}>
						{displayLabel}
					</text>
				)}
				<text fg="#c0caf5">{value}</text>
				<text fg="#7aa2f7">|</text>
			</box>
		</box>
	);
}
