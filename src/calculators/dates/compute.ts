const DAY = 86_400_000;
export const parse = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); return Number.isNaN(d.getTime()) ? null : d; };
export const toIso = (d: Date) => d.toISOString().slice(0, 10);
const dim = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/** Calendar difference as years, months, days (end ≥ start). */
export function ymd(a: Date, b: Date) {
  let y = b.getUTCFullYear() - a.getUTCFullYear(), m = b.getUTCMonth() - a.getUTCMonth(), d = b.getUTCDate() - a.getUTCDate();
  if (d < 0) { m--; d += dim(b.getUTCFullYear(), b.getUTCMonth() - 1); }
  if (m < 0) { y--; m += 12; }
  return { years: y, months: m, days: d };
}

export function age(birth: string, asOf: string) {
  const a = parse(birth)!, b = parse(asOf)!;
  const totalDays = Math.round((b.getTime() - a.getTime()) / DAY);
  let next = new Date(Date.UTC(b.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()));
  if (next < b) next = new Date(Date.UTC(b.getUTCFullYear() + 1, a.getUTCMonth(), a.getUTCDate()));
  return { ...ymd(a, b), totalDays, totalWeeks: Math.floor(totalDays / 7), daysToBirthday: Math.round((next.getTime() - b.getTime()) / DAY) };
}

export function dateDiff(start: string, end: string) {
  let a = parse(start)!, b = parse(end)!;
  const sign = b < a ? -1 : 1;
  if (sign < 0) [a, b] = [b, a];
  const totalDays = Math.round((b.getTime() - a.getTime()) / DAY);
  let weekdays = 0;
  for (let i = 0; i < totalDays; i++) { const w = new Date(a.getTime() + i * DAY).getUTCDay(); if (w !== 0 && w !== 6) weekdays++; }
  return { ...ymd(a, b), totalDays: totalDays * sign, weeks: Math.floor(totalDays / 7), weekdays };
}

export function addDays(start: string, days: number) {
  const a = parse(start)!;
  return { date: toIso(new Date(a.getTime() + Math.round(days) * DAY)) };
}
