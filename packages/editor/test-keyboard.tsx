import { createCliRenderer } from "@opentui/core";
import { render, useKeyboard } from "@opentui/solid";

async function main() {
  const renderer = await createCliRenderer({
    useMouse: false,
    exitOnCtrlC: false,
  });

  console.log("Renderer created, setting up keyboard handler...");

  function TestApp() {
    useKeyboard((key) => {
      console.log("KEY RECEIVED:", JSON.stringify(key));
    });

    return <text>Test - press any key</text>;
  }

  void render(() => <TestApp />, renderer);
  console.log("Rendered");
}

main().catch(console.error);
