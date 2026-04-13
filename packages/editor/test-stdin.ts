import { appendFileSync, writeFileSync } from "node:fs";

const log = (msg: string) => appendFileSync("test.log", msg + "\n");
writeFileSync("test.log", "");

log("Starting stdin test");
log("stdin.isTTY: " + !!process.stdin.isTTY);

if (!process.stdin.isTTY) {
  log("stdin is NOT a TTY - this is the problem!");
}

log("Done");
