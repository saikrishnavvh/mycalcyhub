const FALLBACK = ["USD","EUR","GBP","INR","JPY","CNY","AUD","CAD","CHF","SGD","AED","SAR","ZAR","BRL","MXN","KRW","HKD","NZD","SEK","NOK","DKK","PLN","TRY","RUB","IDR","THB","MYR","PHP","PKR","BDT","NGN","EGP","KES","ILS","VND"];

export function listCurrencies(): { code: string; name: string }[] {
  let codes = FALLBACK;
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (fn) codes = fn("currency");
  } catch { /* use fallback */ }
  let names: Intl.DisplayNames | null = null;
  try { names = new Intl.DisplayNames(["en"], { type: "currency" }); } catch { /* none */ }
  return codes.map((code) => ({ code, name: names?.of(code) ?? code }));
}

const REGION_CURRENCY: Record<string, string> = {
  US: "USD", IN: "INR", GB: "GBP", JP: "JPY", CN: "CNY", AU: "AUD", CA: "CAD", CH: "CHF", SG: "SGD",
  AE: "AED", SA: "SAR", ZA: "ZAR", BR: "BRL", MX: "MXN", KR: "KRW", HK: "HKD", NZ: "NZD", SE: "SEK",
  NO: "NOK", DK: "DKK", PL: "PLN", TR: "TRY", ID: "IDR", TH: "THB", MY: "MYR", PH: "PHP", PK: "PKR",
  BD: "BDT", NG: "NGN", EG: "EGP", KE: "KES", IL: "ILS", VN: "VND",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", IE: "EUR", PT: "EUR", FI: "EUR", GR: "EUR",
};

export function currencyFromLocale(locale: string | undefined): string {
  const region = locale?.split(/[-_]/)[1]?.toUpperCase();
  return (region && REGION_CURRENCY[region]) || "USD";
}
