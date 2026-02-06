# @bunvim/editor

The Bunvim terminal editor application built with SolidJS and OpenTUI.

## Overview

This is the main editor application that provides:
- **SolidJS-based UI** with fine-grained reactivity
- **Vim-compatible editing** with modal interface
- **Terminal-based UI** using OpenTUI components
- **Single binary compilation** with Bun

## Installation

```bash
bun install
bun run build
```

## Usage

```bash
# Run development mode
bun run dev

# Build for current platform
bun run build

# Build for all platforms
bun run build:all

# Run built binary
./dist/bvim [file|directory]
```

## Architecture

The editor uses SolidJS for reactive UI components:

```typescript
import { createSignal, createMemo, Show, For } from "solid-js";
import { useKeyboard } from "@opentui/solid";

function EditorView() {
  const [count, setCount] = createSignal(0);
  
  useKeyboard((key) => {
    if (key.name === "escape") {
      // Handle key
    }
  });

  return (
    <box>
      <Show when={isVisible()}>
        <text>Content</text>
      </Show>
    </box>
  );
}
```

## Development

### Build Commands

```bash
# Development (watch mode)
bun run dev

# Build for current platform
bun run build

# Build for all platforms
bun run build:all

# Build specific platform
bun run build:linux
bun run build:darwin
bun run build:windows

# Lint and format
bun run check
bun run lint
bun run format

# Testing
bun test
```

### Project Structure

```
src/
├── ui/
│   ├── editor-view.tsx    # Main editor view
│   └── statusline.tsx     # Status bar
├── components/            # Reusable components
├── hooks/                 # Custom SolidJS hooks
└── index.tsx             # Entry point
```

## License

Apache-2.0
