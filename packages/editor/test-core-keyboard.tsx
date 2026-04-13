import { createCliRenderer } from "@opentui/core";

async function main() {
  const renderer = await createCliRenderer({
    useMouse: false,
    exitOnCtrlC: false,
  });

  console.log("Renderer created, width:", renderer.width, "height:", renderer.height);
  console.log("keyInput type:", typeof renderer.keyInput);

  renderer.keyInput.on("keypress", (key: any) => {
    console.log("KEY FROM CORE:", JSON.stringify(key));
  });

  console.log("Handler registered");

  // Keep process alive
  setInterval(() => {}, 1000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
