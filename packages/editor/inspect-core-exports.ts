import { appendFileSync, writeFileSync } from "node:fs";

import * as core from "@opentui/core";
const log = (msg: string) => appendFileSync("inspect-core-exports.log", msg + "\n");
writeFileSync("inspect-core-exports.log", "");
log(
  Object.keys(core)
    .filter((k) => k.toLowerCase().includes("key") || k.toLowerCase().includes("input"))
    .sort()
    .join("\n"),
);
