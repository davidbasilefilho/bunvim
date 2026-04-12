import { createStore } from "solid-js/store";

export type NotificationLevel = "info" | "warn" | "error" | "success";

export type Notification = {
  id: number;
  message: string;
  level: NotificationLevel;
  timeout?: number;
};

interface NotificationStore {
  notifications: Notification[];
  nextId: number;
}

const [store, setStore] = createStore<NotificationStore>({
  notifications: [],
  nextId: 1,
});

export function notify(
  message: string,
  level: NotificationLevel = "info",
  opts: { timeout?: number } = {},
) {
  const id = store.nextId;
  const n: Notification = { id, message, level, ...opts };

  setStore("notifications", (prev) => [...prev, n]);
  setStore("nextId", (prev) => prev + 1);

  if (n.timeout) {
    setTimeout(() => {
      dismiss(id);
    }, n.timeout);
  }

  return id;
}

export function dismiss(id: number) {
  setStore("notifications", (prev) => prev.filter((n) => n.id !== id));
}

export function getNotifications(): Notification[] {
  return store.notifications;
}

export { store as notificationStore };
