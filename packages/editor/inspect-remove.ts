import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-remove.log", msg + "\n");
writeFileSync("inspect-remove.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(renderer.removeInputHandler.toString());
renderer.destroy();
