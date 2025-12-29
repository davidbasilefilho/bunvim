type InputType = "text" | "password" | "email" | "number";
type InputSize = "small" | "medium" | "large";

export type InputProps = {
	type?: InputType;
	size?: InputSize;
	disabled?: boolean;
	value?: string;
	name?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
};

export function Input({
	type = "text",
	size = "medium",
	disabled = false,
	value = "",
	name,
	onChange,
	placeholder,
}: InputProps) {
	const getHeight = () => {
		switch (size) {
			case "small":
				return 1;
			case "medium":
				return 3;
			case "large":
				return 5;
			default:
				return 3;
		}
	};

	// Mocking input behavior for TUI since actual input handling requires
	// keyboard event capturing at a higher level or a specialized hook.
	// For display purposes in this task:
	const displayValue = type === "password" ? "*".repeat(value.length) : value;

	return (
		<box
			style={{
				height: getHeight(),
				backgroundColor: disabled ? "#1f2335" : "#16161e",
				borderStyle: "single",
				borderColor: disabled ? "#565f89" : "#7aa2f7",
				paddingLeft: 1,
				paddingRight: 1,
				justifyContent: "center",
			}}
		>
			{displayValue ? (
				<text fg={disabled ? "#565f89" : "#c0caf5"}>{displayValue}</text>
			) : (
				<text fg="#565f89">{placeholder}</text>
			)}
		</box>
	);
}
