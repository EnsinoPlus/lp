import { createServerFn } from "@tanstack/react-start";

const DEFAULT_CREDITS_CHECKOUT_URL = "https://suiteplus.ensinoplus.com.br/promo1010";
const DEFAULT_BOOK_CHECKOUT_URL = "https://suiteplus.ensinoplus.com.br/livro";

/** Lê env em runtime (Easypanel/runtime). Não usa import.meta.env / build do Vite. */
async function readEnv(name: string): Promise<string | undefined> {
  try {
    const fromProcess = process.env[name]?.trim();
    if (fromProcess) return fromProcess;
  } catch {
    // ignore
  }
  try {
    const mod = await import("cloudflare:workers");
    const value = (mod as { env?: Record<string, unknown> }).env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  } catch {
    // fora do Cloudflare
  }
  return undefined;
}

export const getCreditsCheckoutUrl = createServerFn({ method: "GET" }).handler(async () => {
  return (
    (await readEnv("SUITEPLUS_CREDITS_CHECKOUT_URL")) ||
    (await readEnv("VITE_SUITEPLUS_CREDITS_CHECKOUT_URL")) ||
    DEFAULT_CREDITS_CHECKOUT_URL
  );
});

export const getBookCheckoutUrl = createServerFn({ method: "GET" }).handler(async () => {
  return (
    (await readEnv("SUITEPLUS_BOOK_CHECKOUT_URL")) ||
    (await readEnv("VITE_SUITEPLUS_BOOK_CHECKOUT_URL")) ||
    DEFAULT_BOOK_CHECKOUT_URL
  );
});
