import { describe, expect, it } from "vitest";
import { currencySymbol } from "./format";
describe("currencySymbol", () => {
  it("INR shows ₹", () => expect(currencySymbol("INR", "in")).toBe("₹"));
  it("USD shows $", () => expect(currencySymbol("USD", "en")).toBe("$"));
});
