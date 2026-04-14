import { activePicker, editorUiActions, fuzzyMatch, getColors, setActivePicker } from "@bunvim/sdk";
import type { PickerItem, PickerSource } from "@bunvim/sdk";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";

import { InputPopup } from "./input-popup";

const VISIBLE_LINES = 12;

const [pickerQuery, setPickerQuery] = createSignal("");
const [pickerItems, setPickerItems] = createSignal<PickerItem[]>([]);
const [pickerSelectedIndex, setPickerSelectedIndex] = createSignal(0);
const [pickerLoading, setPickerLoading] = createSignal(false);

const filteredPickerItems = createMemo(() => {
  const q = pickerQuery();
  if (!q) return pickerItems();
  return pickerItems()
    .map((item) => ({ item, score: fuzzyMatch(q, item.text) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
});

let pickerLoadToken = 0;

async function loadPickerItems(src: PickerSource, query: string) {
  const token = ++pickerLoadToken;
  setPickerLoading(true);
  try {
    const result = await src.getItems(query);
    if (token !== pickerLoadToken) return;
    setPickerItems(result);
    setPickerSelectedIndex(0);
  } finally {
    if (token === pickerLoadToken) setPickerLoading(false);
  }
}

function selectPickerItem() {
  const visible = filteredPickerItems();
  const idx = pickerSelectedIndex();
  const src = activePicker();
  if (src && visible[idx]) {
    src.onSelect?.(visible[idx]);
  }
  setActivePicker(undefined);
  editorUiActions.setMode({ type: "normal" });
}

function closePicker() {
  setActivePicker(undefined);
  editorUiActions.setMode({ type: "normal" });
}

createEffect(() => {
  const src = activePicker();
  if (src) {
    setPickerQuery("");
    setPickerItems([]);
    setPickerSelectedIndex(0);
  }
});

createEffect(() => {
  const src = activePicker();
  const query = pickerQuery();
  if (!src) return;
  void loadPickerItems(src, query);
});

export function handlePickerKey(key: {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  sequence?: string;
  shift?: boolean;
}): boolean {
  if (!activePicker()) return false;

  if (key.ctrl && key.name === "c") {
    closePicker();
    return true;
  }

  if (key.name === "escape") {
    closePicker();
    return true;
  }

  if (key.name === "up" || key.name === "k") {
    setPickerSelectedIndex((i) => Math.max(0, i - 1));
    return true;
  }

  if (key.name === "down" || key.name === "j") {
    setPickerSelectedIndex((i) => Math.min(Math.max(0, filteredPickerItems().length - 1), i + 1));
    return true;
  }

  return false;
}

export function Picker() {
  const colors = createMemo(() => getColors());

  return (
    <Show when={activePicker()}>
      <box
        position="absolute"
        top={2}
        left="10%"
        width="80%"
        style={{
          backgroundColor: colors().overlay,
          border: true,
          borderColor: colors().cursor,
          zIndex: 100,
        }}
        flexDirection="column">
        <InputPopup
          inline
          label={activePicker()?.name ?? "Picker"}
          value={pickerQuery()}
          useNativeInput
          onInput={(value) => setPickerQuery(value)}
          onSubmit={selectPickerItem}
          onCancel={closePicker}
        />

        <box flexDirection="column" flexGrow={1} style={{ paddingLeft: 1, paddingRight: 1 }}>
          <Show when={!pickerLoading()} fallback={<text fg={colors().muted}>Loading...</text>}>
            <For each={filteredPickerItems().slice(0, VISIBLE_LINES)}>
              {(item, idx) => {
                const isSelected = () => idx() === pickerSelectedIndex();
                return (
                  <box
                    flexDirection="row"
                    style={{
                      height: 1,
                      backgroundColor: isSelected() ? colors().surface : undefined,
                    }}>
                    <text fg={isSelected() ? colors().cursor : colors().fg}>{item.text}</text>
                  </box>
                );
              }}
            </For>
          </Show>
        </box>

        <box flexDirection="row" justifyContent="flex-end" style={{ height: 1, paddingRight: 1 }}>
          <text fg={colors().muted}>{filteredPickerItems().length} items</text>
        </box>
      </box>
    </Show>
  );
}
