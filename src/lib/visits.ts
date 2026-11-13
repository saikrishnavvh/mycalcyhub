const KEY = "mch.visits";
const SIX_HOURS = 6 * 60 * 60 * 1000;
const BASE = "https://abacus.jasoncameron.dev";

/** Counts a visitor at most once per 6 hours; otherwise reuses the cached total. */
export async function loadVisitCount(now = Date.now()): Promise<number | null> {
  let cached: { count: number; at: number } | null = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { /* ignore */ }
  if (cached && now - cached.at < SIX_HOURS) return cached.count;
  try {
    const res = await fetch(`${BASE}/hit/mycalcyhub/visits`);
    const { value } = (await res.json()) as { value: number };
    try { localStorage.setItem(KEY, JSON.stringify({ count: value, at: now })); } catch { /* ignore */ }
    return value;
  } catch {
    return cached?.count ?? null;
  }
}
