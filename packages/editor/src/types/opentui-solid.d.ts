import type { JSX, CSSProperties } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      box: BoxAttributes;
      text: TextAttributes;
      ascii_font: AsciiFontAttributes;
      input: InputAttributes;
    }
  }
}

interface BoxAttributes {
  position?: "absolute" | "relative";
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  width?: string | number;
  height?: string | number;
  flexGrow?: string | number;
  flexShrink?: string | number;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "stretch";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  gap?: string | number;
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
  border?: boolean;
  borderStyle?: "single" | "double" | "rounded" | "bold" | "dashed";
  borderColor?: string;
  backgroundColor?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface TextAttributes {
  fg?: string;
  bg?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface AsciiFontAttributes {
  text?: string;
  font?: string;
  color?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}

interface InputAttributes {
  type?: "text" | "password" | "number";
  value?: string;
  placeholder?: string;
  style?: CSSProperties;
  children?: JSX.Element;
  key?: string | number;
}
