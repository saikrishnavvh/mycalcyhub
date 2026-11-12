import * as React from "react";
import { cn } from "@/design-system/minimal-and-sleek-69c4a4/lib/utils";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Accessible on/off toggle (role="switch"). Controlled or uncontrolled. */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked = false, onCheckedChange, className, onClick, ...props }, ref) => {
    const [inner, setInner] = React.useState(defaultChecked);
    const on = checked ?? inner;
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={on}
        data-state={on ? "on" : "off"}
        onClick={(e) => {
          onClick?.(e);
          if (checked === undefined) setInner(!on);
          onCheckedChange?.(!on);
        }}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-(--duration-quick) ease-(--ease-gentle) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-45 disabled:pointer-events-none",
          on ? "bg-accent" : "bg-input",
          className,
        )}
        {...props}
      >
        <span className={cn("block size-5 rounded-full bg-card shadow-whisper transition-transform duration-(--duration-quick) ease-(--ease-gentle)", on ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
    );
  },
);
Switch.displayName = "Switch";
