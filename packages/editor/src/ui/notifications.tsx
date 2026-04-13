import { notificationStore } from "@bunvim/sdk";
import { For } from "solid-js";

export function Notifications() {
  const getBackgroundColor = (level: string) => {
    switch (level) {
      case "error":
        return "#f7768e";
      case "warn":
        return "#e0af68";
      case "success":
        return "#9ece6a";
      default:
        return "#1f2335";
    }
  };

  const getForegroundColor = (level: string) => {
    return level === "info" ? "#c0caf5" : "#1a1b26";
  };

  return (
    <box
      position="absolute"
      right={1}
      top={2}
      width={40}
      flexDirection="column"
      alignItems="flex-end">
      <For each={notificationStore.notifications}>
        {(n) => (
          <box
            backgroundColor={getBackgroundColor(n.level)}
            style={{
              paddingLeft: 1,
              paddingRight: 1,
              marginBottom: 1,
            }}>
            <text fg={getForegroundColor(n.level)}>{n.message}</text>
          </box>
        )}
      </For>
    </box>
  );
}
