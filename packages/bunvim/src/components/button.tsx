import type React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "small" | "medium" | "large";
type ButtonType = "button" | "submit" | "reset";

export type ButtonProps = {
	children?: React.ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	type?: ButtonType;
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
};

export function Button({
	children,
	variant = "primary",
	size = "medium",
	type = "button",
	disabled = false,
	loading = false,
	onClick,
}: ButtonProps) {
	const getBackgroundColor = () => {
		if (disabled) return "#565f89";
		switch (variant) {
			case "primary":
				return "#7aa2f7";
			case "secondary":
				return "#3b4261";
			case "danger":
				return "#f7768e";
			default:
				return "#7aa2f7";
		}
	};

	const getTextColor = () => {
		if (disabled) return "#a9b1d6";
		switch (variant) {
			case "primary":
				return "#1a1b26";
			case "secondary":
				return "#c0caf5";
			case "danger":
				return "#1a1b26";
			default:
				return "#1a1b26";
		}
	};

	const getPadding = () => {
		switch (size) {
			case "small":
				return 0;
			case "medium":
				return 1;
			case "large":
				return 2;
			default:
				return 1;
		}
	};

	return (
		<box
			role="button"
			flexDirection="row"
			alignItems="center"
			justifyContent="center"
			style={{
				backgroundColor: getBackgroundColor(),
				paddingLeft: getPadding() + 1, // +1 for horizontal visual balance
				paddingRight: getPadding() + 1,
				height: size === "small" ? 1 : size === "medium" ? 3 : 5,
			}}
			onMouseDown={() => {
				if (!disabled && !loading && onClick) {
					onClick();
				}
			}}
		>
			<text fg={getTextColor()}>{loading ? "Loading..." : children}</text>
		</box>
	);
}
