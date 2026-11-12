import { describe, expect, it } from "vitest";
import { addDays, age, dateDiff } from "./compute";
describe("date tools", () => {
  it("born 2000-02-29, on 2024-03-01 is 24 years 0 months 1 day", () => expect(age("2000-02-29", "2024-03-01")).toMatchObject({ years: 24, months: 0, days: 1 }));
  it("2024-01-01 to 2024-12-31 is 365 days", () => expect(dateDiff("2024-01-01", "2024-12-31").totalDays).toBe(365));
  it("Mon 2024-01-01 to Mon 2024-01-08 has 5 weekdays", () => expect(dateDiff("2024-01-01", "2024-01-08").weekdays).toBe(5));
  it("2024-01-31 plus 30 days = 2024-03-01", () => expect(addDays("2024-01-31", 30).date).toBe("2024-03-01"));
  it("minus 1 day from 2024-03-01 = 2024-02-29", () => expect(addDays("2024-03-01", -1).date).toBe("2024-02-29"));
});
