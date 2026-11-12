import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/design-system/minimal-and-sleek-69c4a4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CalcHub — Every calculator in one place" },
      { name: "description", content: "Fast, private calculators that run entirely in your browser." },
      { property: "og:title", content: "CalcHub — Every calculator in one place" },
      { property: "og:description", content: "Fast, private calculators that run entirely in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-12 px-6 py-12">
      <div className="flex flex-col gap-4">
        <Badge variant="outline">Coming soon</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">CalcHub</h1>
        <p className="text-lg text-muted-foreground">Every calculator you need, calm and quick.</p>
      </div>
      <Card variant="soft" padding="lg">
        <CardHeader>
          <CardTitle>Loan EMI</CardTitle>
          <CardDescription>Monthly payment, total interest and a full schedule.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="ghost">Percentage</Button>
          <Button>Open</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
