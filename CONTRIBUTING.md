# Contributing to Bunvim

Thank you for your interest in contributing to Bunvim!

## Getting Started

1.  **Fork the repository** and clone it locally.
2.  **Install tools**: We use [mise](https://mise.jdx.dev) to manage tool versions (Bun, etc.).
    ```bash
    mise install
    ```
3.  **Install dependencies**:
    ```bash
    bun install
    ```

## Development

-   **Run locally**:
    ```bash
    bun dev
    # or inside packages/bunvim
    bun run dev
    ```
-   **Lint & Format**:
    ```bash
    bun run check
    ```
-   **Test**:
    ```bash
    bun test
    ```

## Project Structure

This is a monorepo managed by Turborepo.
-   `packages/bunvim`: The core editor.

## Pull Requests

1.  Create a new branch for your feature or fix.
2.  Commit your changes following conventional commits if possible.
3.  Ensure `bun run check` passes.
4.  Open a Pull Request.

## Architecture

See `AGENTS.md` and `PLAN.md` for architectural details and future plans.
