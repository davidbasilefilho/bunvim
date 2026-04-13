import { appendFileSync, writeFileSync } from "node:fs";

import { createCliRenderer } from "@opentui/core";
import { render, useKeyboard } from "@opentui/solid";

const log = (msg: string) => appendFileSync("test.log", msg + "\n");
writeFileSync("test.log", "");

log("Starting Solid render test");

async function main() {
  log("Creating renderer...");
  const renderer = await createCliRenderer({ useMouse: false, exitOnCtrlC: false });
  log("Renderer created, checking keyInput...");
  log("keyInput exists: " + !!renderer.keyInput);
  log("keyInput.on type: " + typeof renderer.keyInput?.on);

  // Direct test of keyInput
  let keyCount = 0;
  renderer.keyInput.on("keypress", (key: any) => {
    keyCount++;
    log("DIRECT KEY: " + key.name + " (total: " + keyCount + ")");
  });
  log("Direct listener registered");

  function TestApp() {
    log("TestApp rendering");
    useKeyboard((key) => {
      log("HOOK KEY: " + key.name);
    });
    log("useKeyboard registered in component");
    return <text>Press keys</text>;
  }

  log("Calling render...");
  void render(() => <TestApp />, renderer);
  log("Render called, waiting 5s for keys...");

  // Wait and check periodically
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    log("Still waiting... (second " + (i + 1) + ")");
  }

  log("Done. Keys received - direct: " + keyCount);
  renderer.destroy();
  process.exit(0);
}

main().catch((e) => {
  log("ERROR: " + e.message + "\n" + e.stack);
  process.exit(1);
});
