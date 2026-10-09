/**
 * Acesso ao banco de LEADS (sistema-b7) direto do navegador.
 * Feito client-side porque o Worker do deploy não alcança o Supabase.
 * Chave anon é pública e protegida por RLS (anon só INSERE na tabela e
 * SELECIONA a view agregada; a lista com PII exige token via RPC).
 */

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

function headers(extra?: Record<string, string>) {
  return {
    apikey: LEADS_ANON_KEY,
    Authorization: `Bearer ${LEADS_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export type LeadStage = "page1" | "checkout";

export type InsertLeadInput = {
  stage: LeadStage;
  name?: string;
  email: string;
  phone?: string;
  attribution?: Record<string, string>;
  params?: Record<string, string>;
  landingPage?: string;
};

/** Insere o lead no banco (best-effort: nunca lança). */
export async function insertPromo1010Lead(input: InsertLeadInput): Promise<boolean> {
  const attr = input.attribution ?? {};
  const body = {
    stage: input.stage,
    name: input.name || null,
    email: input.email,
    phone: input.phone || null,
    utm_source: attr.utm_source || null,
    utm_medium: attr.utm_medium || null,
    utm_campaign: attr.utm_campaign || null,
    origem: attr.origem || null,
    gclid: attr.gclid || null,
    attribution: Object.keys(attr).length ? attr : null,
    url_params: input.params && Object.keys(input.params).length ? input.params : null,
    landing_page: input.landingPage || null,
  };
  try {
    const resp = await fetch(`${LEADS_URL}/rest/v1/promo1010_leads`, {
      method: "POST",
      headers: headers({ Prefer: "return=minimal" }),
      body: JSON.stringify(body),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export type FunnelRow = {
  dia: string;
  stage: LeadStage;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  origem: string;
  total: number;
};

export async function fetchPromo1010Funnel(): Promise<FunnelRow[]> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/promo1010_funnel?select=*`, {
    headers: headers(),
  });
  if (!resp.ok) throw new Error(`funnel_${resp.status}`);
  const rows = (await resp.json()) as FunnelRow[];
  return Array.isArray(rows) ? rows : [];
}

export type LeadRow = {
  id: string;
  created_at: string;
  stage: LeadStage;
  name: string | null;
  email: string;
  phone: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  origem: string | null;
};

/** Lista individual (com PII). Exige o token do dashboard. 401/403 → unauthorized. */
export async function fetchPromo1010Leads(
  token: string,
): Promise<{ ok: true; leads: LeadRow[] } | { ok: false; status: number }> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/promo1010_recent_leads`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_token: token, p_limit: 2000 }),
  });
  if (!resp.ok) return { ok: false, status: resp.status };
  const leads = (await resp.json()) as LeadRow[];
  return { ok: true, leads: Array.isArray(leads) ? leads : [] };
}
