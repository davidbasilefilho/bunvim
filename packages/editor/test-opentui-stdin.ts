import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";

const log = (msg: string) => appendFileSync("test.log", msg + "\n");
writeFileSync("test.log", "");

async function main() {
  log("stdin.isTTY: " + !!process.stdin.isTTY);

  const renderer = await createCliRenderer({ useMouse: false, exitOnCtrlC: false });
  log("Renderer created");

  // Check if there's a stdin read loop
  log("Checking stdin properties:");
  log("  stdin.fd: " + process.stdin.fd);
  log("  stdin.readable: " + process.stdin.readable);

  // Try to see if stdin data is being consumed
  let buffer = Buffer.alloc(1024);
  process.stdin.setRaw(true);

  renderer.keyInput.on("keypress", (key: any) => {
    log("KEY: " + key.name);
  });

  // Wait 5 seconds
  await new Promise((r) => setTimeout(r, 5000));
  log("Done");
  renderer.destroy();
}

main().catch((e) => {
  log("ERROR: " + e.message);
  process.exit(1);
});
