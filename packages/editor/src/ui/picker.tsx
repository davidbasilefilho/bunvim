import { activePicker, editorUiActions, fuzzyMatch, getColors, setActivePicker } from "@bunvim/sdk";
import type { PickerItem, PickerSource } from "@bunvim/sdk";
import { Effect } from "effect";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";

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

function loadPickerItems(src: PickerSource) {
  setPickerLoading(true);
  const program = src.getItems(pickerQuery());
  Effect.runFork(
    Effect.gen(function* () {
      const result = yield* program;
      setPickerItems(result);
      setPickerSelectedIndex(0);
      setPickerLoading(false);
    }),
  );
}

function refreshPickerItems() {
  const src = activePicker();
  if (!src) return;
  setPickerLoading(true);
  const program = src.getItems(pickerQuery());
  Effect.runFork(
    Effect.gen(function* () {
      const result = yield* program;
      setPickerItems(result);
      setPickerSelectedIndex(0);
      setPickerLoading(false);
    }),
  );
}

createEffect(() => {
  const src = activePicker();
  if (src) {
    setPickerQuery("");
    setPickerItems([]);
    setPickerSelectedIndex(0);
    loadPickerItems(src);
  }
});

export function handlePickerKey(key: {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  sequence?: string;
  shift?: boolean;
}): boolean {
  if (!activePicker()) return false;

  if (key.name === "escape" || (key.ctrl && key.name === "c")) {
    setActivePicker(undefined);
    editorUiActions.setMode({ type: "normal" });
    return true;
  }

  if (key.name === "return" || key.name === "enter") {
    const visible = filteredPickerItems();
    const idx = pickerSelectedIndex();
    const src = activePicker();
    if (src && visible[idx]) {
      src.onSelect?.(visible[idx]);
    }
    setActivePicker(undefined);
    editorUiActions.setMode({ type: "normal" });
    return true;
  }

  if (key.name === "up" || key.name === "k") {
    setPickerSelectedIndex((i) => Math.max(0, i - 1));
    return true;
  }

  if (key.name === "down" || key.name === "j") {
    setPickerSelectedIndex((i) => Math.min(filteredPickerItems().length - 1, i + 1));
    return true;
  }

  if (key.name === "backspace") {
    const q = pickerQuery();
    if (q.length > 0) {
      setPickerQuery(q.slice(0, -1));
      refreshPickerItems();
    } else {
      setActivePicker(undefined);
      editorUiActions.setMode({ type: "normal" });
    }
    return true;
  }

  if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
    setPickerQuery((q) => q + key.sequence!);
    refreshPickerItems();
    return true;
  }

  return true;
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
          borderColor: colors().accent,
          zIndex: 100,
        }}
        flexDirection="column">
        <box flexDirection="row" style={{ height: 1, paddingLeft: 1, paddingRight: 1 }}>
          <text fg={colors().accent} bold>
            {activePicker()?.name ?? "Picker"}
          </text>
          <text fg={colors().muted}> &gt; </text>
          <text fg={colors().fg}>{pickerQuery()}</text>
          <text fg={colors().cursor}>|</text>
        </box>

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
                    <text fg={isSelected() ? colors().accent : colors().fg}>{item.text}</text>
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
