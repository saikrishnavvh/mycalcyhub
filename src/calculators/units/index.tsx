import { ArrowLeftRight, Database, Gauge, Grid2x2, Milk, Ruler, Thermometer, Weight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { Button, Field } from "@/design-system/minimal-and-sleek-69c4a4";
import { t } from "@/i18n";
import { formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Stat } from "@/components/calc/Stat";
import type { CalculatorDefinition, InputsProps, ResultsProps } from "../types";
import { UNITS, convertIn } from "./compute";

interface In { value: number; from: string; to: string }
interface Out { value: number; all: { id: string; value: number }[] }
const sel = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const u = (id: string) => t(`unitName.${id}`);

function UnitSelect({ label, value, units, onChange }: { label: string; value: string; units: string[]; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <select id={id} className={sel} value={value} onChange={(e) => onChange(e.target.value)}>
        {units.map((x) => <option key={x} value={x}>{u(x)}</option>)}
      </select>
    </Field>
  );
}

function make(kind: string, icon: LucideIcon, keywords: string[], from: string, to: string, value: number, related: string[]): CalculatorDefinition<In, Out> {
  const ids = UNITS[kind]!.map((x) => x.id);
  const unit = z.enum(ids as [string, ...string[]]);
  const schema = z.object({ value: kind === "temperature" ? z.number({ invalid_type_error: t("validation.required") }).finite() : z.number({ invalid_type_error: t("validation.required") }).finite().min(0, t("validation.min", { n: 0 })), from: unit, to: unit });
  function Inputs({ value: v, onChange, errors, ctx }: InputsProps<In>) {
    return (
      <div className="flex flex-col gap-6">
        <NumberField allowNegative={kind === "temperature"} label={t("units.value")} value={v.value} numberFormat={ctx.numberFormat} error={errors["value"]} onChange={(n) => onChange({ ...v, value: n })} />
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <UnitSelect label={t("units.from")} value={v.from} units={ids} onChange={(f) => onChange({ ...v, from: f })} />
          <Button variant="ghost" size="icon" aria-label={t("units.swap")} onClick={() => onChange({ ...v, from: v.to, to: v.from })}><ArrowLeftRight className="size-4" aria-hidden /></Button>
          <UnitSelect label={t("units.to")} value={v.to} units={ids} onChange={(x) => onChange({ ...v, to: x })} />
        </div>
      </div>
    );
  }
  function Results({ input, result, ctx }: ResultsProps<In, Out>) {
    const f = (n: number) => formatNumber(n, ctx.numberFormat, 6);
    return (
      <div className="flex flex-col gap-6">
        <Stat emphasis label={u(input.to)} value={f(result.value)} />
        <p className="text-sm text-muted-foreground">{f(input.value)} {u(input.from)} = {f(result.value)} {u(input.to)}</p>
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {result.all.map((r) => <li key={r.id} className="flex justify-between gap-4 px-4 py-2 text-sm"><span className="text-muted-foreground">{u(r.id)}</span><span className="tabular-nums">{f(r.value)}</span></li>)}
        </ul>
      </div>
    );
  }
  const id = `${kind}-converter`;
  return {
    id, slug: id, category: "converters", subcategory: t("subcategory.units"), name: t(`${id}.name`), shortDescription: t(`${id}.short`), icon, keywords,
    inputSchema: schema as unknown as z.ZodType<In>, defaults: { value, from, to },
    compute: (i) => ({ value: convertIn(kind, i.value, i.from, i.to), all: ids.filter((x) => x !== i.from).map((x) => ({ id: x, value: convertIn(kind, i.value, i.from, x) })) }),
    Inputs, Results,
    summary: (r, ctx) => ({ label: t("units.result"), value: formatNumber(r.value, ctx.numberFormat, 6) }),
    seo: { title: t(`${id}.seo.title`), description: t(`${id}.short`), explanation: t(`${id}.explanation`), faqs: [1].map((i) => ({ q: t(`${id}.faq.${i}.q`), a: t(`${id}.faq.${i}.a`) })) },
    related,
  };
}

export const unitConverters = [
  make("length", Ruler, ["length", "distance", "km", "miles", "feet", "inches", "cm"], "km", "mi", 10, ["area-converter", "speed-converter"]),
  make("weight", Weight, ["weight", "mass", "kg", "pounds", "lb", "grams", "ounces"], "kg", "lb", 70, ["volume-converter", "length-converter"]),
  make("temperature", Thermometer, ["temperature", "celsius", "fahrenheit", "kelvin"], "c", "f", 37, ["length-converter"]),
  make("volume", Milk, ["volume", "litres", "gallons", "cups", "ml"], "l", "galUs", 10, ["weight-converter"]),
  make("area", Grid2x2, ["area", "square feet", "acres", "hectares", "sq m"], "m2", "ft2", 100, ["length-converter"]),
  make("speed", Gauge, ["speed", "km/h", "mph", "knots"], "kmh", "mph", 100, ["length-converter"]),
  make("data", Database, ["data", "storage", "mb", "gb", "bytes", "file size"], "gb", "mib", 1, ["percentage"]),
];
