import { t } from "@/i18n";

export function StaticPage({ k }: { k: string }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t(`page.${k}.title`)}</h1>
      <p className="leading-relaxed text-muted-foreground">{t(`page.${k}.body`)}</p>
    </main>
  );
}

export function staticHead(k: string) {
  const title = `${t(`page.${k}.title`)} – CalcHub`;
  const description = t(`page.${k}.body`);
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}
