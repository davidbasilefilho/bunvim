# AGENTS.md (Package: sdk)

## SDK Package Guidelines

This package contains the core logic, state management, and shared APIs for Bunvim.

### State Management

All state is managed through SolidJS stores:

#### Buffer Store

```typescript
import { bufferStore, bufferActions } from "@bunvim/sdk";

// Create buffer
const buf = bufferActions.createState("content", { type: "file", path: "file.ts" });

// Get buffer
const buffer = bufferActions.get(buf.id);

// Update buffer
bufferActions.update(buf.id, updater);
bufferActions.insertAt(buf.id, pos, text);
bufferActions.deleteInRange(buf.id, range);
bufferActions.replaceInRange(buf.id, range, text);

// Query
bufferActions.getLine(buf.id, lineNum);
bufferActions.getText(buf.id);
bufferActions.lineCount(buf.id);
```

#### Window Store

```typescript
import { windowStore, windowActions } from "@bunvim/sdk";

// Create window
const win = windowActions.create(bufId);

// Get active window
const active = windowActions.getActive();

// Update window
windowActions.setCursor(win.id, line, column);
windowActions.setScroll(win.id, scrollTop);
windowActions.setBuffer(win.id, bufId);

// Navigation
windowActions.moveFocus("j");
windowActions.moveBuffer("h");
```

#### Editor UI Store

```typescript
import { editorUiStore, editorUiActions } from "@bunvim/sdk";

// Mode
editorUiActions.setMode({ type: "insert" });

// Pending keys
editorUiActions.setPendingKeys("d");
editorUiActions.appendPendingKey("d");
editorUiActions.clearPendingKeys();

// Visual selection
editorUiActions.setVisualAnchor(line, column);

// Yank register
editorUiActions.setYankRegister(text);

// Highlights
editorUiActions.setHighlights(bufferId, highlights);
```

### Store Patterns

#### Accessing Store Values

```typescript
// Direct access (reactive)
const buffers = () => bufferStore.buffers;
const windows = () => windowStore.windows;

// Derived values with createMemo
const activeWindow = createMemo(() => {
  return windowStore.windows.find((w) => w.id === windowStore.activeWindowId);
});
```

#### Store Updates

```typescript
// Direct property update
setStore("property", value);

// Nested update
setStore("buffers", (buffers) => [...buffers, newBuffer]);

// Batch update
setStore({
  property1: value1,
  property2: value2,
});
```

### Utility Modules

#### Rope

```typescript
import { Rope } from "@bunvim/sdk";

const rope = Rope.fromString("text");
const line = Rope.getLine(rope, 0);
const text = Rope.getText(rope);
const updated = Rope.insert(rope, offset, text);
```

#### Position

```typescript
import { position, range } from "@bunvim/sdk";

const pos = position(0, 5);
const r = range(pos, position(1, 10));
```

### Keybindings

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

### Coding Standards

- **No classes** - Use plain objects and functions
- **Effect-TS** for all side effects - no `async/await` in SDK code
- **Immutable updates** - Never mutate store state directly
- **Type safety** - Strict TypeScript, no `any`
- **Self-documenting** - Clear names over comments

### Effect-TS Boundary

The SDK uses Effect-TS for all side-effect management internally. No `async/await` in SDK source code.

Consumer packages (editor, plugins) are free to choose their own async patterns. The SDK exposes both Effect-based and Promise-based APIs so plugin authors can use `async/await` if they prefer.
