import { catppuccinMacchiato, type Theme } from "./builtin";

let currentTheme: Theme = catppuccinMacchiato;

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme) {
  currentTheme = theme;
}

export function getColors() {
  return currentTheme.colors;
}
