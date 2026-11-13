import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadVisitCount } from "./visits";

describe("visit counter", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it("counts once, then reuses the total within 6 hours", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ value: 42 })));
    expect(await loadVisitCount(0)).toBe(42);
    expect(await loadVisitCount(5 * 3600_000)).toBe(42);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("counts again after 6 hours", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ value: 7 })));
    await loadVisitCount(0); await loadVisitCount(6 * 3600_000 + 1);
    expect(f).toHaveBeenCalledTimes(2);
  });
});
