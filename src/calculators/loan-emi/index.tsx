import { useState } from "react";
import { Landmark } from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/design-system/minimal-and-sleek-69c4a4";
import { t } from "@/i18n";
import { formatCompact, formatMoney, formatNumber } from "@/lib/format";
import { NumberField } from "@/components/calc/NumberField";
import { Segmented } from "@/components/calc/Segmented";
import { Stat } from "@/components/calc/Stat";
import type { CalculatorDefinition, InputsProps, ResultsProps } from "../types";
import { computeLoanEmi, loanEmiSchema, type LoanEmiInput, type LoanEmiResult } from "./compute";

function Inputs({ value, onChange, errors, ctx }: InputsProps<LoanEmiInput>) {
  const years = value.tenureUnit === "years";
  return (
    <div className="flex flex-col gap-6">
      <NumberField
        label={t("loanEmi.principal")}
        value={value.principal}
        onChange={(principal) => onChange({ ...value, principal })}
        numberFormat={ctx.numberFormat}
        error={errors["principal"]}
        prefix={ctx.currency}
        slider={{ min: 10_000, max: 10_000_000, step: 10_000 }}
      />
      <NumberField
        label={t("loanEmi.rate")}
        value={value.rate}
        onChange={(rate) => onChange({ ...value, rate })}
        numberFormat={ctx.numberFormat}
        error={errors["rate"]}
        suffix={<span className="text-sm text-muted-foreground">%</span>}
        slider={{ min: 0, max: 30, step: 0.05 }}
      />
      <NumberField
        label={t("loanEmi.tenure")}
        value={value.tenure}
        onChange={(tenure) => onChange({ ...value, tenure })}
        numberFormat={ctx.numberFormat}
        error={errors["tenure"]}
        slider={years ? { min: 1, max: 40, step: 1 } : { min: 1, max: 480, step: 1 }}
        suffix={
          <Segmented
            label={t("loanEmi.tenure")}
            value={value.tenureUnit}
            onChange={(u) => {
              if (u === value.tenureUnit) return;
              const tenure = u === "years" ? Math.max(1, Math.round((value.tenure / 12) * 10) / 10) : Math.round(value.tenure * 12);
              onChange({ ...value, tenureUnit: u, tenure: Number.isFinite(tenure) ? tenure : 1 });
            }}
            options={[{ value: "months", label: t("unit.months") }, { value: "years", label: t("unit.years") }]}
          />
        }
      />
    </div>
  );
}

function Results({ result, ctx }: ResultsProps<LoanEmiInput, LoanEmiResult>) {
  const m = (v: number) => formatMoney(v, ctx.currency, ctx.numberFormat);
  return (
    <div className="flex flex-col gap-6">
      <Stat emphasis label={t("loanEmi.emi")} value={m(result.emi)} compact={formatCompact(result.emi, ctx.numberFormat)} />
      <div className="grid grid-cols-2 gap-6">
        <Stat label={t("loanEmi.totalInterest")} value={m(result.totalInterest)} compact={formatCompact(result.totalInterest, ctx.numberFormat)} />
        <Stat label={t("loanEmi.totalPayment")} value={m(result.totalPayment)} compact={formatCompact(result.totalPayment, ctx.numberFormat)} />
      </div>
    </div>
  );
}

function Charts({ input, result, ctx }: ResultsProps<LoanEmiInput, LoanEmiResult>) {
  const [view, setView] = useState<"monthly" | "yearly">("yearly");
  const [all, setAll] = useState(false);
  const rows = view === "monthly" ? result.monthly : result.yearly;
  const shown = all ? rows : rows.slice(0, 12);
  const m = (v: number) => formatMoney(v, ctx.currency, ctx.numberFormat, 0);
  const pie = [
    { name: t("loanEmi.principalPart"), value: input.principal, fill: "var(--color-primary)" },
    { name: t("loanEmi.interestPart"), value: Math.max(0, result.totalInterest), fill: "var(--color-accent)" },
  ];
  const line = [{ period: 0, balance: input.principal }, ...result.yearly.map((r) => ({ period: r.period, balance: r.balance }))];
  const tooltipStyle = { background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "var(--color-popover-foreground)" };

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">{t("loanEmi.breakup")}</h3>
        <div className="flex items-center gap-6">
          <div className="aspect-square w-40 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius="62%" outerRadius="100%" stroke="none" isAnimationActive={false}>
                  {pie.map((p) => <Cell key={p.name} fill={p.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number) => m(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-col gap-3 text-sm">
            {pie.map((p) => (
              <li key={p.name} className="flex items-center gap-2">
                <span aria-hidden className={p.name === pie[0]!.name ? "size-2.5 rounded-full bg-primary" : "size-2.5 rounded-full bg-accent"} />
                <span className="text-muted-foreground">{p.name}</span>
                <span className="tabular-nums">{formatNumber((p.value / result.totalPayment) * 100, ctx.numberFormat, 1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">{t("loanEmi.balance")}</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <LineChart data={line} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} stroke="var(--color-border)" />
              <YAxis width={56} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} stroke="var(--color-border)" tickFormatter={(v: number) => formatCompact(v, ctx.numberFormat) ?? formatNumber(v, ctx.numberFormat, 0)} />
              <Tooltip formatter={(v: number) => m(v)} labelFormatter={(l) => `${t("loanEmi.col.period.year")} ${l}`} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="balance" stroke="var(--color-accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

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
                <th className="px-3 py-2 text-right font-medium">{t("loanEmi.col.balance")}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.period} className="border-t border-border">
                  <td className="px-3 py-2">{r.period}</td>
                  <td className="px-3 py-2 text-right">{m(r.principal)}</td>
                  <td className="px-3 py-2 text-right">{m(r.interest)}</td>
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
      </section>
    </div>
  );
}

export const loanEmi: CalculatorDefinition<LoanEmiInput, LoanEmiResult> = {
  id: "loan-emi",
  slug: "loan-emi",
  category: "finance",
  subcategory: t("loanEmi.subcategory"),
  name: t("loanEmi.name"),
  shortDescription: t("loanEmi.short"),
  icon: Landmark,
  keywords: ["emi", "loan", "mortgage", "home loan", "car loan", "amortization", "interest", "monthly payment"],
  inputSchema: loanEmiSchema,
  defaults: { principal: 1_000_000, rate: 8.5, tenure: 20, tenureUnit: "years" },
  compute: (input) => computeLoanEmi(input),
  Inputs,
  Results,
  Charts,
  summary: (r, ctx) => ({ label: t("loanEmi.emi"), value: formatMoney(r.emi, ctx.currency, ctx.numberFormat) }),
  seo: {
    title: t("loanEmi.seo.title"),
    description: t("loanEmi.seo.description"),
    explanation: t("loanEmi.explanation"),
    faqs: [1, 2, 3].map((i) => ({ q: t(`loanEmi.faq.${i}.q`), a: t(`loanEmi.faq.${i}.a`) })),
  },
  related: ["percentage"],
  exportRows: (_input, r) => [
    [t("loanEmi.col.period.month"), t("loanEmi.col.principal"), t("loanEmi.col.interest"), t("loanEmi.col.balance")],
    ...r.monthly.map((x) => [x.period, x.principal.toFixed(2), x.interest.toFixed(2), x.balance.toFixed(2)]),
  ],
};
