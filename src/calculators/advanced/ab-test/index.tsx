import { FlaskConical } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { t } from "@/i18n";
import { formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Segmented } from "@/components/calc/Segmented";
import { Stat } from "@/components/calc/Stat";
import type { CalculatorDefinition, InputsProps, ResultsProps } from "../../types";
import { abSchema, computeAb, type AbInput, type AbResult } from "./compute";

function Inputs({ value, onChange, errors, ctx }: InputsProps<AbInput>) {
  const set = <F extends keyof AbInput>(k: F) => (v: AbInput[F]) => onChange({ ...value, [k]: v });
  const f = (k: "visitorsA" | "conversionsA" | "visitorsB" | "conversionsB") => (
    <NumberField label={t(`ab.${k}`)} value={value[k]} onChange={set(k)} numberFormat={ctx.numberFormat} error={errors[k]} />
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">{f("visitorsA")}{f("conversionsA")}</div>
      <div className="grid grid-cols-2 gap-4">{f("visitorsB")}{f("conversionsB")}</div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("ab.confidence")}</span>
        <Segmented label={t("ab.confidence")} value={value.confidence} onChange={set("confidence")}
          options={(["90", "95", "99"] as const).map((c) => ({ value: c, label: `${c}%` }))} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("ab.sides")}</span>
        <Segmented label={t("ab.sides")} value={value.sides} onChange={set("sides")}
          options={[{ value: "2", label: t("ab.sides.2") }, { value: "1", label: t("ab.sides.1") }]} />
      </div>
    </div>
  );
}

/** Tiny p-values would round to "0"; show them as "< 0.0001" instead. */
const pValue = (p: number, fmt: Parameters<typeof formatNumber>[1]) => (p < 0.0001 ? `< ${formatNumber(0.0001, fmt, 4)}` : formatNumber(p, fmt, 4));
const pct = (v: number, fmt: Parameters<typeof formatNumber>[1]) => `${formatNumber(v * 100, fmt, 2)}%`;

function Results({ input, result, ctx }: ResultsProps<AbInput, AbResult>) {
  const fmt = ctx.numberFormat;
  return (
    <div className="flex flex-col gap-6">
      <Stat emphasis label={t("ab.p")} value={pValue(result.p, fmt)} />
      <p className="text-sm font-medium">{t(`ab.verdict.${result.verdict}`, { c: input.confidence })}</p>
      <div className="grid grid-cols-2 gap-6">
        <Stat label={t("ab.rateA")} value={pct(result.rateA, fmt)} />
        <Stat label={t("ab.rateB")} value={pct(result.rateB, fmt)} />
        <Stat label={t("ab.uplift")} value={`${result.uplift > 0 ? "+" : ""}${pct(result.uplift, fmt)}`} />
        <Stat label={t("ab.z")} value={formatNumber(result.z, fmt, 3)} />
      </div>
    </div>
  );
}

function Charts({ input, result, ctx }: ResultsProps<AbInput, AbResult>) {
  const data = [
    { name: "A", rate: result.rateA * 100, err: result.seA * result.zCrit * 100 },
    { name: "B", rate: result.rateB * 100, err: result.seB * result.zCrit * 100 },
  ];
  const tick = { fill: "var(--color-muted-foreground)", fontSize: 12 };
  const tooltipStyle = { background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "var(--color-popover-foreground)" };
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">{t("ab.chart", { c: input.confidence })}</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" tick={tick} stroke="var(--color-border)" />
            <YAxis width={48} tick={tick} stroke="var(--color-border)" tickFormatter={(v: number) => `${formatNumber(v, ctx.numberFormat, 1)}%`} />
            <Tooltip formatter={(v: number) => `${formatNumber(v, ctx.numberFormat, 2)}%`} contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface)" }} />
            <Bar dataKey="rate" fill="var(--color-accent)" isAnimationActive={false} radius={[4, 4, 0, 0]}>
              <ErrorBar dataKey="err" width={12} stroke="var(--color-foreground)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export const abTest: CalculatorDefinition<AbInput, AbResult> = {
  id: "ab-test",
  slug: "ab-test",
  category: "advanced",
  subcategory: t("ab.subcategory"),
  name: t("ab.name"),
  shortDescription: t("ab.short"),
  icon: FlaskConical,
  keywords: ["ab test", "a/b", "split test", "significance", "p-value", "conversion", "statistics", "z-test"],
  inputSchema: abSchema,
  defaults: { visitorsA: 1000, conversionsA: 100, visitorsB: 1000, conversionsB: 130, confidence: "95", sides: "2" },
  compute: (input) => computeAb(input),
  Inputs,
  Results,
  Charts,
  summary: (r, ctx) => ({ label: t("ab.p"), value: pValue(r.p, ctx.numberFormat) }),
  seo: {
    title: t("ab.seo.title"),
    description: t("ab.seo.description"),
    explanation: t("ab.explanation"),
    faqs: [1, 2].map((i) => ({ q: t(`ab.faq.${i}.q`), a: t(`ab.faq.${i}.a`) })),
  },
  related: ["percentage"],
};
