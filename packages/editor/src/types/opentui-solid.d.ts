import type { KeyEvent } from "@opentui/core";
import type { JSX, CSSProperties } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      box: BoxAttributes;
      text: TextAttributes;
      ascii_font: AsciiFontAttributes;
      input: InputAttributes;
      textarea: TextareaAttributes;
      select: SelectAttributes;
      tab_select: TabSelectAttributes;
      scrollbox: ScrollBoxAttributes;
      code: CodeAttributes;
      markdown: MarkdownAttributes;
    }
  }
}

interface BoxAttributes {
  id?: string;
  position?: "absolute" | "relative";
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  width?: string | number;
  height?: string | number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  flexGrow?: string | number;
  flexShrink?: string | number;
  flexBasis?: string | number;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "stretch";
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "space-between"
    | "space-around";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  margin?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
  padding?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  paddingTop?: string | number;
  paddingBottom?: string | number;
  display?: "flex" | "none";
  overflow?: "visible" | "hidden" | "scroll";
  zIndex?: number;
  border?: boolean;
  borderStyle?: "single" | "double" | "rounded" | "bold" | "dashed" | "none";
  borderColor?: string;
  focusedBorderColor?: string;
  backgroundColor?: string;
  focusable?: boolean;
  focused?: boolean;
  title?: string;
  titleAlignment?: "left" | "center" | "right";
  bottomTitle?: string;
  bottomTitleAlignment?: "left" | "center" | "right";
  selectable?: boolean;
  buffered?: boolean;
  live?: boolean;
  enableLayout?: boolean;
  renderAfter?: string;
  renderBefore?: string;
  onKeyDown?: (key: KeyEvent) => void;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface TextAttributes {
  id?: string;
  content?: string;
  fg?: string;
  bg?: string;
  selectable?: boolean;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface AsciiFontAttributes {
  id?: string;
  text?: string;
  font?: string;
  color?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface InputAttributes {
  id?: string;
  type?: "text" | "password" | "number";
  value?: string;
  placeholder?: string;
  focused?: boolean;
  width?: string | number;
  backgroundColor?: string;
  textColor?: string;
  cursorColor?: string;
  focusedBackgroundColor?: string;
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface TextareaAttributes {
  id?: string;
  value?: string;
  placeholder?: string;
  focused?: boolean;
  onSubmit?: () => void;
  onContentChange?: (value: string) => void;
  onCursorChange?: (value: { line: number; visualColumn: number }) => void;
  onKeyDown?: (event: KeyEvent) => void;
  onKeyPress?: (event: KeyEvent) => void;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface SelectAttributes {
  id?: string;
  focused?: boolean;
  options?: Array<{ name: string; description?: string; value?: string }>;
  selectedIndex?: number;
  onChange?: (
    index: number,
    option: { name: string; description?: string; value?: string } | null,
  ) => void;
  onSelect?: (
    index: number,
    option: { name: string; description?: string; value?: string } | null,
  ) => void;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface TabSelectAttributes {
  id?: string;
  focused?: boolean;
  options?: Array<{ name: string; description?: string }>;
  selectedIndex?: number;
  onChange?: (index: number, option: { name: string; description?: string } | null) => void;
  onSelect?: (index: number, option: { name: string; description?: string } | null) => void;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface ScrollBoxAttributes {
  id?: string;
  focused?: boolean;
  stickyScroll?: boolean;
  stickyStart?: "bottom" | "top" | "left" | "right";
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface CodeAttributes {
  id?: string;
  content?: string;
  filetype?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface MarkdownAttributes {
  id?: string;
  content?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}
