// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      // EasyPanel/reverse proxy can send requests with a Host header that
      // differs from local dev; allow our domains to avoid blocked requests.
      allowedHosts: ["all", "ensinoplus-lp.n697dr.easypanel.host", "lp.ensinoplus.com.br"],
    },
    preview: {
      allowedHosts: ["all", "ensinoplus-lp.n697dr.easypanel.host", "lp.ensinoplus.com.br"],
    },
  },
});
