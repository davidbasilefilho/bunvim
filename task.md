# UI & Core functionality Update

## Objective
Improve the visual aesthetics of the Picker and Clue menus, introduce new window properties, implement efficient window/buffer navigation keybindings, and ensure reliable file saving.

## Constraints
- **CRITICAL**: **DO NOT** modify the theme definitions in `packages/bunvim/src/theme/builtin.ts` in any way. Do not change the values of the colors inside the theme.
- **CRITICAL**: Use the existing theme tokens provided by the `getColors()` hook.

## Instructions

1. **Color Usage & Styling** (Picker/Clue):
   - Modify `packages/bunvim/src/ui/picker.tsx` and `packages/bunvim/src/ui/clue.tsx`.
   - Use appropriate theme tokens (e.g., `colors.surface`, `colors.overlay`) to improve contrast.
   - Improve margins, padding, and borders.

2. **Window Properties**:
   - Modify the `Window` component (likely in `src/ui/window.tsx`) to add:
     - `hideTabline` (boolean, default: `false`): Hides the tabline/header.
     - `singleBuffer` (boolean, default: `false`): Enforces single buffer mode.

3. **Apply to Picker & Clue**:
   - Update `picker.tsx` and `clue.tsx` to use `hideTabline={true}` and `singleBuffer={true}` on their Windows.

4. **Window & Buffer Navigation**:
   - Implement the following global keybindings (likely in `keybindings/keymap.ts` or `motions.ts`):
     - **Focus Navigation**:
       - `Ctrl+h`: Focus window to the left.
       - `Ctrl+j`: Focus window below.
       - `Ctrl+k`: Focus window above.
       - `Ctrl+l`: Focus window to the right.
     - **Buffer Movement** (Swap/Move buffer to adjacent window):
       - `Ctrl+H`: Move current buffer to the left window.
       - `Ctrl+J`: Move current buffer to the window below.
       - `Ctrl+K`: Move current buffer to the window above.
       - `Ctrl+L`: Move current buffer to the right window.

5. **File System Reliability**:
   - **CRITICAL**: Verify and fix file saving logic.
   - Inspect `packages/bunvim/src/commands/file.ts` and core document logic.
   - Ensure commands like `:w` persist data to disk correctly.
