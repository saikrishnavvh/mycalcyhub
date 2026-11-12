import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calculator, Search } from "lucide-react";
import { config } from "@/config";
import { t } from "@/i18n";
import { CommandPalette } from "./CommandPalette";
import { HeaderSettings } from "./HeaderSettings";

export function Header() {
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); }
    };
    const onOpen = () => setPalette(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("calchub:open-search", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("calchub:open-search", onOpen); };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Calculator className="size-4" aria-hidden /></span>
          <span className="hidden sm:inline">{config.appName}</span>
        </Link>
        <button type="button" onClick={() => setPalette(true)}
          className="ml-auto flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm">
          <Search className="size-4" aria-hidden />
          <span className="flex-1 truncate text-left">{t("nav.search")}</span>
          <kbd className="hidden rounded-sm border border-border px-1.5 font-mono text-xs sm:inline">⌘K</kbd>
        </button>
        <HeaderSettings />
      </div>
      <CommandPalette open={palette} onOpenChange={setPalette} />
    </header>
  );
}
