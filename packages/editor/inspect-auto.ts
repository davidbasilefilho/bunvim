import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-auto.log", msg + "\n");
writeFileSync("inspect-auto.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(renderer.auto.toString());
renderer.destroy();
