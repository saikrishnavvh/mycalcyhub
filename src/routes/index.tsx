import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { calculators, categories, getById, groupBySubcategory } from "@/calculators/registry";
import type { CalculatorDefinition } from "@/calculators/types";
import { CalculatorCard } from "@/components/calc/CalculatorCard";
import { t } from "@/i18n";
import { getRecent, latestRecent } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Calcy Hub – Free online calculators in one place" },
      { name: "description", content: t("app.description") },
      { property: "og:title", content: "My Calcy Hub – Free online calculators in one place" },
      { property: "og:description", content: t("app.description") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [recent, setRecent] = useState<CalculatorDefinition[]>([]);
  useEffect(() => setRecent(latestRecent(getRecent()).map(getById).filter((c): c is CalculatorDefinition => !!c)), []);
  const results = calculators;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("home.h1")}</h1>
        <p className="text-muted-foreground">{t("home.lead")}</p>
      </header>
          {recent.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-muted-foreground">{t("home.recent")}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recent.map((c) => <CalculatorCard key={c.id} calc={c} />)}</div>
            </section>
          )}
          {categories.map((cat) => {
            const list = results.filter((c) => c.category === cat.id);
            if (!list.length) return null;
            return (
              <section key={cat.id} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight">{cat.name}</h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
                {groupBySubcategory(list).map(([sub, items]) => (
                  <div key={sub} className="flex flex-col gap-3">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{sub}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((c) => <CalculatorCard key={c.id} calc={c} />)}</div>
                  </div>
                ))}
              </section>
            );
          })}
    </main>
  );
}
