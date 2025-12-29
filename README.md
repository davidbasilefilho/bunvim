# Bunvim Monorepo

This is a Bun-native monorepo using Turborepo and Biome.

## Tooling Stack

- **Package Manager**: [Bun](https://bun.sh)
- **Task Runner**: [Turborepo](https://turbo.build)
- **Linting & Formatting**: [Biome](https://biomejs.dev)
- **Type Checking**: [TypeScript](https://www.typescriptlang.org)
- **Build**: [Bun Build](https://bun.sh/docs/bundler) (Compiles to single-file binaries)

## Getting Started

Run the following command to install dependencies:

```sh
bun install
```

## Development

To develop the project:

```sh
bun dev
```

## Tasks

You can run tasks for all packages from the root:

```sh
bun run build          # Build all packages
bun run lint           # Lint all packages
bun run format         # Format all packages
bun run check          # Lint and format check
bun run check-types    # Type check all packages
bun run test           # Run tests
```

## Project Structure

- `packages/bunvim`: Core Bunvim editor package.
