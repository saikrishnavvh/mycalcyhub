import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { SideNav } from "@/components/layout/SideNav";
import { readJSON, writeJSON } from "@/lib/storage";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Button } from "@/design-system/minimal-and-sleek-69c4a4";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SettingsProvider } from "@/lib/settings";
import { t } from "@/i18n";

function NotFoundComponent() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-6xl font-semibold tracking-tight text-accent">404</p>
      <h1 className="text-xl font-semibold tracking-tight">{t("notFound.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("notFound.body")}</p>
      <Button asChild><Link to="/">{t("notFound.home")}</Link></Button>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "hmJIHISK0P_zKnKDUk317U01btemqt3EpCwOPqyxuUA" },
      { title: "My Calcy Hub" },
      { name: "description", content: "Free, private calculators that run in your browser." },
      
      { property: "og:title", content: "My Calcy Hub" },
      { property: "og:description", content: "Free, private calculators that run in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [menuOpen, setMenuOpen] = useState(false);
  // Desktop starts open (unless the user collapsed it before); phones start closed.
  useEffect(() => { setMenuOpen(window.innerWidth >= 1024 && readJSON("calchub:menu", true)); }, []);
  const toggleMenu = () => setMenuOpen((o) => { if (window.innerWidth >= 1024) writeJSON("calchub:menu", !o); return !o; });

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SettingsProvider>
        <div className="flex min-h-screen flex-col">
          <Header onToggleMenu={toggleMenu} menuOpen={menuOpen} />
          <div className="flex flex-1">
            <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex-1"><Outlet /></div>
              <Footer />
            </div>
          </div>
        </div>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
