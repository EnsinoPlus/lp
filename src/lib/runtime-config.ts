import { createServerFn } from "@tanstack/react-start";

const DEFAULT_CREDITS_CHECKOUT_URL = "https://suiteplus.ensinoplus.com.br/promo88";

/** Lê env em runtime (Easypanel/runtime). Não usa import.meta.env / build do Vite. */
function readEnv(name: string): string | undefined {
  try {
    const value = process.env[name]?.trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

export const getCreditsCheckoutUrl = createServerFn({ method: "GET" }).handler(async () => {
  return (
    readEnv("SUITEPLUS_CREDITS_CHECKOUT_URL") ||
    readEnv("VITE_SUITEPLUS_CREDITS_CHECKOUT_URL") ||
    DEFAULT_CREDITS_CHECKOUT_URL
  );
});
