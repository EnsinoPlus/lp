#!/bin/sh
# Injeta variáveis do container no wrangler.json para o Worker ler em runtime
# (mudar env no Easypanel + restart basta; não precisa rebuild).
set -e

WRANGLER_JSON="${WRANGLER_JSON:-/app/dist/server/wrangler.json}"

if [ -f "$WRANGLER_JSON" ]; then
  node <<'NODE'
const fs = require("node:fs");
const path = process.env.WRANGLER_JSON || "/app/dist/server/wrangler.json";
const cfg = JSON.parse(fs.readFileSync(path, "utf8"));
cfg.vars = { ...(cfg.vars || {}) };

const keys = [
  "SUITEPLUS_CREDITS_CHECKOUT_URL",
  "VITE_SUITEPLUS_CREDITS_CHECKOUT_URL",
  "SUITEPLUS_BOOK_CHECKOUT_URL",
  "VITE_SUITEPLUS_BOOK_CHECKOUT_URL",
];

for (const key of keys) {
  const value = process.env[key]?.trim();
  if (value) cfg.vars[key] = value;
}

// Alias: se só VITE_ estiver definida, espelha no nome sem prefixo
const checkout =
  process.env.SUITEPLUS_CREDITS_CHECKOUT_URL?.trim() ||
  process.env.VITE_SUITEPLUS_CREDITS_CHECKOUT_URL?.trim();
if (checkout) {
  cfg.vars.SUITEPLUS_CREDITS_CHECKOUT_URL = checkout;
  cfg.vars.VITE_SUITEPLUS_CREDITS_CHECKOUT_URL = checkout;
}

const bookCheckout =
  process.env.SUITEPLUS_BOOK_CHECKOUT_URL?.trim() ||
  process.env.VITE_SUITEPLUS_BOOK_CHECKOUT_URL?.trim();
if (bookCheckout) {
  cfg.vars.SUITEPLUS_BOOK_CHECKOUT_URL = bookCheckout;
  cfg.vars.VITE_SUITEPLUS_BOOK_CHECKOUT_URL = bookCheckout;
}

fs.writeFileSync(path, JSON.stringify(cfg));
NODE
fi

exec npm start
