import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, staticHead } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/about")({
  head: () => staticHead("about"),
  component: () => <StaticPage k="about" />,
});
