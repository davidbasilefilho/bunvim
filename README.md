# Bunvim

A Neovim-like terminal editor built with TypeScript, Bun, and OpenTUI.

![Bunvim](https://github.com/user-attachments/assets/placeholder.png)

## Features

- **Modal Editing**: Vim-compatible modes (Normal, Insert, Visual, Command).
- **Fast**: Built on Bun for high performance.
- **Modern**: React-based UI with OpenTUI.
- **Extensible**: Plugin system using TypeScript.
- **Built-in**: Fuzzy finder, LSP support, Treesitter highlighting (experimental).

## Installation

### Binary

Download the latest release from the [Releases](https://github.com/yourusername/bunvim/releases) page.

### From Source

```bash
git clone https://github.com/yourusername/bunvim.git
cd bunvim
mise install # or manually install bun
bun install
bun run build
./bin/bvim
```

## Usage

```bash
bvim [file] [directory]
```

- `bvim .`: Open with current directory as root.
- `bvim file.ts`: Open a specific file.

## Configuration

Configuration is located at `~/.config/bvim/init.ts` (or directory structure).

## License

MIT
