import { createFileRoute } from "@tanstack/react-router";
import { calculatorPath, calculators, categories } from "@/calculators/registry";
import { config } from "@/config";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const paths = ["/", ...categories.map((c) => `/${c.id}`), ...calculators.map(calculatorPath), "/guides/sip-vs-lumpsum", "/about", "/privacy", "/terms", "/disclaimer"];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${config.siteUrl}${p}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
