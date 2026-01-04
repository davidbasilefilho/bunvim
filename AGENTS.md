# AGENTS.md

## AGENTS Guidelines for This Repository

**Bunvim** is a Neovim-like terminal editor built with TypeScript and Bun. Native Neovim keybindings, LSP, DAP, and Treesitter support. Effect-TS for all side-effect management. Plugin-first architecture for easy extensibility.

### Design Philosophy

Neovim experience in TypeScript. Same keybindings developers already know. Effect-TS everywhere. Bun for performance. Plugins as Bun projects for trivial authoring.

### Visual Language

Brutalist aesthetic. No border radius. Element separation via background color contrast. Sharp edges. Functional over decorative.

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
| UI | `@opentui/core`, `@opentui/react` | `/sst/opentui` |
| Effects | `effect` | `/effect-ts/effect` |
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

- `packages/bunvim`: Core editor logic and UI.

See `packages/bunvim/AGENTS.md` for package-specific architecture and guidelines.

## Task Management

**IMPORTANT**: For any non-trivial task (more than 1 step), YOU MUST USE THE `todowrite` TOOL.
- Create a detailed todo list immediately upon receiving a complex request.
- Mark tasks as `in_progress` when starting and `completed` when done.
- This ensures progress tracking and recovery.
