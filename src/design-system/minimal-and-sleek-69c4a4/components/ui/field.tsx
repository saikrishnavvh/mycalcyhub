import * as React from "react";
import { cn } from "@/design-system/minimal-and-sleek-69c4a4/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium text-foreground", className)} {...props} />
));
Label.displayName = "Label";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible label text. */
  label: React.ReactNode;
  /** id of the control inside; wires the label to it. */
  htmlFor: string;
  /** Quiet helper text under the control. */
  hint?: React.ReactNode;
  /** Error message; replaces the hint. */
  error?: React.ReactNode;
}

/** Label + control + hint/error, stacked with calm spacing. */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ label, htmlFor, hint, error, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  ),
);
Field.displayName = "Field";
