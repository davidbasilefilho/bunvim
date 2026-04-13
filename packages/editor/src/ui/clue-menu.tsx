import { editorUiStore, getColors, getMatchingKeymaps } from "@bunvim/sdk";
import { createMemo, For, Show } from "solid-js";

export function ClueMenu() {
  const colors = createMemo(() => getColors());

  const matchingKeys = createMemo(() => {
    const pending = editorUiStore.pendingKeys;
    if (!pending) return [];

    const mode = editorUiStore.mode;
    if (mode.type === "insert" || mode.type === "command" || mode.type === "search") {
      return [];
    }
    return getMatchingKeymaps(pending, mode);
  });

  const hasClues = createMemo(() => matchingKeys().length > 0);

  return (
    <Show when={hasClues()}>
      <box>
        <box
          position="absolute"
          left="10%"
          bottom={3}
          width="80%"
          style={{
            backgroundColor: colors().overlay,
            border: true,
            borderStyle: "single",
            borderColor: colors().surface,
            padding: 1,
          }}>
          <box flexDirection="column">
            <For each={matchingKeys()}>
              {(entry) => (
                <box flexDirection="row" style={{ height: 1 }}>
                  <text fg={colors().info} style={{ width: 15 }}>
                    {entry.lhs}
                  </text>
                  <text fg={colors().fg}>{entry.description ?? ""}</text>
                </box>
              )}
            </For>
          </box>
        </box>
      </box>
    </Show>
  );
}
