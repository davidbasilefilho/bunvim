import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-kit2.log", msg + "\n");
writeFileSync("inspect-kit2.log", "");
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false });
log("useKittyKeyboard type: " + typeof renderer.useKittyKeyboard);
log("useKittyKeyboard value: " + String(renderer.useKittyKeyboard));
log("enableKittyKeyboard type: " + typeof renderer.enableKittyKeyboard);
renderer.destroy();
