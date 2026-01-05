import Conf from "conf";
import { Data, Effect } from "effect";

export class StoreError extends Data.TaggedError("StoreError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

const conf = new Conf({
	projectName: "bvim",
});

export const get = (key: string) =>
	Effect.try({
		try: () => conf.get(key),
		catch: (e) =>
			new StoreError({ message: `Failed to get key: ${key}`, cause: e }),
	});

export const set = (key: string, value: unknown) =>
	Effect.try({
		try: () => conf.set(key, value),
		catch: (e) =>
			new StoreError({ message: `Failed to set key: ${key}`, cause: e }),
	});

export const remove = (key: string) =>
	Effect.try({
		try: () => conf.delete(key),
		catch: (e) =>
			new StoreError({ message: `Failed to delete key: ${key}`, cause: e }),
	});

export const clear = () =>
	Effect.try({
		try: () => conf.clear(),
		catch: (e) =>
			new StoreError({ message: "Failed to clear store", cause: e }),
	});
