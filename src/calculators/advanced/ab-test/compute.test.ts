import { describe, expect, it } from "vitest";
import { abSchema, computeAb } from "./compute";

const base = { visitorsA: 1000, conversionsA: 100, visitorsB: 1000, conversionsB: 130, confidence: "95", sides: "2" } as const;

describe("A/B test significance", () => {
  it("100/1000 vs 130/1000 is significant at 95% (two-sided)", () => {
    const r = computeAb(base);
    expect(r.z).toBeCloseTo(2.098, 2);
    expect(r.p).toBeCloseTo(0.0359, 3);
    expect(r.uplift).toBeCloseTo(0.3, 6);
    expect(r.verdict).toBe("better");
  });
  it("same case is not significant at 99%", () => {
    expect(computeAb({ ...base, confidence: "99" }).verdict).toBe("none");
  });
  it("rejects zero visitors and conversions above visitors", () => {
    expect(abSchema.safeParse({ ...base, visitorsA: 0, conversionsA: 0 }).success).toBe(false);
    expect(abSchema.safeParse({ ...base, conversionsB: 1001 }).success).toBe(false);
  });
});
