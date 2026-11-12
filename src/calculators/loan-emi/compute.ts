import { z } from "zod";
import { t } from "@/i18n";

export const loanEmiSchema = z.object({
  principal: z.number({ invalid_type_error: t("validation.required") }).positive(t("validation.positive")).max(1e12, t("validation.max", { max: "1e12" })),
  rate: z.number({ invalid_type_error: t("validation.required") }).min(0, t("validation.min", { min: 0 })).max(100, t("validation.max", { max: 100 })),
  tenure: z.number({ invalid_type_error: t("validation.required") }).positive(t("validation.positive")),
  tenureUnit: z.enum(["months", "years"]),
}).refine((v) => (v.tenureUnit === "years" ? v.tenure * 12 : v.tenure) <= 600, { path: ["tenure"], message: t("validation.max", { max: "50 years" }) });

export type LoanEmiInput = z.infer<typeof loanEmiSchema>;

export interface ScheduleRow { period: number; principal: number; interest: number; balance: number }
export interface LoanEmiResult {
  emi: number; totalInterest: number; totalPayment: number; months: number;
  monthly: ScheduleRow[]; yearly: ScheduleRow[];
}

export function emi(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function computeLoanEmi(input: LoanEmiInput): LoanEmiResult {
  const months = Math.max(1, Math.round(input.tenureUnit === "years" ? input.tenure * 12 : input.tenure));
  const m = emi(input.principal, input.rate, months);
  const r = input.rate / 12 / 100;
  const monthly: ScheduleRow[] = [];
  let balance = input.principal;
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const principal = i === months ? balance : m - interest;
    balance = Math.max(0, balance - principal);
    monthly.push({ period: i, principal, interest, balance });
  }
  const yearly: ScheduleRow[] = [];
  for (let y = 0; y * 12 < months; y++) {
    const slice = monthly.slice(y * 12, y * 12 + 12);
    yearly.push({
      period: y + 1,
      principal: slice.reduce((s, x) => s + x.principal, 0),
      interest: slice.reduce((s, x) => s + x.interest, 0),
      balance: slice[slice.length - 1]!.balance,
    });
  }
  const totalPayment = m * months;
  return { emi: m, totalInterest: totalPayment - input.principal, totalPayment, months, monthly, yearly };
}
