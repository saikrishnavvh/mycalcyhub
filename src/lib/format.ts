export type NumberFormatId = "en" | "de" | "in" | "fr";

export const NUMBER_FORMATS: { id: NumberFormatId; label: string; locale: string }[] = [
  { id: "en", label: "1,234,567.89", locale: "en-US" },
  { id: "de", label: "1.234.567,89", locale: "de-DE" },
  { id: "in", label: "12,34,567.89", locale: "en-IN" },
  { id: "fr", label: "1 234 567,89", locale: "fr-FR" },
];

export function localeFor(fmt: NumberFormatId): string {
  return NUMBER_FORMATS.find((f) => f.id === fmt)?.locale ?? "en-US";
}

export function decimalSeparator(fmt: NumberFormatId): string {
  return fmt === "de" || fmt === "fr" ? "," : ".";
}

const safe = (n: number) => (Number.isFinite(n) ? n : 0);

export function formatNumber(value: number, fmt: NumberFormatId = "en", maxFractionDigits = 2): string {
  return new Intl.NumberFormat(localeFor(fmt), { maximumFractionDigits: maxFractionDigits }).format(safe(value));
}

export function formatMoney(value: number, currency = "USD", fmt: NumberFormatId = "en", fractionDigits = 2): string {
  try {
    return new Intl.NumberFormat(localeFor(fmt), {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safe(value));
  } catch {
    return `${currency} ${formatNumber(value, fmt, fractionDigits)}`;
  }
}

/** Short form for big numbers: 1.2M, or 12.5 L / 1.2 Cr in the Indian format. Returns null when not large. */
export function formatCompact(value: number, fmt: NumberFormatId = "en"): string | null {
  const v = safe(value);
  const abs = Math.abs(v);
  if (fmt === "in") {
    if (abs >= 1e7) return `${formatNumber(v / 1e7, fmt, 2)} Cr`;
    if (abs >= 1e5) return `${formatNumber(v / 1e5, fmt, 2)} L`;
    return null;
  }
  if (abs < 1e5) return null;
  return new Intl.NumberFormat(localeFor(fmt), { notation: "compact", maximumFractionDigits: 1 }).format(v);
}

/** Currency symbol for the code in the given format, e.g. INR → ₹. Falls back to the code. */
export function currencySymbol(currency = "USD", fmt: NumberFormatId = "en"): string {
  try {
    const part = new Intl.NumberFormat(localeFor(fmt), { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0).find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

/** Formats an ISO date (YYYY-MM-DD) as a long local date, read in UTC so it never shifts a day. */
export function formatDate(iso: string, fmt: NumberFormatId = "en"): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(localeFor(fmt), { dateStyle: "full", timeZone: "UTC" }).format(d);
}
