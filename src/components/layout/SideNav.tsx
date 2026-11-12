import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Input } from "@/design-system/minimal-and-sleek-69c4a4";
import { categories, groupBySubcategory, inCategory } from "@/calculators/registry";
import { t } from "@/i18n";
import { readJSON, writeJSON } from "@/lib/storage";

const OPEN_KEY = "calchub:nav-open";
const calcLink =
  "flex min-h-9 items-center rounded-md border-l-2 border-transparent px-3 text-sm text-foreground/80 transition-colors duration-(--duration-quick) ease-(--ease-gentle) hover:bg-foreground/[0.04] hover:text-foreground";
const activeCalc = { className: "border-accent bg-surface font-medium text-foreground" };

/** Category → group heading → calculator tree. Inline column on desktop, overlay drawer on phones. */
export function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = path.split("/")[1];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = readJSON<Record<string, boolean>>(OPEN_KEY, {});
    setExpanded(typeof saved === "object" && saved ? saved : {});
  }, []);

  if (!open) return null;
  const closeOnPhone = () => { if (window.innerWidth < 1024) onClose(); };
  const q = query.trim().toLowerCase();
  const isOpen = (id: string) => (q ? true : expanded[id] ?? id === current);
  const toggle = (id: string) => {
    const next = { ...expanded, [id]: !isOpen(id) };
    setExpanded(next);
    writeJSON(OPEN_KEY, next);
  };
  let total = 0;

  return (
    <>
      <button type="button" aria-label={t("nav.collapse")} onClick={onClose} className="fixed inset-0 z-40 bg-foreground/20 lg:hidden print:hidden" />
      <nav aria-label={t("nav.menu")}
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-4 overflow-y-auto border-r border-border bg-background p-4 shadow-float lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-4rem)] lg:w-64 lg:shadow-none print:hidden">
        <Input type="search" aria-label={t("nav.filter")} placeholder={t("nav.filter")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex flex-col gap-2">
          {categories.map((cat) => {
            const all = inCategory(cat.id);
            const list = q ? all.filter((c) => c.name.toLowerCase().includes(q) || c.subcategory.toLowerCase().includes(q)) : all;
            if (!list.length) return null;
            total += list.length;
            const expandedNow = isOpen(cat.id);
            const panelId = `nav-${cat.id}`;
            return (
              <div key={cat.id} className="flex flex-col">
                <div className="flex min-h-10 items-center rounded-md hover:bg-foreground/[0.04]">
                  <button type="button" onClick={() => toggle(cat.id)} aria-expanded={expandedNow} aria-controls={panelId}
                    aria-label={t("nav.toggle", { name: cat.name })} className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground">
                    <ChevronRight aria-hidden className={`size-4 transition-transform duration-(--duration-quick) ease-(--ease-gentle) ${expandedNow ? "rotate-90" : ""}`} />
                  </button>
                  <Link to="/$category" params={{ category: cat.id }} onClick={closeOnPhone}
                    className="flex min-h-10 flex-1 items-center justify-between pr-3 text-sm font-semibold text-foreground"
                    activeOptions={{ exact: true }} activeProps={{ className: "text-accent-foreground" }}>
                    <span>{cat.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{list.length}</span>
                  </Link>
                </div>
                {expandedNow && (
                  <div id={panelId} className="flex flex-col gap-4 pb-2 pl-4 pt-2">
                    {groupBySubcategory(list).map(([sub, items]) => (
                      <div key={sub} className="flex flex-col gap-0.5">
                        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{sub}</p>
                        {items.map((c) => (
                          <Link key={c.id} to="/$category/$slug" params={{ category: c.category, slug: c.slug }} activeProps={activeCalc} className={calcLink} onClick={closeOnPhone}>{c.name}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {q && total === 0 && <p className="px-3 text-sm text-muted-foreground">{t("nav.noMatch")}</p>}
        </div>
      </nav>
    </>
  );
}
