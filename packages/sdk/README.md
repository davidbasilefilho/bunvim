# @bunvim/sdk

Core SDK for Bunvim - contains state management, utilities, and shared APIs.

## Overview

The SDK provides the foundation for the Bunvim editor with:
- **SolidJS stores** for reactive state management
- **Buffer management** with rope data structure
- **Window management** for multi-pane editing
- **Keybinding system** with Vim-compatible keymaps
- **Effect-TS integration** for type-safe side effects

## Installation

```bash
bun install @bunvim/sdk
```

## State Management

### Buffer Store

```typescript
import { bufferStore, bufferActions } from "@bunvim/sdk";

// Create a buffer
const buf = bufferActions.createState("content", { 
  type: "file", 
  path: "file.ts" 
});

// Get buffer
const buffer = bufferActions.get(buf.id);

// Update buffer
bufferActions.insertAt(buf.id, { line: 0, column: 0 }, "text");
bufferActions.deleteInRange(buf.id, range);

// Query
const text = bufferActions.getText(buf.id);
const count = bufferActions.lineCount(buf.id);
```

### Window Store

```typescript
import { windowStore, windowActions } from "@bunvim/sdk";

// Create window
const win = windowActions.create(bufId);

// Get active window
const active = windowActions.getActive();

// Update window
windowActions.setCursor(win.id, line, column);
windowActions.setScroll(win.id, scrollTop);

// Navigation
windowActions.moveFocus("j");
windowActions.moveBuffer("h");
```

### Editor UI Store

```typescript
import { editorUiActions } from "@bunvim/sdk";

// Set mode
editorUiActions.setMode({ type: "insert" });

// Pending keys
editorUiActions.setPendingKeys("dd");
editorUiActions.clearPendingKeys();

// Visual selection
editorUiActions.setVisualAnchor(line, column);
```

## Utilities

### Rope Data Structure

```typescript
import { Rope } from "@bunvim/sdk";

const rope = Rope.fromString("text content");
const line = Rope.getLine(rope, 0);
const updated = Rope.insert(rope, offset, "new text");
```

### Position Types

```typescript
import { position, range } from "@bunvim/sdk";

const pos = position(0, 5);
const r = range(pos, position(1, 10));
```

## Keybindings

```typescript
import { processKey, registerKeymap } from "@bunvim/sdk";

// Register keymap
registerKeymap({
  lhs: "<leader>ff",
  rhs: () => openFilePicker(),
  mode: "n",
  description: "Find files",
});

// Process key
const { result, newState } = processKey({
  state,
  key,
  mode,
  onTimeout,
});
```

## License

Apache-2.0
