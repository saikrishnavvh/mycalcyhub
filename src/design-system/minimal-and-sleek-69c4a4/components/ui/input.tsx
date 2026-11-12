import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/minimal-and-sleek-69c4a4/lib/utils";

export const fieldVariants = cva(
  "w-full rounded-md border bg-card text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow] duration-(--duration-quick) ease-(--ease-gentle) hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/15",
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-4 text-base" },
    },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fieldVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldVariants({ size }), "border-input", className)} {...props} />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(fieldVariants(), "h-auto min-h-20 resize-y border-input py-2.5 leading-relaxed", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
