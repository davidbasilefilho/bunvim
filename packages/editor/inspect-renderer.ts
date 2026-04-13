import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect.log", msg + "\n");
writeFileSync("inspect.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(Object.keys(renderer).sort().join("\n"));
renderer.destroy();
