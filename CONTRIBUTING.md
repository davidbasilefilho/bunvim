# Contributing to bunvim

Thanks for wanting to help build the next generation of terminal editing.

## Quick Start

We use **mise** so everyone uses the exact same Bun and Zig versions. Don't rely on your global installs.

1.  **Install mise**: [https://mise.jdx.dev](https://mise.jdx.dev)
2.  **Setup Repo**:
    ```bash
    git clone https://github.com/davidbasilefilho/bunvim
    cd bunvim
    mise install  # Installs the right Bun & Zig versions
    mise trust    # If prompted
    ```
3.  **Run Dev**:
    ```bash
    bun install
    bun dev       # Watches for changes and runs the TUI
    ```

## Architecture & Standards

**Read this before you write code.**
We have strict rules to keep the editor fast and stable.

1.  **No OOP**: We use functional patterns only. No classes, no inheritance.
2.  **Effect-TS**: We use `Effect` for all side effects (I/O, State, Async).
    * If you haven't used it before, look at the existing code in `src/` to see how we handle errors and concurrency.
3.  **Zig Core**: The heavy lifting (TUI rendering) is done by OpenTUI in Zig.

## Testing

Run the tests and linter before opening a PR.

```bash
bun run test
bun run check  # Runs Biome linting & formatting
```

## Pull Request Process

1.  Fork the repo and branch off `main`.
2.  Add tests if you added a new feature.
3.  Make sure `bun run test` passes.
4.  Stick to the functional style guide (No classes, use Effect).

## License

By contributing, you agree your code will be licensed under the [Apache 2.0 License](./LICENSE).
