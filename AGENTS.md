# AGENTS.md

## AGENTS Guidelines for This Repository

**Bunvim** is a Neovim-like terminal editor built with TypeScript, Bun, and SolidJS. Native Neovim keybindings, LSP, DAP, and Treesitter support. Effect-TS for side-effect management in the SDK. Plugin-first architecture for easy extensibility.

### Design Philosophy

Neovim experience in TypeScript. Same keybindings developers already know. Effect-TS in the SDK for type-safe side-effect management. Consumer packages (editor, plugins) choose their own async patterns. Bun for performance. Plugins as Bun projects for trivial authoring.

### Visual Language

Brutalist aesthetic. No border radius. Element separation via background color contrast. Sharp edges. Functional over decorative.

### Architecture Migration (2026)

The project has been migrated from React to SolidJS for improved performance and fine-grained reactivity:

```
packages/
├── sdk/           # Core logic, SolidJS stores, shared APIs
├── editor/        # Editor application (SolidJS + OpenTUI Solid)
└── bunvim/        # Legacy React implementation (deprecated)
```

**Key Changes:**
- UI: React → SolidJS with OpenTUI Solid
- State: Zustand/React useState → SolidJS stores (createStore)
- Build: tsdown + Babel → bun build --compile
- Conditional Rendering: Activity → Show/Switch/Match
- Lists: .map() → For/Index components

## Useful Commands Recap

### Setup

```bash
bun install
bun run dev
```

### Testing

```bash
bun test
bun test --watch
```

### Build

```bash
mise run build
```

### Interaction Guidelines

Be direct, succinct, objective. Favor headings over lists. No em dashes.

### Response Scope

Adhere strictly to the request. Multi-section responses only for complex inquiries.

### Research

Assume user premises are accurate. Prioritize `context7` for docs. Verify latest API usage before implementation.

## Tooling Stack

### Constraints

Use `bun` exclusively. Never `npm`, `npx`, or `tsc`. Bun handles package management, execution, and TypeScript without compilation.
Never use subagents.

**Type Safety Rules:**

- Never use `as unknown`, `as never`, or any type assertion (`as X`) to suppress type errors
- Create proper types instead of using unsafe casts
- Never create duplicate or nearly identical types—reuse existing types or adapt them
- If a type needs modification, extend or genericize it rather than duplicating

### Runtime

`bun` runtime, `bunx --bun` for package execution, Bun Shell (`$`) for shell commands.

### Dependencies

| Purpose | Package | Context7 ID |
|---------|---------|-------------|
| UI | `@opentui/core`, `@opentui/solid` | `/sst/opentui` |
| Effects | `effect` | `/effect-ts/effect` |
| State | `solid-js` | `/solidjs/solid` |
| LSP | `ts-lsp-client` | N/A |
| DAP | `@vscode/debugprotocol`, `@vscode/debugadapter-testsupport` | `/websites/microsoft_github_io_debug-adapter-protocol` |
| Treesitter | `tree-sitter` (native bindings) | `/tree-sitter/tree-sitter` |
| Runtime | `bun` | `/oven-sh/bun` |

### Testing and Quality

`bun test` for testing. `biome` for linting/formatting. `jdx mise` for version management and task running.

### CLI Tools

`rg` instead of `grep`. `fd` instead of `find`.

## Architecture (High-Level)

Monorepo structure using Turborepo.

### New Structure (Post-Migration)

```
packages/
├── sdk/               # Core logic, SolidJS stores, shared APIs
│   ├── src/
│   │   ├── stores/    # SolidJS stores (bufferStore, windowStore, editorUiStore)
│   │   ├── utils/     # Rope, position, logger, shell
│   │   ├── modes/     # Mode definitions and helpers
│   │   ├── keybindings/  # Keymap processing
│   │   ├── picker/    # Fuzzy finder types
│   │   └── treesitter/   # Treesitter integration
│   └── package.json
├── editor/            # The actual editor application (SolidJS + OpenTUI Solid)
│   ├── src/
│   │   ├── ui/        # UI components (editor-view, statusline)
│   │   └── index.tsx  # Entry point
│   └── package.json
└── bunvim/            # Legacy React implementation (deprecated)
```

### State Management with SolidJS Stores

```typescript
import { bufferStore, windowStore, editorUiStore } from "@bunvim/sdk";

// Access reactive state directly
const activeBuffer = () => bufferStore.buffers.find(b => b.id === activeWindow()?.bufId);

// Update state with actions
import { bufferActions, windowActions, editorUiActions } from "@bunvim/sdk";
bufferActions.createState("content", { type: "file", path: "file.ts" });
windowActions.setCursor(winId, line, column);
editorUiActions.setMode({ type: "insert" });
```

### Build Commands

```bash
# SDK package
cd packages/sdk
bun run build      # Build SDK
bun run test       # Run tests

# Editor package  
cd packages/editor
bun run build      # Build single binary with bun build --compile
bun run build:all  # Build for all platforms (linux, darwin, windows)
bun run dev        # Development mode
```

See individual package AGENTS.md for more details.

## Task Management

**IMPORTANT**: For any non-trivial task (more than 1 step), YOU MUST USE THE `todowrite` TOOL.
- Create a detailed todo list immediately upon receiving a complex request.
- Mark tasks as `in_progress` when starting and `completed` when done.
- This ensures progress tracking and recovery.
