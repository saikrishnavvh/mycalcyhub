import { Percent } from "lucide-react";
import { t } from "@/i18n";
import { formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Segmented } from "@/components/calc/Segmented";
import { Stat } from "@/components/calc/Stat";
import type { CalculatorDefinition, InputsProps, ResultsProps } from "../types";
import { computePercentage, percentageSchema, type PercentageInput, type PercentageResult } from "./compute";

const MODES = ["of", "whatPercent", "change"] as const;

function Inputs({ value, onChange, errors, ctx }: InputsProps<PercentageInput>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t("percentage.mode")}</span>
        <Segmented className="flex w-full flex-wrap" label={t("percentage.mode")} value={value.mode} onChange={(mode) => onChange({ ...value, mode })}
          options={MODES.map((m) => ({ value: m, label: t(`percentage.mode.${m}`) }))} />
      </div>
      <NumberField allowNegative label={t(`percentage.x.${value.mode}`)} value={value.x} onChange={(x) => onChange({ ...value, x })} numberFormat={ctx.numberFormat} error={errors["x"]}
        suffix={value.mode === "of" ? <span className="text-sm text-muted-foreground">%</span> : undefined} />
      <NumberField allowNegative label={t(`percentage.y.${value.mode}`)} value={value.y} onChange={(y) => onChange({ ...value, y })} numberFormat={ctx.numberFormat} error={errors["y"]} />
    </div>
  );
}

function display(r: PercentageResult, fmt: Parameters<typeof formatNumber>[1]) {
  return r.mode === "of" ? formatNumber(r.value, fmt, 4) : `${formatNumber(r.value, fmt, 2)}%`;
}

function Results({ input, result, ctx }: ResultsProps<PercentageInput, PercentageResult>) {
  const f = (n: number) => formatNumber(n, ctx.numberFormat, 4);
  const r = formatNumber(Math.abs(result.value), ctx.numberFormat, result.mode === "of" ? 4 : 2);
  const key = result.mode !== "change" ? `percentage.explain.${result.mode}` : result.value > 0 ? "percentage.explain.change.up" : result.value < 0 ? "percentage.explain.change.down" : "percentage.explain.change.none";
  return (
    <div className="flex flex-col gap-4">
      <Stat emphasis label={t("percentage.result")} value={display(result, ctx.numberFormat)} />
      <p className="text-sm text-muted-foreground">{t(key, { x: f(input.x), y: f(input.y), r })}</p>
    </div>
  );
}

export const percentage: CalculatorDefinition<PercentageInput, PercentageResult> = {
  id: "percentage",
  slug: "percentage",
  category: "converters",
  subcategory: t("percentage.subcategory"),
  name: t("percentage.name"),
  shortDescription: t("percentage.short"),
  icon: Percent,
  keywords: ["percent", "percentage", "discount", "change", "increase", "decrease", "ratio", "%"],
  inputSchema: percentageSchema,
  defaults: { mode: "of", x: 20, y: 150 },
  compute: (input) => computePercentage(input),
  Inputs,
  Results,
  summary: (r, ctx) => ({ label: t("percentage.result"), value: display(r, ctx.numberFormat) }),
  seo: {
    title: t("percentage.seo.title"),
    description: t("percentage.seo.description"),
    explanation: t("percentage.explanation"),
    faqs: [1, 2].map((i) => ({ q: t(`percentage.faq.${i}.q`), a: t(`percentage.faq.${i}.a`) })),
  },
  related: ["loan-emi"],
};
