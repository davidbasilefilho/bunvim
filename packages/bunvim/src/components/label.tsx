import type React from "react";

export type LabelProps = {
	text: string;
	htmlFor?: string; // TUI doesn't really use htmlFor, but for API compatibility
	required?: boolean;
};

export function Label({ text, htmlFor, required = false }: LabelProps) {
	return (
		<box flexDirection="row" marginBottom={0}>
			<text fg="#c0caf5" bold={true}>
				{text}
			</text>
			{required && (
				<text fg="#f7768e" style={{ marginLeft: 1 }}>
					*
				</text>
			)}
		</box>
	);
}
