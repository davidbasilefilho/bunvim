import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-addinput.log", msg + "\n");
writeFileSync("inspect-addinput.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(renderer.addInputHandler.toString());
renderer.destroy();
