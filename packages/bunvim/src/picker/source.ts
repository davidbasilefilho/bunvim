import type { Effect } from "effect";

export type PickerItem = {
	text: string;
	data?: any;
};

export interface PickerSource {
	name: string;
	getItems: (query: string) => Effect.Effect<PickerItem[], any, never>;
}
