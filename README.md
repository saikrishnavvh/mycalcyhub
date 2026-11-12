# CalcHub

A lightweight, mobile-first collection of calculators. No backend, no login, no database — every calculation runs in the browser.

## Setup

```bash
bun install
bun run dev        # http://localhost:8080
bunx vitest run    # unit tests
bun run build      # production build
```

Optional environment variables (`.env`):

| Variable | Purpose |
|---|---|
| `VITE_APP_NAME` | App name (default `CalcHub`) |
| `VITE_SITE_URL` | Public URL, used in the sitemap |
| `VITE_GITHUB_URL` | Footer GitHub link |
| `VITE_ADS_ENABLED` | `true` to show ad slots |
| `VITE_ADSENSE_ID` | AdSense client ID |
| `VITE_ANALYTICS_PROVIDER` / `VITE_ANALYTICS_ID` | `plausible` or `ga4`, plus its ID |

## Stack

TanStack Start (React 19 + TypeScript + Vite) with file-based routing, Tailwind CSS v4, the "Minimal and sleek" design system (`src/design-system/`), lucide-react, Zod, Recharts, date-fns, Vitest.

## How to add a calculator

1. Create `src/calculators/<your-id>/`.
2. `compute.ts`: export a Zod `inputSchema` and a **pure** `compute(input)` function.
3. `compute.test.ts`: Vitest tests for `compute`.
4. `index.tsx`: export a `CalculatorDefinition` (see `src/calculators/types.ts`) with `Inputs`, `Results`, optional `Charts`, `summary`, `seo` and `related`.
5. Add UI strings to `src/i18n/en.json` and read them with `t()`.
6. Add **one line** to the `calculators` array in `src/calculators/registry.ts`.

The route `/<category>/<slug>`, home and category cards, search, related links and `sitemap.xml` all update automatically. Use `src/calculators/percentage` as the smallest example.

## Deploy

- **Lovable**: click *Publish* in the editor.
- **Vercel / Netlify / Cloudflare**: the default build targets an edge/serverless runtime (TanStack Start). Import the repo and use `bun run build`; follow the TanStack Start hosting guide for your provider.
- **GitHub Pages (static)**: enable TanStack Start's SPA/prerender mode in `vite.config.ts`, build, and publish the output folder with a `404.html` copy of `index.html` as the SPA fallback.

## License

MIT — see [LICENSE](./LICENSE).
