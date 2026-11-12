/** App configuration. Values come from VITE_* env vars so each deploy can differ. */
const env = import.meta.env;

export const config = {
  appName: env["VITE_APP_NAME"] || "My Calcy Hub",
  /** Informational only: the theme accent lives in the design system tokens. */
  accentColor: env["VITE_ACCENT_COLOR"] || "sage",
  siteUrl: (env["VITE_SITE_URL"] || "https://mycalcyhub.lovable.app").replace(/\/$/, ""),
  githubUrl: env["VITE_GITHUB_URL"] || "https://github.com/",
  adsEnabled: env["VITE_ADS_ENABLED"] === "true",
  adsenseId: env["VITE_ADSENSE_ID"] || "",
  analyticsProvider: (env["VITE_ANALYTICS_PROVIDER"] || "none") as "none" | "plausible" | "ga4",
  analyticsId: env["VITE_ANALYTICS_ID"] || "",
} as const;
