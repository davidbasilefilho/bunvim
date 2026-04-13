import { opt } from "@bunvim/sdk";
import { Show } from "solid-js";

interface InputPopupProps {
  label: string;
  value: string;
  icon?: string;
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
  const displayIcon = showIcon ? (props.icon === "/" ? "" : ":") : "";
  const displayLabel = showIcon ? "" : props.label === "COMMAND" ? "CMD" : props.label;
  const colors = {
    accent: "#7aa2f7",
    label: "#e0af68",
    fg: "#c0caf5",
    bg: "#24283b",
  };

  return (
    <box
      position="absolute"
      left="25%"
      top="35%"
      width="50%"
      height={5}
      flexDirection="row"
      alignItems="center">
      <box
        style={{
          width: 1,
          height: 3,
          marginRight: 1,
          backgroundColor: colors.accent,
        }}
      />
      <box
        flexDirection="row"
        flexGrow={1}
        alignItems="center"
        justifyContent="flex-start"
        style={{
          height: 3,
          backgroundColor: colors.bg,
          paddingLeft: 2,
          paddingRight: 2,
        }}>
        {showIcon ? (
          <text fg={colors.accent} style={{ marginRight: 1 }}>
            {displayIcon}
          </text>
        ) : (
          <text fg={colors.label} style={{ marginRight: 1 }}>
            {displayLabel}
          </text>
        )}

        <Show
          when={props.useNativeInput}
          fallback={
            <box>
              <text fg={colors.fg}>{props.value}</text>
              <text fg={colors.accent}>|</text>
            </box>
          }>
          <input
            value={props.value}
            onInput={(val) => props.onInput?.(val)}
            onSubmit={() => props.onSubmit?.()}
            onCancel={() => props.onCancel?.()}
            focused
            width="100%"
            backgroundColor={colors.bg}
            textColor={colors.fg}
            cursorColor={colors.accent}
          />
        </Show>
      </box>
    </box>
  );
}
