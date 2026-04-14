import { Effect, pipe } from "effect";

import { getAll as getAllCommands } from "../api/command";
import { getListedBuffers } from "../stores/bufferStore";
import { runCommand } from "../utils/shell";
import type { PickerItem, PickerSource } from "./source";

type FileCache = {
  items: PickerItem[];
  timestamp: number;
};

const CACHE_TTL_MS = 30000;
let filesCache: FileCache | null = null;

export function clearFilesCache() {
  filesCache = null;
}

export const bufferSource: PickerSource = {
  name: "Buffers",
  getItems: async (_query: string) =>
    getListedBuffers().map((buf) => ({
      text: buf.props.name || buf.props.path || "[No Name]",
      data: { bufId: buf.id },
    })),
};

export const filesSource: PickerSource = {
  name: "Files",
  getItems: async (_query: string) => {
    const now = Date.now();
    if (filesCache && now - filesCache.timestamp < CACHE_TTL_MS) {
      return filesCache.items;
    }

    const items = await Effect.runPromise(
      pipe(
        runCommand("fd --type f --hidden --exclude .git --exclude node_modules"),
        Effect.map((output) => {
          const items = output
            .split("\n")
            .filter(Boolean)
            .map((file) => ({
              text: file,
              data: { file },
            }));
          filesCache = { items, timestamp: now };
          return items;
        }),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
    return items;
  },
};

export const grepSource = (file?: string): PickerSource => ({
  name: file ? `Grep: ${file}` : "Grep",
  getItems: async (query: string) => {
    if (query.length < 2) return [];

    const q = (s: string) => JSON.stringify(s);
    const cmd = `rg --vimgrep --smart-case ${q(query)}${file ? ` ${q(file)}` : ""}`;
    return Effect.runPromise(
      pipe(
        runCommand(cmd),
        Effect.map((output) =>
          output
            .split("\n")
            .filter(Boolean)
            .slice(0, 100)
            .map((line) => {
              const parts = line.split(":");
              const fileName = parts[0] || "";
              const lineNum = parts[1] || "1";
              const col = parts[2] || "1";
              const rest = parts.slice(3).join(":");
              return {
                text: file ? `${lineNum}: ${rest.trim()}` : `${fileName}:${lineNum}: ${rest.trim()}`,
                data: {
                  file: fileName,
                  line: Number.parseInt(lineNum, 10),
                  col: Number.parseInt(col, 10),
                },
              };
            }),
        ),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  },
});

export const commandSource: PickerSource = {
  name: "Commands",
  getItems: async (query: string) => {
    const normalized = query.trim().toLowerCase();
    const commands = getAllCommands();
    const filtered = normalized
      ? commands.filter((cmd) => cmd.name.toLowerCase().includes(normalized))
      : commands;

    return filtered
      .sort((a, b) => {
        const aStarts = normalized && a.name.toLowerCase().startsWith(normalized) ? 1 : 0;
        const bStarts = normalized && b.name.toLowerCase().startsWith(normalized) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return a.name.localeCompare(b.name);
      })
      .map((cmd) => ({
        text: cmd.name,
        data: { command: cmd.name },
      }));
  },
};
