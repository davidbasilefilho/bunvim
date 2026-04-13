import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-kit.log", msg + "\n");
writeFileSync("inspect-kit.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log(renderer.enableKittyKeyboard.toString());
log("---");
log(renderer.useKittyKeyboard.toString());
renderer.destroy();
