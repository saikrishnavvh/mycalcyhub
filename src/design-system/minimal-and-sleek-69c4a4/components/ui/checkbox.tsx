import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/design-system/minimal-and-sleek-69c4a4/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

/** Native checkbox with a soft, rounded look. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <span className={cn("relative inline-flex size-[18px] shrink-0", className)}>
    <input
      ref={ref}
      type="checkbox"
      className="peer size-full appearance-none rounded-sm border border-input bg-card transition-colors duration-(--duration-quick) checked:border-accent checked:bg-accent hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-45"
      {...props}
    />
    <Check aria-hidden className="pointer-events-none absolute inset-0 m-auto size-3 text-accent-foreground opacity-0 peer-checked:opacity-100" strokeWidth={3} />
  </span>
));
Checkbox.displayName = "Checkbox";
