import { afterEach, describe, expect, test } from "bun:test";

import { registerCommand, unregisterCommand } from "../api/command";
import { commandSource } from "./builtins";

describe("commandSource", () => {
  afterEach(() => {
    unregisterCommand("write");
    unregisterCommand("wq");
    unregisterCommand("quit");
  });

  test("filters commands by query for autocomplete", async () => {
    registerCommand("quit", () => {});
    registerCommand("write", () => {});
    registerCommand("wq", () => {});

    const items = await commandSource.getItems("wri");

    expect(items.map((item) => item.text)).toEqual(["write"]);
  });
});
