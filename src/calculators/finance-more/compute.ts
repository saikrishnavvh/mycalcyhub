type V = Record<string, number>;
const n = (v: V, k: string) => v[k] ?? 0;

/** Monthly SIP, paid at the start of each month, compounded monthly. */
export function sip(v: V) {
  const p = n(v, "monthly"), i = n(v, "rate") / 1200, m = n(v, "years") * 12;
  const value = i === 0 ? p * m : p * ((Math.pow(1 + i, m) - 1) / i) * (1 + i);
  const invested = p * m;
  return { maturity: value, invested, returns: value - invested };
}
export function lumpsum(v: V) {
  const p = n(v, "principal"), value = p * Math.pow(1 + n(v, "rate") / 100, n(v, "years"));
  return { maturity: value, invested: p, returns: value - p };
}
/** Fixed deposit compounded quarterly. */
export function fd(v: V) {
  const p = n(v, "principal"), value = p * Math.pow(1 + n(v, "rate") / 400, 4 * n(v, "years"));
  return { maturity: value, invested: p, interest: value - p };
}
/** Recurring deposit: monthly deposits, quarterly compounding (bank convention). */
export function rd(v: V) {
  const p = n(v, "monthly"), r = n(v, "rate") / 400, m = Math.round(n(v, "years") * 12);
  let value = 0;
  for (let k = 1; k <= m; k++) value += p * Math.pow(1 + r, (4 * (m - k + 1)) / 12);
  const invested = p * m;
  return { maturity: value, invested, interest: value - invested };
}
export function compound(v: V) {
  const p = n(v, "principal"), f = n(v, "perYear"), value = p * Math.pow(1 + n(v, "rate") / (100 * f), f * n(v, "years"));
  return { maturity: value, interest: value - p };
}
export function simple(v: V) {
  const p = n(v, "principal"), interest = (p * n(v, "rate") * n(v, "years")) / 100;
  return { maturity: p + interest, interest };
}
/** Both directions: tax added on top, and tax already inside the amount. */
export function gst(v: V) {
  const a = n(v, "amount"), r = n(v, "taxRate"), tax = (a * r) / 100, net = a / (1 + r / 100);
  return { totalWithTax: a + tax, taxAdded: tax, netOfTax: net, taxIncluded: a - net };
}
export function discount(v: V) {
  const p = n(v, "price"), saving = (p * n(v, "discountRate")) / 100;
  return { finalPrice: p - saving, saving };
}
export function cagr(v: V) {
  const s = n(v, "startValue"), e = n(v, "endValue");
  return { cagr: (Math.pow(e / s, 1 / n(v, "years")) - 1) * 100, totalGrowth: ((e - s) / s) * 100 };
}
export function inflation(v: V) {
  const a = n(v, "amount"), g = Math.pow(1 + n(v, "rate") / 100, n(v, "years"));
  return { futureCost: a * g, purchasingPower: a / g };
}
