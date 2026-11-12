import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button, Dialog, Input, Label, cn } from "@/design-system/minimal-and-sleek-69c4a4";
import { t } from "@/i18n";
import { listCurrencies } from "@/lib/currencies";
import { NUMBER_FORMATS } from "@/lib/format";
import { useSettings, type Theme } from "@/lib/settings";
import { Segmented } from "@/components/calc/Segmented";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useSettings();
  const [q, setQ] = useState("");
  const all = useMemo(() => (open ? listCurrencies() : []), [open]);
  const filtered = all.filter((c) => `${c.code} ${c.name}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t("settings.title")} description={t("settings.description")}
      footer={<Button onClick={() => onOpenChange(false)}>{t("settings.done")}</Button>}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency-search">{t("settings.currency")} · <span className="text-accent">{s.currency}</span></Label>
          <Input id="currency-search" placeholder={t("settings.currencySearch")} value={q} onChange={(e) => setQ(e.target.value)} />
          <ul role="listbox" aria-label={t("settings.currency")} className="max-h-44 overflow-y-auto rounded-md border border-border">
            {filtered.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === s.currency}>
                <button type="button" onClick={() => s.update({ currency: c.code })}
                  className={cn("flex min-h-10 w-full items-center gap-3 px-3 text-left hover:bg-foreground/[0.04]", c.code === s.currency && "bg-surface")}>
                  <span className="w-10 font-mono text-xs">{c.code}</span>
                  <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                  {c.code === s.currency && <Check className="size-4 text-accent" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("settings.numberFormat")}</span>
          <Segmented className="grid w-full grid-cols-2" label={t("settings.numberFormat")} value={s.numberFormat} onChange={(numberFormat) => s.update({ numberFormat })}
            options={NUMBER_FORMATS.map((f) => ({ value: f.id, label: f.label }))} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("settings.theme")}</span>
          <Segmented className="flex w-full" label={t("settings.theme")} value={s.theme} onChange={(theme: Theme) => s.update({ theme })}
            options={(["light", "dark", "system"] as const).map((v) => ({ value: v, label: t(`settings.theme.${v}`) }))} />
        </div>
      </div>
    </Dialog>
  );
}
