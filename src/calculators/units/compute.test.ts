import { describe, expect, it } from "vitest";
import { convertIn } from "./compute";
describe("unit conversion", () => {
  it("1 mile = 1.609344 km", () => expect(convertIn("length", 1, "mi", "km")).toBeCloseTo(1.609344, 9));
  it("100 °C = 212 °F", () => expect(convertIn("temperature", 100, "c", "f")).toBeCloseTo(212, 9));
  it("0 K = −273.15 °C", () => expect(convertIn("temperature", 0, "k", "c")).toBeCloseTo(-273.15, 9));
  it("1 kg ≈ 2.20462 lb", () => expect(convertIn("weight", 1, "kg", "lb")).toBeCloseTo(2.20462, 5));
  it("1 GiB = 1,073,741,824 bytes", () => expect(convertIn("data", 1, "gib", "b")).toBe(1073741824));
});
