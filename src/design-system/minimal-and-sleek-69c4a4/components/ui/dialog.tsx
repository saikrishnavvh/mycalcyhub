import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/design-system/minimal-and-sleek-69c4a4/lib/utils";

export interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons shown at the bottom right. */
  footer?: React.ReactNode;
}

/** Modal built on the native <dialog>: focus trap, Esc to close, backdrop click to close. */
export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onOpenChange, title, description, footer, className, children, ...props }, ref) => {
    const inner = React.useRef<HTMLDialogElement>(null);
    React.useImperativeHandle(ref, () => inner.current as HTMLDialogElement);
    React.useEffect(() => {
      const d = inner.current;
      if (!d) return;
      if (open && !d.open) d.showModal();
      if (!open && d.open) d.close();
    }, [open]);
    return (
      <dialog
        ref={inner}
        onClose={() => onOpenChange(false)}
        onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
        className={cn(
          "m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-float backdrop:bg-foreground/15 backdrop:backdrop-blur-[2px] open:animate-in open:fade-in-0 open:zoom-in-[0.98]",
          className,
        )}
        {...props}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button type="button" aria-label="Close" onClick={() => onOpenChange(false)} className="-mr-2 -mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="size-4" />
            </button>
          </div>
          {children && <div className="mt-4 text-sm">{children}</div>}
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </div>
      </dialog>
    );
  },
);
Dialog.displayName = "Dialog";
