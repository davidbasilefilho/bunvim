# bunvim

**The Bun-native modal editor.**

bunvim solves the trade-off between performance and hackability. You get the raw speed of a compiled language for the core, with the ease of TypeScript for everything else.

![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Status](https://img.shields.io/badge/status-v0.1%20Alpha-orange)

## Why bunvim?

* **Bun-native Speed**: Core rendering and text buffers use **OpenTUI (Zig)** and **Bun**. We target sub-16ms latency.
* **TypeScript Config**: Configure and script the editor in pure TypeScript. No Lua, no Vimscript.
* **Batteries Included**: Fuzzy finder, LSP, Git integration, and Flash navigation come built-in.
* **Robust Architecture**: State management is handled by **Effect-TS**, making it stable and predictable.

## Installation

### Pre-built Binaries
Grab the binary for your OS from the [Releases Page](https://github.com/davidbasilefilho/bunvim/releases).

### Build from Source
You need the following tools installed:
* **mise**: To manage the build toolchain.
* **git**: To clone the repo.
* **ripgrep**: Required for the live grep picker.
* **fd**: Required for the file picker.

```bash
git clone https://github.com/davidbasilefilho/bunvim
cd bunvim
mise install  # Installs the correct Bun and Zig versions
bun install
bun run build:all
```

## Getting Started

Run the editor from the root:

```bash
./bin/bvim
```

## Contributing

We want contributors. If you know TypeScript, you can build core features.
Check [CONTRIBUTING.md](./CONTRIBUTING.md) for the rules.

## Tech Stack

We use a hybrid architecture to maximize performance and developer experience:
* **Core & TUI**: [OpenTUI](https://github.com/opentui/opentui) (Zig)
* **Runtime**: [Bun](https://bun.sh) (Zig)
* **Architecture**: [Effect-TS](https://effect.website)
* **Plugins & Config**: TypeScript

## Special Thanks

We stand on the shoulders of giants. This project wouldn't exist without:
* **The Neovim Team**: For reviving Vim and setting the standard for modern terminal editing.
* **The Helix Team**: For proving that modal editors can be fast and sane out-of-the-box.
* **The Bun Team**: For building the runtime that makes this architecture possible.
* **The OpenTUI Team**: For the high-performance TUI engine powering our core.

## License

[Apache 2.0](./LICENSE)
