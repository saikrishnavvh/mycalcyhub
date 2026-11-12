import { z } from "zod";
import { t } from "@/i18n";

const num = () => z.number({ invalid_type_error: t("validation.required") }).finite();

export const percentageSchema = z
  .object({ mode: z.enum(["of", "whatPercent", "change"]), x: num(), y: num() })
  .superRefine((v, ctx) => {
    if (v.mode === "whatPercent" && v.y === 0) ctx.addIssue({ code: "custom", path: ["y"], message: t("validation.nonZero") });
    if (v.mode === "change" && v.x === 0) ctx.addIssue({ code: "custom", path: ["x"], message: t("validation.nonZero") });
  });

export type PercentageInput = z.infer<typeof percentageSchema>;
export interface PercentageResult { value: number; mode: PercentageInput["mode"] }

export function computePercentage({ mode, x, y }: PercentageInput): PercentageResult {
  if (mode === "of") return { mode, value: (x / 100) * y };
  if (mode === "whatPercent") return { mode, value: (x / y) * 100 };
  return { mode, value: ((y - x) / Math.abs(x)) * 100 };
}
