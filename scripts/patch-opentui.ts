/**
 * Patches @opentui/solid to handle orphan text nodes gracefully.
 *
 * OpenTUI Solid's reconciler throws "Orphan text error" when a text node
 * (created by SolidJS reconciliation) is inserted as a direct child of a
 * non-text element (like <box>). This happens during SolidJS reconciliation
 * when dynamic expressions or <Show> transitions produce empty text nodes.
 *
 * This patch makes the orphan text check non-fatal for empty text nodes,
 * skipping insertion instead of crashing. Non-empty orphan text nodes still
 * throw (that's a real layout bug).
 *
 * Must be run after `bun install` since it patches node_modules.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const GLOB_PATTERN = "node_modules/.bun/@opentui+solid@*/node_modules/@opentui/solid/index.js";

// Find @opentui/solid index.js in node_modules
const bunDir = resolve(import.meta.dir, "..");
const possiblePaths = [
	resolve(bunDir, "node_modules", ".bun"),
];

let patched = false;

for (const searchDir of possiblePaths) {
	if (!existsSync(searchDir)) continue;

	const { readdirSync } = await import("node:fs");
	const entries = readdirSync(searchDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.name.startsWith("@opentui+solid@")) continue;

		const indexPath = resolve(searchDir, entry.name, "node_modules", "@opentui", "solid", "index.js");
		if (!existsSync(indexPath)) continue;

		let content = readFileSync(indexPath, "utf-8");

		// Check if already patched
		if (content.includes("Orphan text nodes (empty text nodes")) {
			console.log(`[patch] Already patched: ${indexPath}`);
			patched = true;
			continue;
		}

		// Replace the orphan text error throw with a graceful skip for empty text nodes
		const original = `if (isTextNodeRenderable(node)) {
    if (!(parent instanceof TextRenderable) && !isTextNodeRenderable(parent)) {
      throw new Error(\`Orphan text error: "\${node.toChunks().map((c) => c.text).join("")}" must have a <text> as a parent: \${parent.id} above \${node.id}\`);
    }
  }`;

		const replacement = `if (isTextNodeRenderable(node)) {
    if (!(parent instanceof TextRenderable) && !isTextNodeRenderable(parent)) {
      // Orphan text nodes (empty text nodes placed in non-text parents) can occur
      // during SolidJS reconciliation. Skip insertion instead of crashing.
      if (node.toChunks && node.toChunks().map((c) => c.text).join("") === "") {
        return;
      }
      throw new Error(\`Orphan text error: "\${node.toChunks().map((c) => c.text).join("")}" must have a <text> as a parent: \${parent.id} above \${node.id}\`);
    }
  }`;

		if (content.includes(`throw new Error(\`Orphan text error:`)) {
			content = content.replace(original, replacement);
			writeFileSync(indexPath, content, "utf-8");
			console.log(`[patch] Patched: ${indexPath}`);
			patched = true;
		} else {
			console.log(`[patch] Pattern not found in: ${indexPath}`);
		}
	}
}

if (!patched) {
	console.log("[patch] No @opentui/solid index.js found to patch. This may be normal if the package isn't installed yet.");
}

// Also check for the non-.bun path (used by Bun.build)
for (const searchDir of possiblePaths) {
	if (!existsSync(searchDir)) continue;

	const { readdirSync } = await import("node:fs");

	// Walk up to find node_modules/@opentui/solid
	const stdPath = resolve(bunDir, "node_modules", "@opentui", "solid", "index.js");
	if (existsSync(stdPath)) {
		let content = readFileSync(stdPath, "utf-8");

		if (content.includes("Orphan text nodes (empty text nodes")) {
			console.log(`[patch] Already patched: ${stdPath}`);
			patched = true;
			continue;
		}

		if (content.includes(`throw new Error(\`Orphan text error:`)) {
			const original = `if (isTextNodeRenderable(node)) {
    if (!(parent instanceof TextRenderable) && !isTextNodeRenderable(parent)) {
      throw new Error(\`Orphan text error: "\${node.toChunks().map((c) => c.text).join("")}" must have a <text> as a parent: \${parent.id} above \${node.id}\`);
    }
  }`;

			const replacement = `if (isTextNodeRenderable(node)) {
    if (!(parent instanceof TextRenderable) && !isTextNodeRenderable(parent)) {
      // Orphan text nodes (empty text nodes placed in non-text parents) can occur
      // during SolidJS reconciliation. Skip insertion instead of crashing.
      if (node.toChunks && node.toChunks().map((c) => c.text).join("") === "") {
        return;
      }
      throw new Error(\`Orphan text error: "\${node.toChunks().map((c) => c.text).join("")}" must have a <text> as a parent: \${parent.id} above \${node.id}\`);
    }
  }`;

			content = content.replace(original, replacement);
			writeFileSync(stdPath, content, "utf-8");
			console.log(`[patch] Patched: ${stdPath}`);
			patched = true;
		}
	}
}

console.log(patched ? "[patch] Done!" : "[patch] No files needed patching.");