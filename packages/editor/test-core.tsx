import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";

const log = (msg: string) => appendFileSync("test.log", msg + "\n");
writeFileSync("test.log", "");

async function main() {
  log("Starting");
  const renderer = await createCliRenderer({ useMouse: false, exitOnCtrlC: false });
  log("Renderer created");

  log("Has keyInput: " + !!renderer.keyInput);
  log("keyInput.on type: " + typeof renderer.keyInput?.on);

  renderer.keyInput.on("keypress", (key: any) => {
    log("GOT KEY: " + key.name);
  });

  log("Handler registered, waiting 3s...");

  // Simulate some time passing then exit
  await new Promise((r) => setTimeout(r, 3000));
  log("Done");
  renderer.destroy();
  process.exit(0);
}

main().catch((e) => {
  log("ERROR: " + e.message);
  process.exit(1);
});
