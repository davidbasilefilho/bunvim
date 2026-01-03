# Bunvim Implementation Plan

Phased implementation for Bunvim. See AGENTS.md for architecture and coding standards.

---

## Phase 0: Foundation

**Goal**: Core data structures, Effect-TS setup, and basic rendering.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Effect Setup | `src/effect/runtime.ts` | Default runtime, layers, error types |
| Rope | `utils/rope.ts` | O(log n) insert/delete, line indexing, offset conversions |
| Position/Range | `utils/position.ts` | Types, conversions, range operations |
| Buffer | `core/buffer.ts` | Text mutations wrapped in Effect, line accessors, change events |
| Editor View | `ui/editor-view.tsx` | Buffer rendering, scrolling, cursor, gutter |

**Effect Integration**:
- All file I/O through Effect.tryPromise
- Buffer mutations return Effect types
- Runtime configured with default layers

**Milestone**: Display buffer, scroll, cursor visible. All I/O effectful.

---

## Phase 1: Modal Editing (Neovim Keybindings)

**Goal**: Modes, keymap, Neovim-compatible motions.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Selection | `core/selection.ts` | Cursor-based selection (Neovim style), multiple cursors |
| Modes | `modes/*.ts` | State machine, normal, insert |
| Keymap | `keybindings/parser.ts`, `keymap.ts` | Neovim sequence parsing, count prefixes, lookup |
| Motions | `keybindings/motions.ts` | `hjkl`, `wbeWBE`, `0^$`, `gg/G`, `fFtT;,`, `(){}` |

**Keybinding Philosophy**:
- Exact Neovim behavior for all standard keys
- Visual mode starts with cursor on character (not selection)
- Inclusive/exclusive motion semantics match Neovim

**Milestone**: Navigate, enter insert, type, escape. Feels like Neovim.

---

## Phase 2: Operators and Undo

**Goal**: Neovim verb-noun grammar, undo tree.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Transaction | `core/transaction.ts` | Atomic edits with Effect, composition, inversion |
| Undo Tree | `core/undo.ts` | Branching history, navigation, persistence via Effect |
| Operators | `keybindings/operators.ts` | `d`, `c`, `y`, `>`, `<`, `=`, `gU`, `gu` |
| Registers | `keybindings/registers.ts` | Full Neovim register set |
| Text Objects | `keybindings/text-objects.ts` | `iw/aw`, `is/as`, quotes, brackets, tags, paragraph |
| Visual Modes | `modes/visual.ts` | `v`, `V`, `Ctrl-v` with Neovim selection semantics |

**Neovim Compatibility**:
- `dw` deletes to start of next word (not inclusive)
- `de` deletes to end of word (inclusive)
- Register `0` holds last yank, `1-9` hold delete history
- Visual mode puts cursor at end of selection

**Milestone**: `d2w`, `ci"`, `yap`, visual selections, undo/redo. Neovim muscle memory works.

---

## Phase 3: Vim API & SDK

**Goal**: Unified API for plugins and config with vim.opt and vim.api namespaces. Core SDK for ecosystem integration.

### Ecosystem Vision
- **create-bunvim-plugin**: Tool for scaffolding plugins.
- **create-bunvim-config**: Tool for scaffolding user config in `~/.config/bvim`.
- **NPM Registry**: Plugins and themes are installed via `bun add` in the config project.
- **SDK**: A programmatic interface used by config/plugins to register components.

### Vim Object Structure

```typescript
interface Vim {
  opt: VimOptions           // All editor options
  api: VimApi               // All API modules
  g: Record<string, unknown> // Global variables
}

interface VimApi {
  buffer: BufferApi
  window: WindowApi
  editor: EditorApi
  keymap: KeymapApi
  command: CommandApi
  autocmd: AutocmdApi
  filetype: FiletypeApi
  notify: NotifyApi
  picker: PickerApi
  marks: MarksApi
  flash: FlashApi
  lsp: LspApi
  dap: DapApi
  treesitter: TreesitterApi
  theme: ThemeApi
  plugin: PluginApi
}
```

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Vim Object | `api/vim.ts` | Main interface with opt, api, g namespaces |
| Options | `api/options.ts` | VimOptions with defaults, validation |
| Plugin SDK | `api/plugin.ts` | Programmatic API for loading/registering plugins from npm |
| Config Loader | `config/loader.ts` | Load `~/.config/bvim/init.ts` via Bun runtime |

**Milestone**: Load user config, register plugins from node_modules, custom keymaps work.

---

## Phase 4: Window System

**Goal**: Panes, popups, tabline.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Window | `core/window.ts` | Buffer container, singleton files, view state |
| Panes | `ui/pane.tsx` | Splits, resize, focus, navigation (`Ctrl+hjkl` focus, `Ctrl+HJKL` move buffer) |
| Popups | `ui/popup.tsx` | Anchor, size, border, dim, focus trap |
| Tabline | `ui/tabline.tsx` | Visible when 2+ buffers. Buffer tabs, `gt/gT` |
| Input Popup | `ui/input-popup.tsx` | Centered, label, icon, completion |

**Milestone**: Splits, popups, centered input, tab navigation.

---

## Phase 5: File Management

**Goal**: Multi-buffer editing, file I/O.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Document | `core/document.ts` | Metadata, state, undo tree, parse tree |
| File Commands | `commands/file.ts` | `:e`, `:w`, `:q`, `:wq`, `:q!`, `:wa`, `:qa` |
| Editor State | `core/editor.ts` | Document registry, window tree, mode state |
| Command Mode | `modes/command.ts` | Centered input, parsing, completion, history |
| Buffer Picker | `ui/buffer-picker.tsx` | List, filter, preview, actions |

**Milestone**: Open, edit, save, switch buffers, quit.

---

## Phase 6: Fuzzy Finder

**Goal**: Telescope-style picker system.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Core | `picker/core.ts` | State machine with Effect |
| Fuzzy | `picker/fuzzy.ts` | fzf-style matching |
| Source | `picker/source.ts` | Data source interface |
| Builtins | `picker/builtins.ts` | files, grep, buffers, etc |
| Picker UI | `ui/picker.tsx` | Input, results, preview, status |

**Milestone**: Find files, live grep, buffer switch, custom pickers.

---

## Phase 7: Plugin Manager & Registry SDK

**Goal**: Manage plugins, themes, and servers via config.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Registry | `api/registry.ts` | Central registry for plugins, themes, LSP, DAP |
| Theme API | `api/theme.ts` | SDK for registering custom themes from npm |
| LSP Manager | `api/lsp.ts` | SDK for connecting LSP servers |
| DAP Manager | `api/dap.ts` | SDK for connecting DAP adapters |

**Milestone**: Config can `bun add` a theme and `vim.api.theme.register()` it.

---

## Phase 8: Flash Jump & Marks

**Goal**: Fast navigation.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| Flash Core | `flash/core.ts` | Target computation and labeling |
| Marks Store | `marks/store.ts` | Harpoon-style project marks |
| Marks UI | `ui/marks-popup.tsx` | Visual marks management |

---

## Phase 9: LSP & Autocomplete

**Goal**: Full language features.

### Tasks

| Component | File | Description |
|-----------|------|-------------|
| LSP Client | `lsp/client.ts` | RPC communication |
| Diagnostics UI | `ui/diagnostics.tsx` | Inline and gutter diagnostics |
| Completion | `ui/completion-menu.tsx` | blink.cmp style autocomplete |

---

## Phase 10: Search & Polish

**Goal**: Production readiness.

### Tasks

| Feature | Description |
|---------|-------------|
| Search | `/`, `?`, `n`, `N`, `*`, `#` |
| Replace | `:s/foo/bar/`, project-wide replace |
| Status Line | Rich mode and context display |
| Security | Sandbox for untrusted configs |

---

## Priority

**Critical path**: 0 -> 1 -> 2 -> 3 (SDK) -> 4 -> 5 -> 6

**Then parallel**: 7 (Registry) + 9 (LSP)

**Then**: 8 (Flash/Marks) -> 10 (Search/Polish)

---

## Build Targets

The build produces platform-specific binaries:

| Target | Binary |
|--------|--------|
| Linux x64 | `bvim-linux-x64` |
| Linux ARM64 | `bvim-linux-arm64` |
| macOS x64 | `bvim-darwin-x64` |
| macOS ARM64 | `bvim-darwin-arm64` |
| Windows x64 | `bvim-windows-x64.exe` |
