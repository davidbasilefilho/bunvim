import { opt } from "@bunvim/sdk";
import { Show } from "solid-js";

interface InputPopupProps {
  label: string;
  value: string;
  icon?: string;
  inline?: boolean;
  /** Use native OpenTUI input component */
  useNativeInput?: boolean;
  /** Called when input value changes */
  onInput?: (value: string) => void;
  /** Called when user presses Enter */
  onSubmit?: () => void;
  /** Called when user presses Escape */
  onCancel?: () => void;
}

export function InputPopup(props: InputPopupProps) {
  const showIcon = opt.nerdFont;
  const displayPrefix = props.label === "COMMAND" ? "CMD" : props.label;
  const prefixWidth = displayPrefix.length + 1;
  const colors = {
    accent: "#7aa2f7",
    label: "#e0af68",
    fg: "#c0caf5",
    bg: "#24283b",
  };

  const content = (
    <box
      flexDirection="row"
      alignItems="center"
      style={{
        height: 3,
        backgroundColor: colors.bg,
        paddingLeft: 2,
        paddingRight: 2,
      }}>
      <box
        style={{
          width: 1,
          height: 3,
          marginRight: 1,
          backgroundColor: colors.accent,
        }}
      />
      <box flexDirection="row" alignItems="center" flexGrow={1}>
        <box width={prefixWidth} style={{ marginRight: 1 }}>
          <text fg={showIcon ? colors.accent : colors.label}>{displayPrefix}</text>
        </box>

        <Show
          when={props.useNativeInput}
          fallback={
            <box>
              <text fg={colors.fg}>{props.value}</text>
              <text fg={colors.accent}>|</text>
            </box>
          }>
          <box flexGrow={1}>
            <input
              value={props.value}
              onInput={(val) => props.onInput?.(val)}
              onSubmit={() => props.onSubmit?.()}
              focused
              width="100%"
              backgroundColor={colors.bg}
              textColor={colors.fg}
              cursorColor={colors.accent}
            />
          </box>
        </Show>
      </box>
    </box>
  );

  if (props.inline) {
    return content;
  }

  return (
    <box
      position="absolute"
      left="25%"
      top="35%"
      width="50%"
      height={5}
      flexDirection="row"
      alignItems="center"
      style={{ zIndex: 100 }}>
      {content}
    </box>
  );
}
