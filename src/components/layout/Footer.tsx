import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { config } from "@/config";
import { useEffect, useState } from "react";
import { t } from "@/i18n";
import { formatNumber } from "@/lib/format";
import { loadVisitCount } from "@/lib/visits";

const linkCls = "inline-flex min-h-11 items-center hover:text-foreground";

export function Footer() {
  const [visits, setVisits] = useState<number | null>(null);
  useEffect(() => { void loadVisitCount().then(setVisits); }, []);
  return (
    <footer className="border-t border-border print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-6">
          <Link to="/guides/sip-vs-lumpsum" className={linkCls}>{t("footer.guide")}</Link>
          <Link to="/about" className={linkCls}>{t("footer.about")}</Link>
          <Link to="/privacy" className={linkCls}>{t("footer.privacy")}</Link>
          <Link to="/terms" className={linkCls}>{t("footer.terms")}</Link>
          <Link to="/disclaimer" className={linkCls}>{t("footer.disclaimerLink")}</Link>
          <a href={config.githubUrl} target="_blank" rel="noreferrer" className={linkCls}>{t("footer.github")}</a>
        </nav>
          <div className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-border bg-accent/10 px-4 text-foreground sm:self-auto" aria-live="polite">
            <Users className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-base font-semibold tabular-nums">{visits !== null ? formatNumber(visits) : "—"}</span>
            <span className="text-muted-foreground">{t("footer.visitsLabel")}</span>
          </div>
        </div>
        <p className="text-xs">{t("footer.disclaimer")}</p>
        <p className="text-xs">© {config.appName}</p>
      </div>
    </footer>
  );
}
