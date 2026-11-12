import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCalculator } from "@/calculators/registry";
import { CalculatorShell } from "@/components/calc/CalculatorShell";

export const Route = createFileRoute("/$category/$slug")({
  loader: ({ params }) => {
    if (!getCalculator(params.category, params.slug)) throw notFound();
    return params;
  },
  head: ({ params }) => {
    const c = getCalculator(params.category, params.slug);
    if (!c) return { meta: [{ title: "Unavailable – CalcHub" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: c.seo.title },
        { name: "description", content: c.seo.description },
        { property: "og:title", content: c.seo.title },
        { property: "og:description", content: c.seo.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: c.seo.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }) }],
    };
  },
  component: CalcPage,
});

function CalcPage() {
  const { category, slug } = Route.useLoaderData();
  const calc = getCalculator(category, slug)!;
  return <CalculatorShell key={calc.id} calc={calc} />;
}
