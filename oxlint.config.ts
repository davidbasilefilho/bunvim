import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: [
    "jsdoc",
    "import",
    "node",
    "eslint",
    "jsx-a11y",
    "typescript",
    "unicorn",
    "oxc",
    "promise",
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
