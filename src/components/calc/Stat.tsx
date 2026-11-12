import { cn } from "@/design-system/minimal-and-sleek-69c4a4";

interface Props { label: string; value: string; compact?: string | null; emphasis?: boolean; hint?: string }

export function Stat({ label, value, compact, emphasis, hint }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-semibold tracking-tight tabular-nums break-all", emphasis ? "text-4xl text-accent" : "text-xl")}>{value}</span>
      {compact && <span className="text-xs text-muted-foreground tabular-nums">≈ {compact}</span>}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
