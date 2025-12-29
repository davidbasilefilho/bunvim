# Task: Fix LSP Diagnostics in Refactored UI Components

I have just refactored the following files to use a new semantic theme system:
- `packages/bunvim/src/ui/editor-buffer.tsx`
- `packages/bunvim/src/ui/picker.tsx`
- `packages/bunvim/src/ui/clue.tsx`

The specific changes involved replacing hardcoded colors with calls to `getColors()` from `packages/bunvim/src/theme/manager.ts`, and using the new semantic properties defined in the `Theme` interface in `packages/bunvim/src/theme/builtin.ts` (e.g., `colors.picker.bg`, `colors.success`, etc.).

**Your Goal:**
Check these files for LSP diagnostics/TypeScript errors and fix them.

**Context:**
1.  **theme/builtin.ts**: The `Theme` interface was updated to include new semantic keys (e.g., `picker`, `clue`, `surface`, `overlay`, etc.).
2.  **theme/manager.ts**: Exports `getColors()` which returns `currentTheme.colors`.
3.  **UI Components**: I refactored them to use `const colors = getColors();` and then access `colors.picker.bg`, etc.

**Potential Issues:**
- `getColors` might not be imported correctly in some files.
- The `Theme` interface update might not be fully propagating if `getColors` return type wasn't inferred correctly (though it should be).
- In `picker.tsx`, I might have placed imports in the wrong spot (I see a potential issue in the diff usage where `import { getColors } ...` was added mid-file in the view, though I tried to place it at the top). Check for syntax errors or misplaced imports.
- In `editor-buffer.tsx`, I added a `captureColors` object mapping highlight captures to theme colors. Ensure the types for keys align with what's expected.

**Instructions:**
1.  Verify the imports in `packages/bunvim/src/ui/picker.tsx`. I may have accidentally pasted the import statement in the middle of the file.
2.  Run a type check or verify the files manually to ensure all properties accessed on `colors` (like `colors.picker`, `colors.clue`) actually exist on the returned type of `getColors()`.
3.  Fix any syntax errors or type errors found in the three files listed above.
