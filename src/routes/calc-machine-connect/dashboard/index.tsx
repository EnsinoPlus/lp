import { createFileRoute } from "@tanstack/react-router";
import { DashboardCentral } from "@/components/DashboardCentral";

// Dashboard central (leads de todas as páginas). Acesso por login; não indexar.
export const Route = createFileRoute("/calc-machine-connect/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard Ensino Plus" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DashboardCentral,
});
