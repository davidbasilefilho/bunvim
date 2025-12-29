export type LabelProps = {
	text: string;
	htmlFor?: string; // TUI doesn't really use htmlFor, but for API compatibility
	required?: boolean;
};

export function Label({
	text,
	htmlFor: _htmlFor,
	required = false,
}: LabelProps) {
	return (
		<box flexDirection="row" marginBottom={0}>
			<text fg="#c0caf5">{text}</text>
			{required && (
				<text fg="#f7768e" style={{ marginLeft: 1 }}>
					*
				</text>
			)}
		</box>
	);
}
