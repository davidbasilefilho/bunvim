export type PickerItem = {
  text: string;
  data?: unknown;
};

export interface PickerSource {
  name: string;
  getItems: (query: string) => Promise<PickerItem[]>;
  onSelect?: (item: PickerItem) => void;
}
