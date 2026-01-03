import "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			// biome-ignore lint/suspicious/noExplicitAny: TUI elements
			box: any;
			// biome-ignore lint/suspicious/noExplicitAny: TUI elements
			text: any;
			// biome-ignore lint/suspicious/noExplicitAny: TUI elements
			span: any;
		}
	}
}
