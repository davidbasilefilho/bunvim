import { createCliRenderer } from "@opentui/core";
import { render, useKeyboard } from "@opentui/solid";

async function main() {
  const renderer = await createCliRenderer({
    useMouse: false,
    exitOnCtrlC: false,
  });

  const out = Bun.write ? Bun.stdout : process.stdout;
  void out.write("Starting...\n");

  function TestApp() {
    useKeyboard((key) => {
      void out.write("GOT KEY: " + key.name + "\n");
    });

    return <text>Press keys</text>;
  }

  void render(() => <TestApp />, renderer);
  void out.write("Done\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
