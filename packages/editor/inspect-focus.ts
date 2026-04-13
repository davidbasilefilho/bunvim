import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-focus.log", msg + "\n");
writeFileSync("inspect-focus.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(renderer.focusRenderable.toString());
renderer.destroy();
