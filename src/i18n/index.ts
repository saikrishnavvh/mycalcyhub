import en from "./en.json";

type Dict = Record<string, string>;
const dictionaries: Record<string, Dict> = { en };
let current: Dict = en;

export function setLanguage(lang: string) {
  current = dictionaries[lang] ?? en;
}

/** Translate a key. `{name}` placeholders are replaced from vars. Missing keys return the key. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = current[key] ?? (en as Dict)[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
