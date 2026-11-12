import { Link } from "@tanstack/react-router";
import type { CalculatorDefinition } from "@/calculators/types";

export function CalculatorCard({ calc }: { calc: CalculatorDefinition }) {
  const Icon = calc.icon;
  return (
    <Link
      to="/$category/$slug"
      params={{ category: calc.category, slug: calc.slug }}
      className="group flex min-h-11 items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors duration-(--duration-quick) ease-(--ease-gentle) hover:bg-foreground/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface text-accent">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-semibold tracking-tight">{calc.name}</span>
        <span className="text-sm text-muted-foreground">{calc.shortDescription}</span>
      </span>
    </Link>
  );
}
