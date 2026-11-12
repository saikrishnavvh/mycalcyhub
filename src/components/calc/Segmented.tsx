import { cn } from "@/design-system/minimal-and-sleek-69c4a4";

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
}

/** Small toggle group (units, modes). Uses radio semantics for screen readers. */
export function Segmented<T extends string>({ value, onChange, options, label, className }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex shrink-0 rounded-md border border-border bg-surface p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-9 flex-1 rounded-sm px-3 text-sm whitespace-nowrap transition-colors duration-(--duration-quick) ease-(--ease-gentle) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-card text-foreground shadow-whisper" : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
