import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, staticHead } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => staticHead("disclaimer"),
  component: () => <StaticPage k="disclaimer" />,
});
