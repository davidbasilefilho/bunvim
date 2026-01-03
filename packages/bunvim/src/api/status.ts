export type StatusType = "info" | "success" | "error" | "loading";

export type StatusItem = {
	id: string;
	message: string;
	type: StatusType;
};

const listeners: Set<(items: StatusItem[]) => void> = new Set();
let items: StatusItem[] = [];

const notifyListeners = () => {
	for (const listener of listeners) {
		listener([...items]);
	}
};

export const subscribe = (listener: (items: StatusItem[]) => void) => {
	listeners.add(listener);
	listener([...items]);
	return () => {
		listeners.delete(listener);
	};
};

export const startTask = (id: string, message: string) => {
	const existing = items.find((i) => i.id === id);
	if (existing) {
		existing.message = message;
		existing.type = "loading";
	} else {
		items.push({ id, message, type: "loading" });
	}
	notifyListeners();
};

export const updateTask = (id: string, message: string, type: StatusType) => {
	const item = items.find((i) => i.id === id);
	if (item) {
		item.message = message;
		item.type = type;
		notifyListeners();
	}
};

export const finishTask = (id: string) => {
	items = items.filter((i) => i.id !== id);
	notifyListeners();
};

export const getItems = () => [...items];
