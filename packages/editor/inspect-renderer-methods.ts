import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-methods.log", msg + "\n");
writeFileSync("inspect-methods.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(Object.getOwnPropertyNames(Object.getPrototypeOf(renderer)).sort().join("\n"));
renderer.destroy();
