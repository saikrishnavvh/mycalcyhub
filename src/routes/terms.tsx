import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, staticHead } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/terms")({
  head: () => staticHead("terms"),
  component: () => <StaticPage k="terms" />,
});
