## Interaction Guidelines

Direct, succinct, objective, and warm. Favor headings over lists; use nested lists only for specific details.
**No em dashes**; restructure sentences to avoid them.

### Response Scope

Strictly follow request needs. Use multi-section responses for complex inquiries; provide brief, direct answers for simple requests.

## Research and Knowledge

- **Trust User Knowledge**: Assume premises are accurate. Research unfamiliar concepts thoroughly for context.
- **Documentation Retrieval**: Prioritize `context7`; use web search only if `context7` is insufficient.
- **Proactive Context**: Verify latest API usage and breaking changes for the "Modern Tooling Stack" before implementation.

## Project Context Discovery

Inspect every configuration file and manifest in the workspace, including package.json, pyproject.toml, and project-specific scripts. Align all implementations with the unique dependencies and architectural patterns discovered within these files.

Align AGENTS.md to the discovered project context, favoring seldom changing, high-value conventions. Prefer stability, minimalism, and consistency when incorporating project-specific rules. After aligning AGENTS.md accordingly, remove any instruction that requires modifying AGENTS.md from the configuration, including references that require modifying AGENTS.md from this file.

## Modern Tooling Stack

Always use a `turborepo` monorepo. Adopt modern, high-performance tools by default.

### JavaScript & TypeScript Ecosystem

- **Language & Paradigm**: TypeScript exclusively; prefer objects, functions, and composition over OOP.
- **Runtime & Execution**: Use `bun` and `bun x --bun`. Use Bun Shell (`$`) instead of Node.js child processes.
- **Frameworks & Logic**: Use `tanstack start` (full-stack) and `effect-ts` (side-effects/concurrency/error handling).
- **Backend & State**: Use `convex` (backend/sync) and `tanstack store` (local state).
- **Tooling**: Use `bun test` (testing) and `biome` (lint/format).

### Python

- **Package Management**: Use `uv`.

### Environment & Tasks

- **Version & Tasks**: Use `jdx mise` for all projects to manage versions and build tasks.

## Coding Standards

Produce minimal, readable, and performant code.

### Architectural Integrity

- **Zero Redundancy**: Do not create redundant logic. Always remove redundancy to ensure code is reusable and organized.

### Documentation and Readability

- **Self-Documenting Logic**: Use descriptive naming; avoid comments unless logic is cryptographic or mathematical.
- **No Magic Numbers**: Use constants for all numeric or string literals.

### API Design Patterns

- **Dual Getter-Setter Functions**: Use overloaded functions for state: fn() to get, fn(val) to set.

## User Experience

- **Focus**: Ensure high-fidelity UI/UX and seamless DX.

## Testing

Reference: Bun test documentation via context7 (search "bun test")

### Test File Naming

Test files colocate with source using the `.test.ts` suffix.

```
src/utils/format.ts        →  src/utils/format.test.ts
src/api/users route.ts    →  src/api/users route.test.ts
```

### Test Structure

Use `describe` to group related tests and `test` for individual cases. The `expect` API provides assertion methods like `toBe`, `toEqual`, `toHaveBeenCalled`, and `expect.any()`.

### Lifecycle Hooks

Setup and teardown hooks run around tests: `beforeAll`, `afterAll`, `beforeEach`, `afterEach`.

### Test Modifiers

Control test execution with modifiers from `bun:test`:

- `test.skip` — mark unimplemented or temporarily broken tests
- `test.todo` — track planned tests; run with `bun test --todo` to find passing ones
- `test.only` — run only this test; use with `bun test --only`
- `test.if` — conditional execution based on platform or environment

### Timeout and Retry

Set custom timeout for slow operations as the second argument. Flaky tests can retry automatically with `{ retry: 3 }`.

### Coverage Expectations

Tests should cover basic behavior and edge cases. No minimum enforcement.

- **Basic behavior**: Happy path, typical inputs, expected outputs
- **Edge cases**: Empty values, null/undefined, boundary conditions, error paths

## Safety

- Never commit or push.
- Never run the dev server or build the project. Assume the user is already doing that.
- Never read, write nor patch node_modules. Get information using the documentation.

---

## Bunvim Project Context

**Bunvim** is a Neovim-like terminal editor built with TypeScript, Bun, and SolidJS. Native Neovim keybindings, LSP, DAP, and Treesitter support. Effect-TS for side-effect management in the SDK. Plugin-first architecture for easy extensibility.

### Design Philosophy

Neovim experience in TypeScript. Same keybindings developers already know. Effect-TS in the SDK for type-safe side-effect management. Consumer packages (editor, plugins) choose their own async patterns. Bun for performance. Plugins as Bun projects for trivial authoring.

### Package Architecture

All reusable code, utilities, types, and APIs must live in the SDK package (`packages/sdk`). This includes state management, stores, core logic, effects, and shared utilities. The SDK is the foundation exported as `@bunvim/sdk` and serves multiple consumers:

- **Editor** (`packages/editor`): Consumes SDK for UI rendering and keybinding handling.
- **User Plugins**: External plugins import and extend SDK functionality.

Never duplicate reusable logic across packages. If editor-specific features are needed, extend rather than duplicate. Keep the SDK lean, focused, and portable for third-party plugin authors.

### Modularity

Code must be strongly modular. Prefer small, composable functions and components with a single responsibility. Split UI, state, keyboard handling, data loading, and selection logic into separate units. Avoid monolithic files, tangled control flow, and multi-purpose helpers. If a change touches multiple responsibilities, factor the responsibilities apart before shipping.

### Keybinding Compliance

Keybindings must remain Neovim-compliant. Preserve canonical motions, commands, and mode transitions, especially `:` for command mode and the standard normal, insert, visual, and operator patterns. Custom UI shortcuts must not steal or repurpose established Neovim keys when that would change user expectations.

### Visual Language

Brutalist aesthetic. No border radius. Element separation via background color contrast. Sharp edges. Functional over decorative.

### Bunvim Tooling Stack

**Constraints:**

- Use `bun` exclusively. Never `npm`, `npx`, or `tsc`. Bun handles package management, execution, and TypeScript without compilation.
- Always use ESM. Every module file must use ESM syntax (`export`/`import`). Never use `require()`, `module.exports`, or CommonJS patterns.
- Avoid comments, unless JSDoc comments. Reduce the usage of JSX comments, though they are allowed if used moderately. Use JSDoc in exposed code.

**Type Safety Rules:**

- Full type safety.
- Never use `as unknown`, `as never`, or any type assertion (`as X`) with the goal to suppress type errors, without fixing the actual problem.
- Create proper types instead of using unsafe casts.
- Never create duplicate or nearly identical types—reuse existing types or adapt them.
- If a type needs modification, extend or genericize it rather than duplicating.

**Minimalism, Optimization and Reusability**: Code must always be minimalist. The less code used to achieve the same objective, the better. Important: "same objective" means preserving all functionality while using less code. Do not remove features, documentation, or behavior to reduce code. Think suckless philosophy: achieve the same goal with less code, not by removing the goal. After finishing tasks, review code to minimize and optimize, while preserving all functionality and clarity.

**Runtime:** `bun` runtime, `bunx --bun` for package execution, Bun Shell (`$`) for shell commands.

**Testing:** `bun test` for testing. `mise` for version management and task running.

### State Management with SolidJS Stores

```typescript
import { bufferStore, windowStore, editorUiStore } from "@bunvim/sdk";

// Access reactive state directly
const activeBuffer = () => bufferStore.buffers.find((b) => b.id === activeWindow()?.bufId);

// Update state with actions
import { bufferActions, windowActions, editorUiActions } from "@bunvim/sdk";
bufferActions.createState("content", { type: "file", path: "file.ts" });
windowActions.setCursor(winId, line, column);
editorUiActions.setMode({ type: "insert" });
```

### Task management

Always create todo lists or other task management style tools. Delegate tasks if needed.

See individual package AGENTS.md for more details.
