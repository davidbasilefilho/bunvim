# AGENTS.md (Package: bunvim)

## AGENTS Guidelines for This Repository

This file contains specific architectural details and guidelines for the `bunvim` package.
Refer to the root `AGENTS.md` for project-wide standards.

## Useful Commands Recap

### Build

```bash
mise run build
mise run build:all
mise run build:debug
```

### Check & Lint

```bash
bun run check
bun run lint
```

## Architecture

### Effect-TS Integration

Effect-TS is the foundation for all side-effect management.

| Domain | Effect Usage |
|--------|--------------|
| File I/O | `Effect.tryPromise`, `Effect.gen` |
| LSP Communication | `Effect.Stream`, `Effect.Queue` |
| DAP Sessions | `Effect.Fiber`, `Effect.Scope` |
| Error Handling | Typed error channel, `Effect.catchTag` |
| Concurrency | `Effect.fork`, `Effect.race`, `Effect.all` |
| Resource Management | `Effect.acquireRelease`, `Effect.Scope` |
| State | `Effect.Ref`, `Effect.Hub` |
| Configuration | `Effect.Config`, `Effect.Layer` |
| Logging | `Effect.log`, `Effect.logDebug` |
| Scheduling | `Effect.schedule`, `Effect.repeat` |

### Vim API

The `vim` object is the unified interface for plugins and configuration.

```typescript
interface Vim {
  opt: VimOptions          // Editor options (vim.opt.tabstop, vim.opt.leader, etc)
  api: VimApi              // All API modules (vim.api.buffer, vim.api.keymap, etc)
  g: Record<string, unknown> // Global variables
}

interface VimOptions {
  leader: string           // default: "<Space>"
  localleader: string
  nerdFont: boolean        // false by default
  number: boolean
  relativenumber: boolean
  tabstop: number
  shiftwidth: number
  expandtab: boolean
  timeoutlen: number       // key sequence timeout (default: 400ms)
  // ... see PLAN.md for full list
}

interface VimApi {
  buffer: BufferApi
  window: WindowApi
  editor: EditorApi
  keymap: KeymapApi
  command: CommandApi
  autocmd: AutocmdApi      // Autocommands
  filetype: FiletypeApi    // Per-language configuration
  notify: NotifyApi
  picker: PickerApi
  marks: MarksApi          // harpoon-style project marks
  flash: FlashApi          // flash.nvim jump system
  lsp: LspApi
  dap: DapApi
  treesitter: TreesitterApi
  theme: ThemeApi
  plugin: PluginApi
}
```

### Configuration

User config is a Bun project at `~/.config/bvim/`:

```
~/.config/bvim/
  package.json
  init.ts              # Entry point
  plugins/             # Local plugins (each a Bun project)
```

```typescript
// init.ts
import { vim } from "bvim"

// Options
vim.opt.nerdFont = true
vim.opt.tabstop = 2
vim.opt.leader = "<Space>"

// Keymaps
vim.api.keymap.set("n", "<leader>ff", () => vim.api.picker.files())

// Per-language config
vim.api.filetype.setup("typescript", {
  tabstop: 2,
  shiftwidth: 2,
  lsp: { server: "typescript-language-server" }
})

// Autocmds
vim.api.autocmd.create("BufWritePre", {
  pattern: "*.ts",
  callback: () => vim.api.lsp.format()
})

// Plugins
await vim.api.plugin.load("plugin-name")
```

### Plugin System

Plugins are Bun projects. Easy to author for anyone familiar with TypeScript.

```typescript
// my-plugin/index.ts
import { vim, type Plugin } from "bunvim"

export default {
  name: "my-plugin",
  setup() {
    vim.command.register("MyCommand", () => { ... })
  },
  cleanup() { ... }
} satisfies Plugin
```

### Window System

| Concept | Description |
|---------|-------------|
| Window | Container where a buffer is displayed |
| Buffer singleton | File buffers have one instance; reopening moves the buffer |
| Pane | Split (horizontal or vertical) |
| Popup | Modal dialog with anchor, size, border, background dim |
| Tabline | Visible when window has 2+ buffers. Buffer tabs with keybinds. |

**No file tree**. File navigation is handled by pickers and plugins. File tree implementations are left to plugin developers.

### Centered Input (noice.nvim style)

Command mode, search, and plugin inputs appear centered with:
- Label above input
- Icon inside input (if `vim.nerdFont`)
- Optional completion dropdown

### Core Abstractions

| Abstraction | Description |
|-------------|-------------|
| Buffer | Raw text via rope data structure |
| Document | Buffer + metadata (path, language, undo tree, parse tree) |
| Window | View into document (cursor, scroll, selections) |
| Editor | Global state (documents, windows, config, mode) |
| Selection | Anchor + head with Neovim semantics |
| Transaction | Atomic edit unit for undo |

### Undo System

Tree structure with branching, not linear stack. Supports branch navigation and visual editor.

### Modal Editing

Neovim-compatible modal editing. Identical keybindings for muscle memory preservation.

| Mode | Description |
|------|-------------|
| Normal | Navigation and commands |
| Insert | Text insertion |
| Visual | Character-wise selection (`v`) |
| Visual Line | Line-wise selection (`V`) |
| Visual Block | Block selection (`Ctrl-v`) |
| Command | `:` commands |
| Picker | Fuzzy finder mode |

### Operator-Motion Grammar

Standard Neovim grammar. Operators compose with motions and text objects.

| Operator | Action |
|----------|--------|
| `d` | Delete |
| `c` | Change |
| `y` | Yank |
| `>` | Indent right |
| `<` | Indent left |
| `=` | Format/auto-indent |
| `gU` | Uppercase |
| `gu` | Lowercase |

### Registers

Neovim register system.

| Register | Description |
|----------|-------------|
| `"` | Default (unnamed) |
| `a-z` | Named |
| `A-Z` | Append to named |
| `0` | Yank register |
| `1-9` | Delete history |
| `+` | System clipboard |
| `*` | Selection clipboard |
| `_` | Black hole |
| `/` | Last search pattern |
| `.` | Last inserted text |
| `:` | Last command |
| `%` | Current filename |

### Features

| Feature | Description |
|---------|-------------|
| Fuzzy Picker | Telescope-style with custom picker API |
| Marks | Project-scoped harpoon-style quick navigation |
| Flash | flash.nvim jump system |
| Notifications | Stacked notifications with levels |

### Managers

Plugin, LSP server, DAP adapter, and theme managers with UIs for install/config/status.

## Directory Structure

```
src/
  api/           # Vim API modules (vim.ts, buffer.ts, window.ts, etc.)
  core/          # Buffer, document, window, editor, selection, transaction, undo
  modes/         # Mode implementations (normal, insert, visual, command)
  keybindings/   # Keymap, parser, motions, operators, text-objects, registers, macros
  lsp/           # LSP client (ts-lsp-client wrapper)
  dap/           # DAP client (@vscode/debugprotocol)
  treesitter/    # Parser, grammars, highlights, textobjects
  picker/        # Fuzzy finder core and builtins
  marks/         # Harpoon-style marks
  flash/         # Flash jump system
  plugin/        # Plugin manager and loader
  theme/         # Theme schema, loader, manager
  managers/      # LSP and DAP server managers
  ui/            # OpenTUI components
  components/    # Reusable generic UI components (Button, Input, etc)
  commands/      # Command registry and implementations
  utils/         # Rope, position, diff, encoding
index.tsx        # Entry point
```

## React 19 / React Compiler Guidelines

This project uses **React 19.2** with the **React Compiler** (babel-plugin-react-compiler). The compiler automatically handles memoization.

### Rules

| Pattern | Rule |
|---------|------|
| `memo()` | **NEVER use**. React Compiler handles this automatically. |
| `useMemo()` | **NEVER use**. React Compiler handles this automatically. |
| `useCallback()` | **NEVER use for memoization**. Only use when you need a stable reference for effect dependencies. |
| `{condition && <Component />}` | **NEVER use**. Always use `<Activity>` instead. |

### Conditional Rendering with Activity

Always use `<Activity>` instead of conditional rendering patterns:

```tsx
// BAD: Never do this
{isVisible && <Sidebar />}

// GOOD: Always use Activity
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <Sidebar />
</Activity>
```

The `Activity` component:
- Preserves state when hidden (no remounting)
- Defers updates for hidden content
- Cleans up effects when hidden, restores when visible
- Uses `display: 'none'` internally for hidden mode

Import from React:

```tsx
import { Activity } from 'react'
```

## Coding Standards

Minimal, readable, performant code.

### File Structure Ordering

Files should generally follow this order:
1. Imports
2. Types/Interfaces
3. Constants
4. Functions/Implementation
5. Exports

### Documentation

Every public API function must have JSDoc with parameter descriptions, return types, and usage examples.

### Self-Documenting

No comments unless logic is cryptographic. Descriptive naming. No magic numbers.

### Paradigm

TypeScript only. No OOP (classes, inheritance). Plain objects, functions, composition. Effect-TS for all effects.

### API Design

Dual getter-setter functions:

```typescript
// property() returns value, property(newValue) sets it
tabSize()      // get
tabSize(4)     // set
```

### Effect-TS Patterns

All I/O, process spawning, file system operations use Effect:

```typescript
import { Effect, pipe } from "effect"

const readFile = (path: string) =>
  Effect.tryPromise({
    try: () => Bun.file(path).text(),
    catch: (e) => new FileReadError({ path, cause: e })
  })

const writeFile = (path: string, content: string) =>
  Effect.tryPromise({
    try: () => Bun.write(path, content),
    catch: (e) => new FileWriteError({ path, cause: e })
  })

// Composition
const copyFile = (src: string, dst: string) =>
  pipe(
    readFile(src),
    Effect.flatMap((content) => writeFile(dst, content))
  )
```

### Error Handling

Effect's typed error channel. Domain-specific error types. Never throw directly.

```typescript
import { Data } from "effect"

class FileReadError extends Data.TaggedError("FileReadError")<{
  path: string
  cause: unknown
}> {}

class LspError extends Data.TaggedError("LspError")<{
  server: string
  message: string
}> {}
```

### Concurrency

Effect fibers for LSP, file watchers, background parsing:

```typescript
import { Effect, Fiber } from "effect"

const backgroundParse = (doc: Document) =>
  pipe(
    parseDocument(doc),
    Effect.fork,
    Effect.map((fiber) => ({ doc, fiber }))
  )

const cancelParse = (fiber: Fiber.RuntimeFiber<ParseResult, ParseError>) =>
  Fiber.interrupt(fiber)
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Input latency | < 16ms |
| Scrolling | 60fps |
| Incremental parsing | < 50ms |
| LSP completion | < 100ms |

## Security

| Area | Measure |
|------|---------|
| Plugins | Sandbox with limited API access |
| Files | Validate paths, prevent traversal |
| Config | Only run trusted configs |
| LSP/DAP | Validate server binaries |
