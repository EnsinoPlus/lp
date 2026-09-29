#!/bin/sh
# Injeta variáveis do container no wrangler.json (+ .dev.vars) para o Worker ler em runtime
# (mudar env no Easypanel + restart basta; não precisa rebuild).
set -e

WRANGLER_JSON="${WRANGLER_JSON:-/app/dist/server/wrangler.json}"
DEV_VARS="${DEV_VARS:-/app/dist/server/.dev.vars}"

if [ -f "$WRANGLER_JSON" ]; then
  node <<'NODE'
const fs = require("node:fs");
const path = process.env.WRANGLER_JSON || "/app/dist/server/wrangler.json";
const devVarsPath = process.env.DEV_VARS || "/app/dist/server/.dev.vars";
const cfg = JSON.parse(fs.readFileSync(path, "utf8"));
cfg.vars = { ...(cfg.vars || {}) };
if (!Array.isArray(cfg.compatibility_flags)) cfg.compatibility_flags = [];
if (!cfg.compatibility_flags.includes("nodejs_compat")) {
  cfg.compatibility_flags.push("nodejs_compat");
}
if (!cfg.compatibility_flags.includes("nodejs_compat_populate_process_env")) {
  cfg.compatibility_flags.push("nodejs_compat_populate_process_env");
}

const keys = [
  "SUITEPLUS_CREDITS_CHECKOUT_URL",
  "VITE_SUITEPLUS_CREDITS_CHECKOUT_URL",
  "SUITEPLUS_BOOK_CHECKOUT_URL",
  "VITE_SUITEPLUS_BOOK_CHECKOUT_URL",
  "BREVO_API_KEY",
  "BREVO_CCT_FUNNEL_LIST_ID",
  "META_PIXEL_ID",
  "META_CONVERSIONS_API_TOKEN",
];

const injected = {};

for (const key of keys) {
  const value = process.env[key]?.trim();
  if (value) {
    cfg.vars[key] = value;
    injected[key] = value;
  }
}

// Alias: se só VITE_ estiver definida, espelha no nome sem prefixo
const checkout =
  process.env.SUITEPLUS_CREDITS_CHECKOUT_URL?.trim() ||
  process.env.VITE_SUITEPLUS_CREDITS_CHECKOUT_URL?.trim();
if (checkout) {
  cfg.vars.SUITEPLUS_CREDITS_CHECKOUT_URL = checkout;
  cfg.vars.VITE_SUITEPLUS_CREDITS_CHECKOUT_URL = checkout;
  injected.SUITEPLUS_CREDITS_CHECKOUT_URL = checkout;
  injected.VITE_SUITEPLUS_CREDITS_CHECKOUT_URL = checkout;
}

const bookCheckout =
  process.env.SUITEPLUS_BOOK_CHECKOUT_URL?.trim() ||
  process.env.VITE_SUITEPLUS_BOOK_CHECKOUT_URL?.trim();
if (bookCheckout) {
  cfg.vars.SUITEPLUS_BOOK_CHECKOUT_URL = bookCheckout;
  cfg.vars.VITE_SUITEPLUS_BOOK_CHECKOUT_URL = bookCheckout;
  injected.SUITEPLUS_BOOK_CHECKOUT_URL = bookCheckout;
  injected.VITE_SUITEPLUS_BOOK_CHECKOUT_URL = bookCheckout;
}

fs.writeFileSync(path, JSON.stringify(cfg));

// wrangler dev também lê .dev.vars (secrets/local bindings)
const lines = Object.entries(injected).map(([k, v]) => {
  const escaped = String(v).replace(/\n/g, "\\n").replace(/"/g, '\\"');
  return `${k}="${escaped}"`;
});
fs.writeFileSync(devVarsPath, lines.join("\n") + (lines.length ? "\n" : ""));

console.log(
  "[entrypoint] wrangler vars:",
  Object.keys(injected).join(", ") || "(nenhuma)",
  "| BREVO_API_KEY:",
  injected.BREVO_API_KEY ? "ok" : "ausente",
);
NODE
fi

exec npm start
