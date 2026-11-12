import { describe, expect, it } from "vitest";
import { computePercentage, percentageSchema } from "./compute";

describe("Percentage", () => {
  it("20% of 150 is 30", () => {
    expect(computePercentage({ mode: "of", x: 20, y: 150 }).value).toBe(30);
  });
  it("30 is 20% of 150", () => {
    expect(computePercentage({ mode: "whatPercent", x: 30, y: 150 }).value).toBe(20);
  });
  it("50 → 75 is +50%", () => {
    expect(computePercentage({ mode: "change", x: 50, y: 75 }).value).toBe(50);
  });
  it("80 → 60 is −25%", () => {
    expect(computePercentage({ mode: "change", x: 80, y: 60 }).value).toBe(-25);
  });
  it("change from a negative start uses its size", () => {
    expect(computePercentage({ mode: "change", x: -50, y: -25 }).value).toBe(50);
  });
  it("rejects change from 0 and share of 0", () => {
    expect(percentageSchema.safeParse({ mode: "change", x: 0, y: 5 }).success).toBe(false);
    expect(percentageSchema.safeParse({ mode: "whatPercent", x: 5, y: 0 }).success).toBe(false);
  });
});
