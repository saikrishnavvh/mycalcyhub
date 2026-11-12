import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { categories, groupBySubcategory, inCategory } from "@/calculators/registry";
import { t } from "@/i18n";

const item = "flex min-h-9 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors duration-(--duration-quick) ease-(--ease-gentle) hover:bg-foreground/[0.04] hover:text-foreground";
const active = { className: "bg-surface font-medium text-foreground" };

/** Category → subcategory → calculator tree. Inline column on desktop, overlay drawer on phones. */
export function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const closeOnPhone = () => { if (window.innerWidth < 1024) onClose(); };
  return (
    <>
      <button type="button" aria-label={t("nav.collapse")} onClick={onClose} className="fixed inset-0 z-40 bg-foreground/20 lg:hidden print:hidden" />
      <nav aria-label={t("nav.menu")}
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-4 overflow-y-auto border-r border-border bg-background p-4 shadow-float lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-4rem)] lg:w-64 lg:shadow-none print:hidden">
        <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("nav.menu")}</p>
        {categories.map((cat) => (
          <details key={cat.id} open className="group">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-foreground/[0.04]">
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
              {cat.name}
            </summary>
            <div className="ml-5 flex flex-col gap-2 border-l border-border pl-2 pt-1">
              <Link to="/$category" params={{ category: cat.id }} activeOptions={{ exact: true }} activeProps={active} className={item} onClick={closeOnPhone}>{t("nav.allIn", { name: cat.name })}</Link>
              {groupBySubcategory(inCategory(cat.id)).map(([sub, list]) => (
                <div key={sub} className="flex flex-col">
                  <p className="px-3 py-1 text-xs text-muted-foreground">{sub}</p>
                  {list.map((c) => (
                    <Link key={c.id} to="/$category/$slug" params={{ category: c.category, slug: c.slug }} activeProps={active} className={item} onClick={closeOnPhone}>{c.name}</Link>
                  ))}
                </div>
              ))}
            </div>
          </details>
        ))}
      </nav>
    </>
  );
}
