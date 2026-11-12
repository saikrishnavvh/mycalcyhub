import { describe, expect, it } from "vitest";
import { computeLoanEmi, loanEmiSchema } from "./compute";

describe("Loan EMI", () => {
  it("1,000,000 at 8.5% for 240 months gives EMI ≈ 8,678.23", () => {
    const r = computeLoanEmi({ principal: 1_000_000, rate: 8.5, tenure: 240, tenureUnit: "months" });
    expect(r.emi).toBeCloseTo(8678.23, 2);
    expect(r.totalPayment).toBeCloseTo(r.emi * 240, 6);
    expect(r.totalInterest).toBeCloseTo(r.totalPayment - 1_000_000, 6);
  });

  it("treats years as 12 months each", () => {
    const a = computeLoanEmi({ principal: 1_000_000, rate: 8.5, tenure: 20, tenureUnit: "years" });
    expect(a.months).toBe(240);
    expect(a.emi).toBeCloseTo(8678.23, 2);
  });

  it("0% interest divides principal evenly", () => {
    const r = computeLoanEmi({ principal: 12_000, rate: 0, tenure: 12, tenureUnit: "months" });
    expect(r.emi).toBe(1000);
    expect(r.totalInterest).toBe(0);
  });

  it("schedule ends at zero balance", () => {
    const r = computeLoanEmi({ principal: 500_000, rate: 10, tenure: 5, tenureUnit: "years" });
    expect(r.monthly).toHaveLength(60);
    expect(r.yearly).toHaveLength(5);
    expect(r.monthly.at(-1)!.balance).toBeCloseTo(0, 6);
  });

  it("rejects a zero loan amount", () => {
    expect(loanEmiSchema.safeParse({ principal: 0, rate: 8, tenure: 10, tenureUnit: "years" }).success).toBe(false);
  });
});
