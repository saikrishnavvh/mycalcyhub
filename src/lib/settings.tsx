import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NumberFormatId } from "./format";
import { currencyFromLocale } from "./currencies";
import { readJSON, writeJSON } from "./storage";

export type Theme = "light" | "dark" | "system";
export interface Settings { currency: string; numberFormat: NumberFormatId; theme: Theme }

const KEY = "calchub:settings";
const DEFAULTS: Settings = { currency: "USD", numberFormat: "en", theme: "system" };

interface Ctx extends Settings { update: (patch: Partial<Settings>) => void }
const SettingsContext = createContext<Ctx>({ ...DEFAULTS, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const lang = navigator.language;
    const stored = readJSON<Partial<Settings>>(KEY, {});
    setSettings({
      currency: stored.currency || currencyFromLocale(lang),
      numberFormat: stored.numberFormat || (lang.endsWith("-IN") ? "in" : "en"),
      theme: stored.theme || "system",
    });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeJSON(KEY, settings);
  }, [settings, loaded]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  const value = useMemo<Ctx>(() => ({ ...settings, update: (p) => setSettings((s) => ({ ...s, ...p })) }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
