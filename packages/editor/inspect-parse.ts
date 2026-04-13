import { appendFileSync, writeFileSync } from "node:fs";

import { parseKeypress } from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-parse.log", msg + "\n");
writeFileSync("inspect-parse.log", "");
log(parseKeypress.toString());
