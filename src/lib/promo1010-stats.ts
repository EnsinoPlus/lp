import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Estatísticas agregadas do funil 10 do 10 para o dashboard.
 * Lê a view public.promo1010_funnel (sem dados pessoais) no banco de leads.
 * Protegido por PROMO1010_DASHBOARD_TOKEN quando configurado.
 */

async function readRuntimeEnv(name: string): Promise<string | undefined> {
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
    // fora do runtime Cloudflare
  }
  return undefined;
}

export type FunnelRow = {
  dia: string;
  stage: "page1" | "checkout";
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  origem: string;
  total: number;
};

export type Promo1010StatsResult =
  | { ok: true; rows: FunnelRow[] }
  | { ok: false; reason: "unauthorized" | "not_configured" | "fetch_error" };

export const getPromo1010Stats = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string().optional() }))
  .handler(async ({ data }): Promise<Promo1010StatsResult> => {
    const expected = await readRuntimeEnv("PROMO1010_DASHBOARD_TOKEN");
    // Se um token foi configurado, exige que bata. Se não, libera (só agregados).
    if (expected && data.token !== expected) {
      return { ok: false, reason: "unauthorized" };
    }

    const url =
      (await readRuntimeEnv("SUPABASE_LEADS_URL")) ||
      (await readRuntimeEnv("SUPABASE_URL")) ||
      (await readRuntimeEnv("VITE_SUPABASE_URL"));
    const key =
      (await readRuntimeEnv("SUPABASE_LEADS_KEY")) ||
      (await readRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY"));
    if (!url || !key) return { ok: false, reason: "not_configured" };

    try {
      const resp = await fetch(
        `${url.replace(/\/$/, "")}/rest/v1/promo1010_funnel?select=*`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        },
      );
      if (!resp.ok) {
        console.error("[promo1010-stats] fetch falhou", resp.status);
        return { ok: false, reason: "fetch_error" };
      }
      const rows = (await resp.json()) as FunnelRow[];
      return { ok: true, rows: Array.isArray(rows) ? rows : [] };
    } catch (err) {
      console.error("[promo1010-stats] erro de rede:", err);
      return { ok: false, reason: "fetch_error" };
    }
  });
