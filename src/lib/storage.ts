export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or disabled */
  }
}

const RECENT_KEY = "calchub:recent";

export function getRecent(): string[] {
  const v = readJSON<unknown>(RECENT_KEY, []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 6) : [];
}

export function pushRecent(id: string) {
  writeJSON(RECENT_KEY, [id, ...getRecent().filter((x) => x !== id)].slice(0, 6));
}

/** The `n` most recently opened ids, newest first. */
export const latestRecent = (ids: string[], n = 3) => ids.slice(0, n);
