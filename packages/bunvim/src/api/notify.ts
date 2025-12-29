export type NotificationLevel = "info" | "warn" | "error" | "success";

export type Notification = {
	id: number;
	message: string;
	level: NotificationLevel;
	timeout?: number;
};

const notifications: Notification[] = [];
let nextId = 1;

export function notify(
	message: string,
	level: NotificationLevel = "info",
	opts: { timeout?: number } = {},
) {
	const id = nextId++;
	const n: Notification = { id, message, level, ...opts };
	notifications.push(n);

	if (n.timeout) {
		setTimeout(() => {
			dismiss(id);
		}, n.timeout);
	}

	return id;
}

export function dismiss(id: number) {
	const index = notifications.findIndex((n) => n.id === id);
	if (index !== -1) {
		notifications.splice(index, 1);
	}
}

export function getNotifications(): Notification[] {
	return notifications;
}
