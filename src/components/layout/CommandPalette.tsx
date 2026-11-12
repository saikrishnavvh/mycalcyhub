import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, Input, cn } from "@/design-system/minimal-and-sleek-69c4a4";
import { getCategory, searchCalculators } from "@/calculators/registry";
import { t } from "@/i18n";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const results = searchCalculators(q);

  useEffect(() => { if (open) { setQ(""); setActive(0); } }, [open]);
  useEffect(() => setActive(0), [q]);

  const go = (i: number) => {
    const c = results[i];
    if (!c) return;
    onOpenChange(false);
    navigate({ to: "/$category/$slug", params: { category: c.category, slug: c.slug } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t("palette.title")}>
      <div className="flex flex-col gap-3">
        <Input
          autoFocus
          size="lg"
          placeholder={t("nav.search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter") { e.preventDefault(); go(active); }
          }}
        />
        <ul id="palette-list" role="listbox" className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {results.length === 0 && <li className="px-3 py-6 text-center text-muted-foreground">{t("palette.empty")}</li>}
          {results.map((c, i) => {
            const Icon = c.icon;
            return (
              <li key={c.id} id={`palette-${c.id}`} role="option" aria-selected={i === active}>
                <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(i)}
                  className={cn("flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left", i === active && "bg-foreground/[0.04]")}>
                  <Icon className="size-4 text-accent" aria-hidden />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{getCategory(c.category)?.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Dialog>
  );
}
