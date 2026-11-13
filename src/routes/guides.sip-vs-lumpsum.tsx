import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "@/i18n";

const URL = "https://mycalcyhub.lovable.app/guides/sip-vs-lumpsum";
const k = (s: string) => t(`guide.sipLumpsum.${s}`);

export const Route = createFileRoute("/guides/sip-vs-lumpsum")({
  head: () => ({
    meta: [
      { title: `${k("title")} – My Calcy Hub` },
      { name: "description", content: k("description") },
      { property: "og:title", content: k("title") },
      { property: "og:description", content: k("description") },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Guide,
});

const linkCls = "font-medium text-foreground underline underline-offset-4";

function Guide() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{k("title")}</h1>
        <p className="leading-relaxed text-muted-foreground">{k("intro")}</p>
      </header>
      {(["what", "maths", "example", "when"] as const).map((s) => (
        <section key={s} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{k(`${s}.h`)}</h2>
          <p className="leading-relaxed text-muted-foreground">{k(`${s}.p`)}</p>
        </section>
      ))}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{k("try.h")}</h2>
        <ul className="flex list-disc flex-col gap-1 pl-6 text-muted-foreground">
          <li><Link to="/$category/$slug" params={{ category: "finance", slug: "sip" }} className={linkCls}>{k("try.sip")}</Link></li>
          <li><Link to="/$category/$slug" params={{ category: "finance", slug: "lumpsum" }} className={linkCls}>{k("try.lumpsum")}</Link></li>
          <li><Link to="/$category/$slug" params={{ category: "finance", slug: "inflation" }} className={linkCls}>{k("try.inflation")}</Link></li>
        </ul>
      </section>
      <p className="text-sm text-muted-foreground">{k("note")}</p>
    </main>
  );
}
