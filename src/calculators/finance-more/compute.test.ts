import { describe, expect, it } from "vitest";
import * as c from "./compute";
describe("finance formulas", () => {
  it("SIP 10,000/month at 12% for 10 years ≈ 23,23,391", () => expect(c.sip({ monthly: 10000, rate: 12, years: 10 }).maturity).toBeCloseTo(2323391, -1));
  it("lumpsum 1,00,000 at 10% for 5 years = 1,61,051", () => expect(c.lumpsum({ principal: 100000, rate: 10, years: 5 }).maturity).toBeCloseTo(161051, 0));
  it("FD 1,00,000 at 7% for 1 year (quarterly) ≈ 1,07,186", () => expect(c.fd({ principal: 100000, rate: 7, years: 1 }).maturity).toBeCloseTo(107186, 0));
  it("RD 5,000/month at 7% for 1 year ≈ 62,310 (bank quarterly method)", () => expect(c.rd({ monthly: 5000, rate: 7, years: 1 }).maturity).toBeCloseTo(62310, -1));
  it("simple interest 10,000 at 5% for 3 years = 1,500", () => expect(c.simple({ principal: 10000, rate: 5, years: 3 }).interest).toBe(1500));
  it("GST 18% on 1,000 adds 180; 1,180 incl. holds 180", () => {
    expect(c.gst({ amount: 1000, taxRate: 18 }).taxAdded).toBe(180);
    expect(c.gst({ amount: 1180, taxRate: 18 }).taxIncluded).toBeCloseTo(180, 6);
  });
  it("20% off 500 = 400", () => expect(c.discount({ price: 500, discountRate: 20 }).finalPrice).toBe(400));
  it("CAGR doubling in 5 years ≈ 14.87%", () => expect(c.cagr({ startValue: 100, endValue: 200, years: 5 }).cagr).toBeCloseTo(14.87, 2));
});
