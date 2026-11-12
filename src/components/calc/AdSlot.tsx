import { config } from "@/config";
import { t } from "@/i18n";

/** Reserved ad space. Renders nothing unless ads are enabled in config. */
export function AdSlot() {
  if (!config.adsEnabled) return null;
  return (
    <aside aria-label={t("shell.ad")} className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground" data-ad-client={config.adsenseId}>
      {t("shell.ad")}
    </aside>
  );
}
