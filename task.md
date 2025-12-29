1. make sure there aren't duplicated/too similar types that can be one, merge them.
2. order inside file should be: imports; types/interfaces; constants; functions; exports. (update agents.md file with these rules too)
3. separate ./packages/bunvim/AGENTS.md and ./AGENTS.md, to separate scopes (project-wide vs package-specific). Update references accordingly.
4. create a components directory in the bunvim package, and move all the reusable components there.
5. create components:
  - <button> component with variants (primary, secondary, danger), sizes (small, medium, large), types (button, which is the default, submit, reset), disabled state, loading state, onClick handler and mouse support.
  - <input> component with types (text, password, email, number), sizes (small, medium, large), disabled state, value, name and onChange handler.
  - <label> component with text prop, for prop and optional required (as boolean that adds it) indicator.
  - <scrollable> component that adds a styled scrollbar to its children, with optional props for height, width (default is full parent height/width).
6. create a path alias in the bunvim package tsconfig file for the src/ directory @ to make imports cleaner. and use it in the package.
7. polish/revamp the ui throughout the project to have a consistent modern look. make the pickers/clue have the same background color as the cmd input prompt component. make it pretty/consistent and with good alignment and spacing.
8. tell the project agents.md file to always use todo tools for complex tasks.

do these in the best order you see fit, it doesn't have to be in this specific one I laid out. make sure to test everything after each step to ensure nothing is broken.
