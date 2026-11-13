import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Hash, Monitor, Moon, Sun } from "lucide-react";
import { Input, cn } from "@/design-system/minimal-and-sleek-69c4a4";
import { t } from "@/i18n";
import { listCurrencies } from "@/lib/currencies";
import { NUMBER_FORMATS, currencySymbol } from "@/lib/format";
import { useSettings, type Theme } from "@/lib/settings";

const iconBtn = "flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-quick) ease-(--ease-gentle) hover:bg-foreground/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-foreground/[0.04] aria-expanded:text-foreground";

/** Icon button that opens a small panel under it. Closes on outside click or Escape. */
function IconMenu({ label, icon, children }: { label: string; icon: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={label} title={label} aria-expanded={open} onClick={() => setOpen((o) => !o)} className={iconBtn}>{icon}</button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-float">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" role="option" aria-selected={active} onClick={onClick}
      className={cn("flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-foreground/[0.04]", active && "bg-surface")}>
      <span className="flex flex-1 items-center gap-3 truncate">{children}</span>
      {active && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
    </button>
  );
}

/** Shows the active currency's symbol (₹, $, €); falls back to its short code when no symbol exists. */
function CurrencyMark({ code, fmt }: { code: string; fmt: Parameters<typeof currencySymbol>[1] }) {
  const sym = currencySymbol(code, fmt);
  const short = sym.length <= 2;
  return <span aria-hidden className={cn("font-semibold tabular-nums leading-none", short ? "text-lg" : "font-mono text-xs")}>{short ? sym : code}</span>;
}

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export function HeaderSettings() {
  const s = useSettings();
  const [q, setQ] = useState("");
  const currencies = useMemo(() => listCurrencies(), []);
  const filtered = currencies.filter((c) => `${c.code} ${c.name}`.toLowerCase().includes(q.trim().toLowerCase()));
  const theme = THEMES.find((x) => x.value === s.theme) ?? THEMES[2]!;
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]!;
  const ThemeIcon = theme.icon;

  return (
    <div className="flex items-center">
      <IconMenu label={`${t("settings.currency")}: ${s.currency}`} icon={<CurrencyMark code={s.currency} fmt={s.numberFormat} />}>
        {(close) => (
          <div className="flex flex-col gap-2">
            <Input autoFocus size="sm" aria-label={t("settings.currencySearch")} placeholder={t("settings.currencySearch")} value={q} onChange={(e) => setQ(e.target.value)} />
            <div role="listbox" aria-label={t("settings.currency")} className="flex max-h-64 flex-col overflow-y-auto">
              {filtered.map((c) => (
                <Option key={c.code} active={c.code === s.currency} onClick={() => { s.update({ currency: c.code }); setQ(""); close(); }}>
                  <span className="w-10 font-mono text-xs">{c.code}</span>
                  <span className="truncate text-muted-foreground">{c.name}</span>
                </Option>
              ))}
            </div>
          </div>
        )}
      </IconMenu>
      <IconMenu label={t("settings.numberFormat")} icon={<Hash className="size-5" aria-hidden />}>
        {(close) => (
          <div role="listbox" aria-label={t("settings.numberFormat")} className="flex flex-col">
            {NUMBER_FORMATS.map((f) => (
              <Option key={f.id} active={f.id === s.numberFormat} onClick={() => { s.update({ numberFormat: f.id }); close(); }}>
                <span className="tabular-nums">{f.label}</span>
              </Option>
            ))}
          </div>
        )}
      </IconMenu>
      <button type="button" className={iconBtn} onClick={() => s.update({ theme: next.value })}
        aria-label={`${t("settings.theme")}: ${t(`settings.theme.${theme.value}`)}. ${t(`settings.theme.${next.value}`)}`}
        title={`${t("settings.theme")}: ${t(`settings.theme.${theme.value}`)}`}>
        <ThemeIcon className="size-5" aria-hidden />
      </button>
    </div>
  );
}
