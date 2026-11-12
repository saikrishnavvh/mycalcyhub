import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, staticHead } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/privacy")({
  head: () => staticHead("privacy"),
  component: () => <StaticPage k="privacy" />,
});
