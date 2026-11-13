import { z } from "zod";
import { t } from "@/i18n";
import { emi, type ScheduleRow } from "../loan-emi/compute";

const num = () => z.number({ invalid_type_error: t("validation.required") });

export const loanAdvancedSchema = z.object({
  principal: num().positive(t("validation.positive")).max(1e12, t("validation.max", { max: "1e12" })),
  rate: num().min(0, t("validation.min", { min: 0 })).max(100, t("validation.max", { max: 100 })),
  tenureYears: num().positive(t("validation.positive")).max(50, t("validation.max", { max: 50 })),
  monthlyExtra: num().min(0, t("validation.min", { min: 0 })),
  yearlyExtra: num().min(0, t("validation.min", { min: 0 })),
  oneTime: num().min(0, t("validation.min", { min: 0 })),
  oneTimeMonth: num().int().min(1, t("validation.min", { min: 1 })).max(600, t("validation.max", { max: 600 })),
  mode: z.enum(["tenure", "emi"]),
});

export type LoanAdvancedInput = z.infer<typeof loanAdvancedSchema>;
export interface AdvRow extends ScheduleRow { prepayment: number; payment: number }
export interface LoanAdvancedResult {
  emi: number; months: number; totalInterest: number; totalPaid: number; totalPrepaid: number;
  baseMonths: number; baseInterest: number; baseTotalPaid: number; interestSaved: number; monthsSaved: number; lastEmi: number;
  monthly: AdvRow[]; yearly: AdvRow[];
  /** End-of-year balance if no prepayments were made. */
  baseYearlyBalance: number[];
}

export function computeLoanAdvanced(i: LoanAdvancedInput): LoanAdvancedResult {
  const n = Math.max(1, Math.round(i.tenureYears * 12));
  const r = i.rate / 12 / 100;
  const base = emi(i.principal, i.rate, n);
  const baseInterest = base * n - i.principal;
  let pay = base;
  let balance = i.principal;
  const monthly: AdvRow[] = [];
  for (let m = 1; m <= n && balance > 0.005; m++) {
    const interest = balance * r;
    let principal = Math.min(balance, pay - interest);
    balance -= principal;
    let extra = i.monthlyExtra + (m % 12 === 0 ? i.yearlyExtra : 0) + (m === i.oneTimeMonth ? i.oneTime : 0);
    extra = Math.min(balance, extra);
    balance -= extra;
    if (balance < 0.005) balance = 0;
    monthly.push({ period: m, principal, interest, prepayment: extra, payment: principal + interest + extra, balance });
    if (i.mode === "emi" && extra > 0 && balance > 0 && m < n) pay = emi(balance, i.rate, n - m);
  }
  const yearly: AdvRow[] = [];
  for (let y = 0; y * 12 < monthly.length; y++) {
    const s = monthly.slice(y * 12, y * 12 + 12);
    const sum = (k: keyof AdvRow) => s.reduce((a, x) => a + x[k], 0);
    yearly.push({ period: y + 1, principal: sum("principal"), interest: sum("interest"), prepayment: sum("prepayment"), payment: sum("payment"), balance: s[s.length - 1]!.balance });
  }
  const baseYearlyBalance: number[] = [];
  for (let y = 1; y * 12 <= n || (y - 1) * 12 < n; y++) {
    const k = Math.min(n, y * 12);
    baseYearlyBalance.push(r === 0 ? Math.max(0, i.principal - base * k) : Math.max(0, i.principal * Math.pow(1 + r, k) - base * ((Math.pow(1 + r, k) - 1) / r)));
    if (k >= n) break;
  }
  const totalInterest = monthly.reduce((a, x) => a + x.interest, 0);
  const totalPrepaid = monthly.reduce((a, x) => a + x.prepayment, 0);
  return {
    emi: base, months: monthly.length, totalInterest, totalPaid: i.principal + totalInterest, totalPrepaid,
    baseMonths: n, baseInterest, baseTotalPaid: i.principal + baseInterest, interestSaved: Math.max(0, baseInterest - totalInterest), monthsSaved: n - monthly.length,
    lastEmi: pay, monthly, yearly, baseYearlyBalance,
  };
}
