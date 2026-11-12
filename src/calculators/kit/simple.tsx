import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { t } from "@/i18n";
import { currencySymbol, formatCompact, formatMoney, formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Stat } from "@/components/calc/Stat";
import type { CalcContext, CalculatorDefinition, CategoryId, InputsProps, ResultsProps } from "../types";

export type Kind = "money" | "percent" | "years" | "number";
export interface FieldSpec { key: string; kind: Kind; min?: number; positive?: boolean; max?: number; slider?: { min: number; max: number; step: number } }
export interface OutputSpec { key: string; kind: Kind }
type Vals = Record<string, number>;

export function fmtKind(v: number, kind: Kind, ctx: CalcContext) {
  if (kind === "money") return formatMoney(v, ctx.currency, ctx.numberFormat);
  if (kind === "percent") return `${formatNumber(v, ctx.numberFormat, 2)}%`;
  return formatNumber(v, ctx.numberFormat, 2);
}

export function schemaFor(fields: FieldSpec[]) {
  const shape: Record<string, z.ZodNumber> = {};
  for (const f of fields) {
    let s = z.number({ invalid_type_error: t("validation.required") }).finite();
    if (f.positive) s = s.gt(0, t("validation.positive"));
    else s = s.min(f.min ?? 0, t("validation.min", { n: f.min ?? 0 }));
    if (f.max !== undefined) s = s.max(f.max, t("validation.max", { n: f.max }));
    shape[f.key] = s;
  }
  return z.object(shape) as unknown as z.ZodType<Vals>;
}

interface Spec {
  id: string; category: CategoryId; subcategory: string; icon: LucideIcon; keywords: string[];
  fields: FieldSpec[]; defaults: Vals; compute: (v: Vals) => Vals; outputs: OutputSpec[]; related: string[];
}

/** Builds a calculator from a list of number fields and outputs. Text comes from `<id>.*` and `field.*` keys. */
export function simpleCalculator(spec: Spec): CalculatorDefinition<Vals, Vals> {
  const label = (k: string) => t(`field.${k}`);
  function Inputs({ value, onChange, errors, ctx }: InputsProps<Vals>) {
    return (
      <div className="flex flex-col gap-6">
        {spec.fields.map((f) => (
          <NumberField key={f.key} label={label(f.key)} value={value[f.key] ?? NaN} numberFormat={ctx.numberFormat} error={errors[f.key]}
            onChange={(n) => onChange({ ...value, [f.key]: n })} slider={f.slider}
            prefix={f.kind === "money" ? currencySymbol(ctx.currency, ctx.numberFormat) : undefined}
            suffix={f.kind === "percent" ? <span className="text-sm text-muted-foreground">%</span> : f.kind === "years" ? <span className="text-sm text-muted-foreground">{t("unit.years")}</span> : undefined} />
        ))}
      </div>
    );
  }
  function Results({ result, ctx }: ResultsProps<Vals, Vals>) {
    const [first, ...rest] = spec.outputs;
    return (
      <div className="flex flex-col gap-6">
        <Stat emphasis label={label(first!.key)} value={fmtKind(result[first!.key]!, first!.kind, ctx)} compact={first!.kind === "money" ? formatCompact(result[first!.key]!, ctx.numberFormat) : null} />
        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((o) => <Stat key={o.key} label={label(o.key)} value={fmtKind(result[o.key]!, o.kind, ctx)} />)}
          </div>
        )}
      </div>
    );
  }
  const first = spec.outputs[0]!;
  return {
    id: spec.id, slug: spec.id, category: spec.category, subcategory: spec.subcategory,
    name: t(`${spec.id}.name`), shortDescription: t(`${spec.id}.short`), icon: spec.icon, keywords: spec.keywords,
    inputSchema: schemaFor(spec.fields), defaults: spec.defaults, compute: (v) => spec.compute(v), Inputs, Results,
    summary: (r, ctx) => ({ label: label(first.key), value: fmtKind(r[first.key]!, first.kind, ctx) }),
    seo: {
      title: t(`${spec.id}.seo.title`), description: t(`${spec.id}.short`), explanation: t(`${spec.id}.explanation`),
      faqs: [1, 2].map((i) => ({ q: t(`${spec.id}.faq.${i}.q`), a: t(`${spec.id}.faq.${i}.a`) })),
    },
    related: spec.related,
    exportRows: (input, result) => [
      [t("export.item"), t("export.value")],
      ...spec.fields.map((f) => [label(f.key), input[f.key] ?? ""]),
      ...spec.outputs.map((o) => [label(o.key), Math.round((result[o.key] ?? 0) * 100) / 100]),
    ],
  };
}
