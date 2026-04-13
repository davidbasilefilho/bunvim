import fs from "node:fs";

import { ErrorBoundary as SolidErrorBoundary } from "solid-js";
import type { JSX } from "solid-js";

interface ErrorBoundaryProps {
  name: string;
  children: JSX.Element;
  fallback?: (err: Error) => JSX.Element;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <SolidErrorBoundary
      fallback={(err) => {
        const msg = err?.message ?? String(err);
        const stack = err?.stack ?? "no stack";
        console.error(`[ErrorBoundary/${props.name}]:`, msg, stack);
        try {
          fs.writeFileSync(
            "C:/Users/basile/dev/bunvim/error_log.txt",
            `[ErrorBoundary/${props.name}]: ${msg}\n${stack}\n`,
            { flag: "a" },
          );
        } catch {}
        if (props.fallback) {
          return props.fallback(err);
        }
        return (
          <box flexGrow={1} flexDirection="column" alignItems="center" justifyContent="center">
            <text fg="#f7768e">{`Error in ${props.name}`}</text>
            <text fg="#f7768e">{msg}</text>
          </box>
        );
      }}>
      {props.children}
    </SolidErrorBoundary>
  );
}
