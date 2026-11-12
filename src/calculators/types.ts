import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { ZodType } from "zod";
import type { NumberFormatId } from "@/lib/format";

export type CategoryId = "finance" | "converters";

/** Formatting context passed to compute() and components. */
export interface CalcContext { currency: string; numberFormat: NumberFormatId }

export type FieldErrors = Partial<Record<string, string>>;

export interface InputsProps<I> {
  value: I;
  onChange: (next: I) => void;
  errors: FieldErrors;
  ctx: CalcContext;
}

export interface ResultsProps<I, R> { input: I; result: R; ctx: CalcContext }

export interface FAQ { q: string; a: string }

export interface CalculatorDefinition<I = any, R = any> {
  id: string;
  slug: string;
  category: CategoryId;
  subcategory: string;
  name: string;
  shortDescription: string;
  icon: LucideIcon;
  keywords: string[];
  inputSchema: ZodType<I>;
  defaults: I;
  /** Pure: same input, same output. No DOM, no storage. */
  compute: (input: I, ctx: CalcContext) => R;
  Inputs: ComponentType<InputsProps<I>>;
  Results: ComponentType<ResultsProps<I, R>>;
  /** Optional charts/tables shown under the results. */
  Charts?: ComponentType<ResultsProps<I, R>>;
  /** Headline number for the compact mobile result bar. */
  summary: (result: R, ctx: CalcContext) => { label: string; value: string };
  seo: { title: string; description: string; explanation: string; faqs: FAQ[] };
  related: string[];
  exportRows?: (input: I, result: R) => (string | number)[][];
}
