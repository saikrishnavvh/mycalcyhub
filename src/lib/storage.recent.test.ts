import { describe, expect, it } from "vitest";
import { latestRecent } from "./storage";

describe("home recent calculators", () => {
  it("shows only the 3 most recent, newest first", () => {
    expect(latestRecent(["sip", "emi", "gst", "age", "cagr"])).toEqual(["sip", "emi", "gst"]);
  });
  it("shows fewer when history is short", () => {
    expect(latestRecent(["emi"])).toEqual(["emi"]);
  });
});
