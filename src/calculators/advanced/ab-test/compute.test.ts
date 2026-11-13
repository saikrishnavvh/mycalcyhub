import { describe, expect, it } from "vitest";
import { abSchema, computeAb } from "./compute";

const base = { visitorsA: 1000, conversionsA: 100, visitorsB: 1000, conversionsB: 130, confidence: "95", sides: "2" } as const;

describe("A/B test significance", () => {
  it("100/1000 vs 130/1000 is significant at 95% (two-sided)", () => {
    const r = computeAb(base);
    expect(r.z).toBeCloseTo(2.105, 3);
    expect(r.p).toBeCloseTo(0.0353, 4);
    expect(r.uplift).toBeCloseTo(0.3, 6);
    expect(r.verdict).toBe("better");
  });
  it("same case is not significant at 99%", () => {
    expect(computeAb({ ...base, confidence: "99" }).verdict).toBe("none");
  });
  it("one-sided p is half the two-sided p when B is ahead", () => {
    expect(computeAb({ ...base, sides: "1" }).p).toBeCloseTo(computeAb(base).p / 2, 8);
  });
  it("rejects zero visitors and conversions above visitors", () => {
    expect(abSchema.safeParse({ ...base, visitorsA: 0, conversionsA: 0 }).success).toBe(false);
    expect(abSchema.safeParse({ ...base, conversionsB: 1001 }).success).toBe(false);
  });
});
