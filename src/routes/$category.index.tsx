import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCategory, groupBySubcategory, inCategory } from "@/calculators/registry";
import { CalculatorCard } from "@/components/calc/CalculatorCard";
import { t } from "@/i18n";

export const Route = createFileRoute("/$category/")({
  loader: ({ params }) => {
    if (!getCategory(params.category)) throw notFound();
    return { category: params.category };
  },
  head: ({ params }) => {
    const c = getCategory(params.category);
    const title = c ? `${c.name} calculators – CalcHub` : "Not found – CalcHub";
    const description = c?.description ?? "";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, ...(c ? [] : [{ name: "robots", content: "noindex" }])] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const cat = getCategory(category)!;
  const list = inCategory(cat.id);
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">{cat.name}</h1>
        <p className="text-muted-foreground">{cat.description} · {t("category.count", { n: list.length })}</p>
      </header>
      {groupBySubcategory(list).map(([sub, items]) => (
        <section key={sub} className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">{sub}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((c) => <CalculatorCard key={c.id} calc={c} />)}</div>
        </section>
      ))}
    </main>
  );
}
