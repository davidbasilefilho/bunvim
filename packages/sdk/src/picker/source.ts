import type { Effect } from "effect";

export type PickerItem = {
  text: string;
  data?: unknown;
};

export interface PickerSource {
  name: string;
  getItems: (query: string) => Effect.Effect<PickerItem[], never, never>;
}
