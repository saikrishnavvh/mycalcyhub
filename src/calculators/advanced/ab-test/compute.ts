import { z } from "zod";
import { t } from "@/i18n";

const count = () => z.number({ invalid_type_error: t("validation.required") }).finite().int().min(0);

export const abSchema = z
  .object({ visitorsA: count(), conversionsA: count(), visitorsB: count(), conversionsB: count(), confidence: z.enum(["90", "95", "99"]), sides: z.enum(["1", "2"]) })
  .superRefine((v, ctx) => {
    if (v.visitorsA < 1) ctx.addIssue({ code: "custom", path: ["visitorsA"], message: t("validation.nonZero") });
    if (v.visitorsB < 1) ctx.addIssue({ code: "custom", path: ["visitorsB"], message: t("validation.nonZero") });
    if (v.conversionsA > v.visitorsA) ctx.addIssue({ code: "custom", path: ["conversionsA"], message: t("ab.err.conv") });
    if (v.conversionsB > v.visitorsB) ctx.addIssue({ code: "custom", path: ["conversionsB"], message: t("ab.err.conv") });
  });

export type AbInput = z.infer<typeof abSchema>;
export interface AbResult {
  rateA: number; rateB: number; uplift: number; z: number; p: number;
  seA: number; seB: number; zCrit: number; significant: boolean; verdict: "better" | "worse" | "none";
}

/** Standard normal CDF (Abramowitz–Stegun 7.1.26 via erf). */
export function normCdf(x: number): number {
  const s = x < 0 ? -1 : 1;
  const a = Math.abs(x) / Math.SQRT2;
  const k = 1 / (1 + 0.3275911 * a);
  const erf = 1 - ((((1.061405429 * k - 1.453152027) * k + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-a * a);
  return 0.5 * (1 + s * erf);
}

const Z_CRIT: Record<AbInput["sides"], Record<AbInput["confidence"], number>> = {
  "2": { "90": 1.6449, "95": 1.96, "99": 2.5758 },
  "1": { "90": 1.2816, "95": 1.6449, "99": 2.3263 },
};

export function computeAb(i: AbInput): AbResult {
  const rateA = i.conversionsA / i.visitorsA;
  const rateB = i.conversionsB / i.visitorsB;
  const seA = Math.sqrt((rateA * (1 - rateA)) / i.visitorsA);
  const seB = Math.sqrt((rateB * (1 - rateB)) / i.visitorsB);
  // Unpooled standard error, same method as abtestguide.com, so results match that reference.
  const se = Math.sqrt(seA * seA + seB * seB);
  const z = se > 0 ? (rateB - rateA) / se : 0;
  const p = i.sides === "2" ? 2 * (1 - normCdf(Math.abs(z))) : 1 - normCdf(z);
  const alpha = 1 - Number(i.confidence) / 100;
  const significant = p < alpha;
  const verdict = !significant ? "none" : z > 0 ? "better" : "worse";
  return { rateA, rateB, uplift: rateA > 0 ? (rateB - rateA) / rateA : 0, z, p, seA, seB, zCrit: Z_CRIT[i.sides][i.confidence], significant, verdict };
}
