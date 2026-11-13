import { t } from "@/i18n";
import type { CalculatorDefinition, CategoryId } from "./types";
import { loanEmi } from "./loan-emi";
import { loanAdvanced } from "./loan-advanced";
import { percentage } from "./percentage";
import { financeMore } from "./finance-more";
import { unitConverters } from "./units";
import { dateTools } from "./dates";
import { abTest } from "./advanced/ab-test";

/** THE list of calculators. Routing, home, categories, search, related links and the sitemap all read from here. */
export const calculators: CalculatorDefinition[] = [
  loanEmi,
  loanAdvanced,
  ...financeMore,
  percentage,
  ...unitConverters,
  ...dateTools,
  abTest,
];

export const categories: { id: CategoryId; name: string; description: string }[] = [
  { id: "finance", name: t("category.finance"), description: t("category.finance.description") },
  { id: "converters", name: t("category.converters"), description: t("category.converters.description") },
  { id: "advanced", name: t("category.advanced"), description: t("category.advanced.description") },
];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const getCalculator = (category: string, slug: string) => calculators.find((c) => c.category === category && c.slug === slug);
export const getById = (id: string) => calculators.find((c) => c.id === id);
export const inCategory = (id: CategoryId) => calculators.filter((c) => c.category === id);

export function groupBySubcategory(list: CalculatorDefinition[]) {
  const map = new Map<string, CalculatorDefinition[]>();
  for (const c of list) map.set(c.subcategory, [...(map.get(c.subcategory) ?? []), c]);
  return [...map.entries()];
}

/** Case-insensitive match on name, keywords, description; name hits rank first. */
export function searchCalculators(query: string): CalculatorDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return calculators;
  const score = (c: CalculatorDefinition) => {
    if (c.name.toLowerCase().includes(q)) return 3;
    if (c.keywords.some((k) => k.toLowerCase().includes(q))) return 2;
    if (c.shortDescription.toLowerCase().includes(q)) return 1;
    return 0;
  };
  return calculators.map((c) => [c, score(c)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

export const calculatorPath = (c: CalculatorDefinition) => `/${c.category}/${c.slug}`;
