import { CalendarDays, CalendarPlus, Cake } from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { Field, Input } from "@/design-system/minimal-and-sleek-69c4a4";
import { t } from "@/i18n";
import { formatDate, formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Stat } from "@/components/calc/Stat";
import type { CalculatorDefinition, FieldErrors } from "../types";
import { addDays, age, dateDiff, parse, toIso } from "./compute";

const today = toIso(new Date());
const isoDate = z.string().refine((s) => !!parse(s), t("validation.date"));
const sub = t("subcategory.dates");
const faqs = (id: string) => [1].map((i) => ({ q: t(`${id}.faq.${i}.q`), a: t(`${id}.faq.${i}.a`) }));
const seo = (id: string) => ({ title: t(`${id}.seo.title`), description: t(`${id}.short`), explanation: t(`${id}.explanation`), faqs: faqs(id) });

function DateField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string | undefined }) {
  const id = useId();
  return <Field label={label} htmlFor={id} error={error}><Input id={id} type="date" size="lg" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} /></Field>;
}
const ymdText = (r: { years: number; months: number; days: number }) => t("dates.ymd", { y: r.years, m: r.months, d: r.days });
type E = { errors: FieldErrors };

type AgeIn = { birth: string; asOf: string };
const ageSchema = z.object({ birth: isoDate, asOf: isoDate }).refine((v) => v.birth <= v.asOf, { path: ["birth"], message: t("validation.dateOrder") });
export const ageCalc: CalculatorDefinition<AgeIn, ReturnType<typeof age>> = {
  id: "age", slug: "age", category: "converters", subcategory: sub, name: t("age.name"), shortDescription: t("age.short"), icon: Cake,
  keywords: ["age", "birthday", "how old", "date of birth"], inputSchema: ageSchema, defaults: { birth: "1995-06-15", asOf: today },
  compute: (i) => age(i.birth, i.asOf),
  Inputs: ({ value, onChange, errors }: { value: AgeIn; onChange: (v: AgeIn) => void } & E) => (
    <div className="flex flex-col gap-6">
      <DateField label={t("field.birth")} value={value.birth} error={errors["birth"]} onChange={(birth) => onChange({ ...value, birth })} />
      <DateField label={t("field.asOf")} value={value.asOf} error={errors["asOf"]} onChange={(asOf) => onChange({ ...value, asOf })} />
    </div>
  ),
  Results: ({ result, ctx }) => (
    <div className="flex flex-col gap-6">
      <Stat emphasis label={t("age.result")} value={ymdText(result)} />
      <div className="grid gap-6 sm:grid-cols-3">
        <Stat label={t("dates.totalDays")} value={formatNumber(result.totalDays, ctx.numberFormat, 0)} />
        <Stat label={t("dates.totalWeeks")} value={formatNumber(result.totalWeeks, ctx.numberFormat, 0)} />
        <Stat label={t("age.nextBirthday")} value={t("dates.inDays", { n: result.daysToBirthday })} />
      </div>
    </div>
  ),
  summary: (r) => ({ label: t("age.result"), value: ymdText(r) }), seo: seo("age"), related: ["date-difference", "add-days"],
};

type DiffIn = { start: string; end: string };
export const dateDiffCalc: CalculatorDefinition<DiffIn, ReturnType<typeof dateDiff>> = {
  id: "date-difference", slug: "date-difference", category: "converters", subcategory: sub, name: t("date-difference.name"), shortDescription: t("date-difference.short"), icon: CalendarDays,
  keywords: ["days between", "date difference", "duration", "working days", "weekdays"], inputSchema: z.object({ start: isoDate, end: isoDate }), defaults: { start: today, end: toIso(new Date(Date.now() + 90 * 86_400_000)) },
  compute: (i) => dateDiff(i.start, i.end),
  Inputs: ({ value, onChange, errors }: { value: DiffIn; onChange: (v: DiffIn) => void } & E) => (
    <div className="flex flex-col gap-6">
      <DateField label={t("field.start")} value={value.start} error={errors["start"]} onChange={(start) => onChange({ ...value, start })} />
      <DateField label={t("field.end")} value={value.end} error={errors["end"]} onChange={(end) => onChange({ ...value, end })} />
    </div>
  ),
  Results: ({ result, ctx }) => (
    <div className="flex flex-col gap-6">
      <Stat emphasis label={t("dates.totalDays")} value={formatNumber(result.totalDays, ctx.numberFormat, 0)} />
      <div className="grid gap-6 sm:grid-cols-3">
        <Stat label={t("dates.breakdown")} value={ymdText(result)} />
        <Stat label={t("dates.weeks")} value={formatNumber(result.weeks, ctx.numberFormat, 0)} />
        <Stat label={t("dates.weekdays")} value={formatNumber(result.weekdays, ctx.numberFormat, 0)} />
      </div>
    </div>
  ),
  summary: (r, ctx) => ({ label: t("dates.totalDays"), value: formatNumber(r.totalDays, ctx.numberFormat, 0) }), seo: seo("date-difference"), related: ["add-days", "age"],
};

type AddIn = { start: string; days: number };
export const addDaysCalc: CalculatorDefinition<AddIn, ReturnType<typeof addDays>> = {
  id: "add-days", slug: "add-days", category: "converters", subcategory: sub, name: t("add-days.name"), shortDescription: t("add-days.short"), icon: CalendarPlus,
  keywords: ["add days", "subtract days", "deadline", "due date", "future date"],
  inputSchema: z.object({ start: isoDate, days: z.number({ invalid_type_error: t("validation.required") }).finite().int(t("validation.whole")) }), defaults: { start: today, days: 30 },
  compute: (i) => addDays(i.start, i.days),
  Inputs: ({ value, onChange, errors, ctx }) => (
    <div className="flex flex-col gap-6">
      <DateField label={t("field.start")} value={value.start} error={errors["start"]} onChange={(start) => onChange({ ...value, start })} />
      <NumberField allowNegative label={t("field.days")} hint={t("add-days.hint")} value={value.days} numberFormat={ctx.numberFormat} error={errors["days"]} onChange={(days) => onChange({ ...value, days })} />
    </div>
  ),
  Results: ({ result, ctx }) => <Stat emphasis label={t("add-days.result")} value={formatDate(result.date, ctx.numberFormat)} />,
  summary: (r, ctx) => ({ label: t("add-days.result"), value: formatDate(r.date, ctx.numberFormat) }), seo: seo("add-days"), related: ["date-difference", "age"],
};

export const dateTools = [ageCalc, dateDiffCalc, addDaysCalc];
