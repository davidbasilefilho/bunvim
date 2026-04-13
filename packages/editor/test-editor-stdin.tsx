import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";

const log = (msg: string) => appendFileSync("test.log", msg + "\n");
writeFileSync("test.log", "");

log("Testing stdin in editor context");
log("stdin.isTTY: " + !!process.stdin.isTTY);
log("stdin fd: " + process.stdin.fd);
log("stdout.isTTY: " + !!process.stdout.isTTY);

async function main() {
  log("Creating renderer...");
  const renderer = await createCliRenderer({ useMouse: false, exitOnCtrlC: false });
  log("Renderer created");
  log("keyInput exists: " + !!renderer.keyInput);

  renderer.keyInput.on("keypress", (key: any) => {
    log("GOT KEY: " + key.name);
  });

  // Wait for potential keys
  await new Promise((r) => setTimeout(r, 2000));
  log("Done waiting");
  renderer.destroy();
  process.exit(0);
}

main().catch((e) => {
  log("ERROR: " + e.message);
  process.exit(1);
});
