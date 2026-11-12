import { describe, expect, it } from "vitest";
import { computeLoanAdvanced } from "./compute";

const base = { principal: 1_000_000, rate: 8.5, tenureYears: 20, monthlyExtra: 0, yearlyExtra: 0, oneTime: 0, oneTimeMonth: 12, mode: "tenure" as const };

describe("advanced loan EMI", () => {
  it("matches the plain EMI with no prepayment", () => {
    const r = computeLoanAdvanced(base);
    expect(r.emi).toBeCloseTo(8678.23, 1);
    expect(r.months).toBe(240);
    expect(r.interestSaved).toBeCloseTo(0, 2);
  });
  it("reduce-tenure mode keeps EMI and shortens the loan", () => {
    const r = computeLoanAdvanced({ ...base, monthlyExtra: 2000 });
    expect(r.months).toBeLessThan(240);
    expect(r.lastEmi).toBeCloseTo(r.emi, 6);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.monthly.at(-1)!.balance).toBe(0);
  });
  it("reduce-EMI mode keeps tenure and lowers EMI", () => {
    const r = computeLoanAdvanced({ ...base, oneTime: 200_000, oneTimeMonth: 12, mode: "emi" });
    expect(r.months).toBe(240);
    expect(r.lastEmi).toBeLessThan(r.emi);
    expect(r.totalPrepaid).toBe(200_000);
  });
});
