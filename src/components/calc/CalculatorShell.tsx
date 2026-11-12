import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronUp, Download, ImageIcon, Link2, Printer, RotateCcw } from "lucide-react";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "@/design-system/minimal-and-sleek-69c4a4";
import type { CalculatorDefinition, FieldErrors } from "@/calculators/types";
import { getById, getCategory } from "@/calculators/registry";
import { t } from "@/i18n";
import { useSettings } from "@/lib/settings";
import { pushRecent } from "@/lib/storage";
import { AdSlot } from "./AdSlot";
import { CalculatorCard } from "./CalculatorCard";

export function CalculatorShell({ calc }: { calc: CalculatorDefinition }) {
  const { currency, numberFormat } = useSettings();
  const ctx = useMemo(() => ({ currency, numberFormat }), [currency, numberFormat]);
  const [input, setInput] = useState(calc.defaults);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgState, setImgState] = useState<"idle" | "busy" | "copied" | "saved">("idle");
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastGood = useRef<{ input: unknown; result: unknown } | null>(null);

  useEffect(() => { pushRecent(calc.id); }, [calc.id]);
  useEffect(() => { setInput(calc.defaults); lastGood.current = null; }, [calc]);

  const parsed = calc.inputSchema.safeParse(input);
  const errors: FieldErrors = {};
  if (!parsed.success) for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;

  // Keep showing the last valid result while the user is mid-edit, so results never go blank.
  let shown = lastGood.current;
  if (parsed.success) {
    shown = { input: parsed.data, result: calc.compute(parsed.data, ctx) };
    lastGood.current = shown;
  }
  if (!shown) shown = { input: calc.defaults, result: calc.compute(calc.defaults, ctx) };

  const { Inputs, Results, Charts } = calc;
  const summary = calc.summary(shown.result, ctx);
  const category = getCategory(calc.category)!;
  const related = calc.related.map(getById).filter((c): c is CalculatorDefinition => !!c);

  const exportCsv = () => {
    const rows = calc.exportRows?.(shown!.input, shown!.result);
    if (!rows) return;
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${calc.slug}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const copyImage = () => {
    const node = resultsRef.current;
    if (!node) return;
    setImgState("busy");
    const bg = getComputedStyle(document.body).backgroundColor;
    const blobP = import("html-to-image").then(({ toBlob }) =>
      toBlob(node, { pixelRatio: 2, backgroundColor: bg, skipFonts: true, filter: (n) => !(n instanceof HTMLElement && n.hasAttribute("data-no-capture")) }),
    ).then((blob) => { if (!blob) throw new Error("no image"); return blob; });
    const done = (s: "copied" | "saved" | "idle") => { setImgState(s); if (s !== "idle") setTimeout(() => setImgState("idle"), 1800); };
    const download = async () => {
      try {
        const url = URL.createObjectURL(await blobP);
        Object.assign(document.createElement("a"), { href: url, download: `${calc.slug}.png` }).click();
        URL.revokeObjectURL(url);
        done("saved");
      } catch { done("idle"); }
    };
    // ClipboardItem must be created synchronously within the click (Safari); fall back to download if the browser refuses or stalls.
    try {
      const write = navigator.clipboard.write([new ClipboardItem({ "image/png": blobP })]);
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000));
      Promise.race([write, timeout]).then(() => done("copied"), download);
    } catch { void download(); }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-32 pt-8 sm:px-6 lg:pb-12">
      <header className="flex flex-col gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("nav.home")}</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link to="/$category" params={{ category: calc.category }} className="hover:text-foreground">{category.name}</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-foreground" aria-current="page">{calc.name}</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{calc.name}</h1>
        <p className="max-w-2xl text-muted-foreground">{calc.shortDescription}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <Card padding="lg">
          <CardHeader className="mb-6 flex-row items-center justify-between">
            <CardTitle>{t("shell.inputs")}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setInput(calc.defaults)}>
              <RotateCcw className="size-4" aria-hidden /> {t("shell.reset")}
            </Button>
          </CardHeader>
          <Inputs value={input} onChange={setInput} errors={errors} ctx={ctx} />
        </Card>

        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <Card ref={resultsRef} variant="soft" padding="lg">
            <CardHeader className="mb-6"><CardTitle>{t("shell.results")}</CardTitle><CardDescription>{calc.name} · {category.name}</CardDescription></CardHeader>
            <div aria-live="polite" aria-atomic="true">
              <Results input={shown.input} result={shown.result} ctx={ctx} />
            </div>
            <p className="mt-6 text-xs text-muted-foreground">My Calcy Hub · {calc.name}</p>
            <div data-no-capture className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 print:hidden">
              <Button variant="secondary" size="sm" onClick={copyImage} loading={imgState === "busy"}><ImageIcon className="size-4" aria-hidden />{imgState === "copied" ? t("shell.imageCopied") : imgState === "saved" ? t("shell.imageSaved") : t("shell.copyImage")}</Button>
              {calc.exportRows && <Button variant="secondary" size="sm" onClick={exportCsv}><Download className="size-4" aria-hidden />{t("shell.exportCsv")}</Button>}
              <Button variant="ghost" size="sm" onClick={() => window.print()}><Printer className="size-4" aria-hidden />{t("shell.print")}</Button>
              <Button variant="ghost" size="sm" onClick={copyLink}><Link2 className="size-4" aria-hidden />{copied ? t("shell.copied") : t("shell.copyLink")}</Button>
            </div>
          </Card>
          {Charts && <Card padding="lg"><Charts input={shown.input} result={shown.result} ctx={ctx} /></Card>}
        </div>
      </div>

      <AdSlot />

      <section className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{t("shell.how")}</h2>
        <p className="leading-relaxed text-muted-foreground">{calc.seo.explanation}</p>
      </section>

      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("shell.faq")}</h2>
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {calc.seo.faqs.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
              </summary>
              <p className="pt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{t("shell.related")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((c) => <CalculatorCard key={c.id} calc={c} />)}</div>
        </section>
      )}

      {/* Mobile: sticky compact result that expands */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-popover shadow-float lg:hidden print:hidden">
        {expanded && (
          <div className="max-h-[60vh] overflow-y-auto px-4 pt-4">
            <Results input={shown.input} result={shown.result} ctx={ctx} />
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <span className="flex flex-col">
            <span className="text-xs text-muted-foreground">{summary.label}</span>
            <span className="text-lg font-semibold tabular-nums text-accent">{summary.value}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {expanded ? t("shell.hideDetails") : t("shell.showDetails")}
            <ChevronUp className={expanded ? "size-4 rotate-180 transition-transform" : "size-4 transition-transform"} aria-hidden />
          </span>
        </button>
      </div>
    </div>
  );
}
