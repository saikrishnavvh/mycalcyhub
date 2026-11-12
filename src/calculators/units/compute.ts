export interface Unit { id: string; factor?: number; to?: (v: number) => number; from?: (v: number) => number }

/** Linear units use `factor` (base units per 1 unit); temperature uses to/from base functions. */
export function convert(value: number, from: Unit, to: Unit): number {
  const base = from.to ? from.to(value) : value * (from.factor ?? 1);
  return to.from ? to.from(base) : base / (to.factor ?? 1);
}

export const UNITS: Record<string, Unit[]> = {
  length: [{ id: "mm", factor: 0.001 }, { id: "cm", factor: 0.01 }, { id: "m", factor: 1 }, { id: "km", factor: 1000 }, { id: "in", factor: 0.0254 }, { id: "ft", factor: 0.3048 }, { id: "yd", factor: 0.9144 }, { id: "mi", factor: 1609.344 }],
  weight: [{ id: "mg", factor: 0.000001 }, { id: "g", factor: 0.001 }, { id: "kg", factor: 1 }, { id: "t", factor: 1000 }, { id: "oz", factor: 0.028349523125 }, { id: "lb", factor: 0.45359237 }, { id: "st", factor: 6.35029318 }],
  temperature: [
    { id: "c", to: (v) => v, from: (v) => v },
    { id: "f", to: (v) => ((v - 32) * 5) / 9, from: (v) => (v * 9) / 5 + 32 },
    { id: "k", to: (v) => v - 273.15, from: (v) => v + 273.15 },
  ],
  volume: [{ id: "ml", factor: 0.001 }, { id: "l", factor: 1 }, { id: "m3", factor: 1000 }, { id: "tsp", factor: 0.00492892159375 }, { id: "tbsp", factor: 0.01478676478125 }, { id: "cup", factor: 0.2365882365 }, { id: "galUs", factor: 3.785411784 }, { id: "galUk", factor: 4.54609 }],
  area: [{ id: "m2", factor: 1 }, { id: "km2", factor: 1e6 }, { id: "ft2", factor: 0.09290304 }, { id: "yd2", factor: 0.83612736 }, { id: "acre", factor: 4046.8564224 }, { id: "ha", factor: 10000 }],
  speed: [{ id: "mps", factor: 1 }, { id: "kmh", factor: 1 / 3.6 }, { id: "mph", factor: 0.44704 }, { id: "knot", factor: 0.514444444 }],
  data: [{ id: "b", factor: 1 }, { id: "kb", factor: 1e3 }, { id: "mb", factor: 1e6 }, { id: "gb", factor: 1e9 }, { id: "tb", factor: 1e12 }, { id: "kib", factor: 1024 }, { id: "mib", factor: 1024 ** 2 }, { id: "gib", factor: 1024 ** 3 }],
};

export function convertIn(kind: string, value: number, fromId: string, toId: string): number {
  const list = UNITS[kind] ?? [];
  const f = list.find((u) => u.id === fromId), t = list.find((u) => u.id === toId);
  return f && t ? convert(value, f, t) : NaN;
}
