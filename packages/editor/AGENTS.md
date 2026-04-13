# AGENTS.md (Package: editor)

## Editor Package Guidelines

This package contains the actual editor application built with SolidJS and OpenTUI Solid.

### Architecture

```
src/
├── ui/               # UI components
│   ├── editor-view.tsx    # Main editor view
│   └── statusline.tsx     # Status bar component
├── components/       # Reusable UI components
│   └── (shared components)
├── hooks/            # Custom SolidJS hooks
│   └── (custom hooks)
└── index.tsx         # Entry point
```

### Entry Point

```typescript
import { createCliRenderer } from "@opentui/core";
import { render } from "@opentui/solid";

const renderer = await createCliRenderer({
  useMouse: true,
  enableMouseMovement: true,
  exitOnCtrlC: false,
});

render(() => <App />, renderer);
```

### Component Patterns

#### Basic Component

```typescript
import { createSignal } from "solid-js";

function MyComponent(props: Props) {
  const [count, setCount] = createSignal(0);

  return (
    <box>
      <text>Count: {count()}</text>
    </box>
  );
}
```

#### Accessing Stores

```typescript
import { bufferStore, windowStore, editorUiStore } from "@bunvim/sdk";
import { createMemo } from "solid-js";

function EditorView() {
  // Direct store access (reactive)
  const mode = () => editorUiStore.mode;

  // Derived values
  const activeBuffer = createMemo(() => {
    const win = windowStore.windows.find(
      w => w.id === windowStore.activeWindowId
    );
    return bufferStore.buffers.find(b => b.id === win?.bufId);
  });

  return (
    <text>{activeBuffer()?.props.name}</text>
  );
}
```

#### Conditional Rendering

```tsx
import { Show, Switch, Match } from "solid-js";

// Simple condition
<Show when={isVisible()}>
  <Component />
</Show>

// With fallback
<Show when={data()} fallback={<Loading />}>
  {(item) => <Display data={item()} />}
</Show>

// Multiple conditions
<Switch fallback={<div>Default</div>}>
  <Match when={mode() === "normal"}>
    <NormalMode />
  </Match>
  <Match when={mode() === "insert"}>
    <InsertMode />
  </Match>
</Switch>
```

#### List Rendering

```tsx
import { For, Index } from "solid-js";

// Keyed (by reference)
<For each={buffers()}>
  {(buffer, index) => (
    <BufferView key={buffer.id} {...buffer} />
  )}
</For>

// Non-keyed (by index)
<Index each={lines()}>
  {(line, index) => <LineView line={line()} />}
</Index>
```

#### Keyboard Handling

```typescript
import { useKeyboard } from "@opentui/solid";

function EditorView() {
  useKeyboard((key) => {
    if (key.name === "escape") {
      // Handle escape
    }
    if (key.sequence) {
      // Handle character
    }
  });

  return <box>...</box>;
}
```

#### Terminal Dimensions

```typescript
import { useTerminalDimensions } from "@opentui/solid";

function EditorView() {
  const { width, height } = useTerminalDimensions();

  return (
    <text>Size: {width()}x{height()}</text>
  );
}
```

### Build Commands

```bash
# Development
bun run dev

# Build for current platform
bun run build

# Build for all platforms
bun run build:all

# Build specific platform
bun run build:linux
bun run build:darwin
bun run build:windows
```

### OpenTUI Solid Components

#### Layout

```tsx
<box flexDirection="column" flexGrow={1} style={{ backgroundColor: "#1a1b26" }}>
  <text fg="#c0caf5">Content</text>
</box>
```

#### Styling

```tsx
<box
  style={{
    padding: 1,
    backgroundColor: "#16161e",
    border: true,
    borderStyle: "single",
    borderColor: "#7aa2f7",
  }}>
  <text fg="#c0caf5" bg="#3b4261">
    Styled text
  </text>
</box>
```

#### Dynamic Component

```tsx
import { Dynamic } from "@opentui/solid";

<Dynamic component={isInput() ? "input" : "textarea"} />;
```

### Migration from React

| React         | Solid          |
| ------------- | -------------- |
| `useState`    | `createSignal` |
| `useEffect`   | `createEffect` |
| `useMemo`     | `createMemo`   |
| `useCallback` | Not needed     |
| `Activity`    | `Show`         |
| `.map()`      | `<For>`        |
| `key` prop    | Automatic      |

### Coding Standards

- **Function components** only
- **SolidJS primitives** for state
- **Store access** in components, updates through actions
- **Self-documenting** code
- **Type safety** - strict TypeScript
- **async/await** is acceptable in this package - Effect-TS is not required for consumer packages
