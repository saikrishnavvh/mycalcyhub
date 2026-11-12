import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/design-system/minimal-and-sleek-69c4a4";
import { t } from "@/i18n";
import { formatCompact, formatMoney, currencySymbol, formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Segmented } from "@/components/calc/Segmented";
import { Stat } from "@/components/calc/Stat";
import type { CalculatorDefinition, InputsProps, ResultsProps } from "../types";
import { computeLoanAdvanced, loanAdvancedSchema, type LoanAdvancedInput, type LoanAdvancedResult } from "./compute";

const K = "loanAdv";

function Inputs({ value, onChange, errors, ctx }: InputsProps<LoanAdvancedInput>) {
  const cur = currencySymbol(ctx.currency, ctx.numberFormat);
  const set = <F extends keyof LoanAdvancedInput>(k: F) => (v: LoanAdvancedInput[F]) => onChange({ ...value, [k]: v });
  const pct = <span className="text-sm text-muted-foreground">%</span>;
  return (
    <div className="flex flex-col gap-6">
      <NumberField label={t("loanEmi.principal")} value={value.principal} onChange={set("principal")} numberFormat={ctx.numberFormat} error={errors["principal"]} prefix={cur} slider={{ min: 10_000, max: 10_000_000, step: 10_000 }} />
      <NumberField label={t("loanEmi.rate")} value={value.rate} onChange={set("rate")} numberFormat={ctx.numberFormat} error={errors["rate"]} suffix={pct} slider={{ min: 0, max: 30, step: 0.05 }} />
      <NumberField label={t(`${K}.tenure`)} value={value.tenureYears} onChange={set("tenureYears")} numberFormat={ctx.numberFormat} error={errors["tenureYears"]} slider={{ min: 1, max: 40, step: 1 }} />
      <h3 className="pt-2 text-sm font-medium">{t(`${K}.prepayments`)}</h3>
      <NumberField label={t(`${K}.monthlyExtra`)} hint={t(`${K}.monthlyExtra.hint`)} value={value.monthlyExtra} onChange={set("monthlyExtra")} numberFormat={ctx.numberFormat} error={errors["monthlyExtra"]} prefix={cur} />
      <NumberField label={t(`${K}.yearlyExtra`)} hint={t(`${K}.yearlyExtra.hint`)} value={value.yearlyExtra} onChange={set("yearlyExtra")} numberFormat={ctx.numberFormat} error={errors["yearlyExtra"]} prefix={cur} />
      <NumberField label={t(`${K}.oneTime`)} value={value.oneTime} onChange={set("oneTime")} numberFormat={ctx.numberFormat} error={errors["oneTime"]} prefix={cur} />
      <NumberField label={t(`${K}.oneTimeMonth`)} value={value.oneTimeMonth} onChange={set("oneTimeMonth")} numberFormat={ctx.numberFormat} error={errors["oneTimeMonth"]} />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(`${K}.mode`)}</span>
        <Segmented label={t(`${K}.mode`)} value={value.mode} onChange={set("mode")}
          options={[{ value: "tenure", label: t(`${K}.mode.tenure`) }, { value: "emi", label: t(`${K}.mode.emi`) }]} />
      </div>
    </div>
  );
}

const years = (m: number) => `${Math.floor(m / 12)} ${t("unit.years")} ${m % 12} ${t("unit.months")}`;

function Results({ result, input, ctx }: ResultsProps<LoanAdvancedInput, LoanAdvancedResult>) {
  const m = (v: number) => formatMoney(v, ctx.currency, ctx.numberFormat);
  const c = (v: number) => formatCompact(v, ctx.numberFormat);
  return (
    <div className="flex flex-col gap-6">
      <Stat emphasis label={t("loanEmi.emi")} value={m(result.emi)} compact={c(result.emi)} />
      <div className="grid grid-cols-2 gap-6">
        <Stat label={t(`${K}.interestSaved`)} value={m(result.interestSaved)} compact={c(result.interestSaved)} />
        <Stat label={t(`${K}.newTenure`)} value={years(result.months)} />
        <Stat label={t("loanEmi.totalInterest")} value={m(result.totalInterest)} compact={c(result.totalInterest)} />
        <Stat label={t(`${K}.totalPrepaid`)} value={m(result.totalPrepaid)} compact={c(result.totalPrepaid)} />
        {input.mode === "emi" ? (
          <Stat label={t(`${K}.lastEmi`)} value={m(result.lastEmi)} compact={c(result.lastEmi)} />
        ) : (
          <Stat label={t(`${K}.monthsSaved`)} value={years(result.monthsSaved)} />
        )}
        <Stat label={t(`${K}.baseInterest`)} value={m(result.baseInterest)} compact={c(result.baseInterest)} />
      </div>
    </div>
  );
}

function Charts({ result, ctx }: ResultsProps<LoanAdvancedInput, LoanAdvancedResult>) {
  const [view, setView] = useState<"monthly" | "yearly">("yearly");
  const [all, setAll] = useState(false);
  const rows = view === "monthly" ? result.monthly : result.yearly;
  const shown = all ? rows : rows.slice(0, 12);
  const m = (v: number) => formatMoney(v, ctx.currency, ctx.numberFormat, 0);
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium">{t("loanEmi.schedule")}</h3>
        <Segmented label={t("loanEmi.schedule")} value={view} onChange={(v) => { setView(v); setAll(false); }}
          options={[{ value: "monthly", label: t("loanEmi.monthly") }, { value: "yearly", label: t("loanEmi.yearly") }]} />
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-surface text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{t(view === "monthly" ? "loanEmi.col.period.month" : "loanEmi.col.period.year")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("loanEmi.col.principal")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("loanEmi.col.interest")}</th>
              <th className="px-3 py-2 text-right font-medium">{t(`${K}.col.prepayment`)}</th>
              <th className="px-3 py-2 text-right font-medium">{t("loanEmi.col.balance")}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.period} className="border-t border-border">
                <td className="px-3 py-2">{r.period}</td>
                <td className="px-3 py-2 text-right">{m(r.principal)}</td>
                <td className="px-3 py-2 text-right">{m(r.interest)}</td>
                <td className={r.prepayment > 0 ? "px-3 py-2 text-right font-medium" : "px-3 py-2 text-right text-muted-foreground"}>{r.prepayment > 0 ? m(r.prepayment) : "—"}</td>
                <td className="px-3 py-2 text-right">{m(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 12 && (
        <Button variant="ghost" onClick={() => setAll((a) => !a)} className="self-start">
          {all ? t("loanEmi.showLess") : t("loanEmi.showAll", { n: rows.length })}
        </Button>
      )}
      <p className="text-xs text-muted-foreground">{t(`${K}.note`, { n: formatNumber(result.baseMonths, ctx.numberFormat, 0) })}</p>
    </section>
  );
}

export const loanAdvanced: CalculatorDefinition<LoanAdvancedInput, LoanAdvancedResult> = {
  id: "loan-emi-advanced",
  slug: "advanced-loan-emi",
  category: "finance",
  subcategory: t("loanEmi.subcategory"),
  name: t(`${K}.name`),
  shortDescription: t(`${K}.short`),
  icon: Calculator,
  keywords: ["emi", "loan", "prepayment", "part payment", "foreclosure", "amortization", "amortisation", "home loan", "advanced"],
  inputSchema: loanAdvancedSchema,
  defaults: { principal: 1_000_000, rate: 8.5, tenureYears: 20, monthlyExtra: 0, yearlyExtra: 50_000, oneTime: 0, oneTimeMonth: 12, mode: "tenure" },
  compute: (input) => computeLoanAdvanced(input),
  Inputs,
  Results,
  Charts,
  summary: (r, ctx) => ({ label: t(`${K}.interestSaved`), value: formatMoney(r.interestSaved, ctx.currency, ctx.numberFormat) }),
  seo: {
    title: t(`${K}.seo.title`),
    description: t(`${K}.seo.description`),
    explanation: t(`${K}.explanation`),
    faqs: [1, 2].map((i) => ({ q: t(`${K}.faq.${i}.q`), a: t(`${K}.faq.${i}.a`) })),
  },
  related: ["loan-emi"],
  exportRows: (_i, r) => [
    [t("loanEmi.col.period.month"), t("loanEmi.col.principal"), t("loanEmi.col.interest"), t(`${K}.col.prepayment`), t("loanEmi.col.balance")],
    ...r.monthly.map((x) => [x.period, x.principal.toFixed(2), x.interest.toFixed(2), x.prepayment.toFixed(2), x.balance.toFixed(2)]),
  ],
};
