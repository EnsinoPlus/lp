/**
 * Acesso ao banco de LEADS (sistema-b7) direto do navegador.
 * Feito client-side porque o Worker do deploy não alcança o Supabase.
 * Chave anon é pública e protegida por RLS. Gravação via RPC controlada.
 */

import { getStoredAttribution } from "@/lib/signup-origin";

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

const VID_KEY = "promo1010_vid";

function headers(extra?: Record<string, string>) {
  return {
    apikey: LEADS_ANON_KEY,
    Authorization: `Bearer ${LEADS_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/** ID estável do visitante (para ligar acesso → parcial → completo). */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VID_KEY) ?? "";
    if (!/^[a-z0-9-]{8,64}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export type LeadStage = "page1" | "checkout" | "ressaca";
export type LeadStatus = "parcial" | "completo";

type Attr = Record<string, string>;

/** Registra um acesso à página (page view). Best-effort. */
/** UTM/origem valem o que está na URL ATUAL; só caem no first-touch se a URL não trouxer. */
function pickUtm(params: Attr, attr: Attr) {
  return {
    utm_source: params.utm_source || attr.utm_source || null,
    utm_medium: params.utm_medium || attr.utm_medium || null,
    utm_campaign: params.utm_campaign || attr.utm_campaign || null,
    origem: params.origem || params.src || attr.origem || null,
    gclid: params.gclid || attr.gclid || null,
  };
}

export async function recordPromo1010Visit(
  stage: LeadStage,
  attribution?: Attr,
  params?: Attr,
  landingPage?: string,
): Promise<void> {
  const u = pickUtm(params ?? {}, attribution ?? {});
  try {
    await fetch(`${LEADS_URL}/rest/v1/promo1010_visits`, {
      method: "POST",
      headers: headers({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        stage,
        utm_source: u.utm_source,
        utm_medium: u.utm_medium,
        utm_campaign: u.utm_campaign,
        origem: u.origem,
        url_params: params && Object.keys(params).length ? params : null,
        landing_page: landingPage || null,
      }),
    });
  } catch {
    // best-effort
  }
}

function readUrlParams(): Attr {
  if (typeof window === "undefined") return {};
  const out: Attr = {};
  try {
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (k) out[k.slice(0, 100)] = String(v).slice(0, 500);
    });
  } catch {
    // ignore
  }
  return out;
}

/** Registra um acesso usando atribuição + params da URL automaticamente. */
export async function trackPromo1010Visit(stage: LeadStage): Promise<void> {
  const landingPage =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`.slice(0, 300)
      : undefined;
  return recordPromo1010Visit(stage, getStoredAttribution(), readUrlParams(), landingPage);
}

export type UpsertLeadInput = {
  stage: LeadStage;
  status: LeadStatus;
  name?: string;
  email?: string;
  phone?: string;
  attribution?: Attr;
  params?: Attr;
  landingPage?: string;
};

/** Cria/atualiza o lead (parcial → completo) via RPC. Best-effort: não lança. */
export async function upsertPromo1010Lead(input: UpsertLeadInput): Promise<boolean> {
  const attr = input.attribution ?? {};
  const params = input.params ?? {};
  const u = pickUtm(params, attr);
  try {
    const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/promo1010_upsert_lead`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        p_visitor_id: getVisitorId(),
        p_stage: input.stage,
        p_status: input.status,
        p_name: input.name || null,
        p_email: input.email || null,
        p_phone: input.phone || null,
        p_utm_source: u.utm_source,
        p_utm_medium: u.utm_medium,
        p_utm_campaign: u.utm_campaign,
        p_origem: u.origem,
        p_gclid: u.gclid,
        p_attribution: Object.keys(attr).length ? attr : null,
        p_url_params: Object.keys(params).length ? params : null,
        p_landing_page: input.landingPage || null,
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export type FunnelRow = {
  dia: string;
  stage: LeadStage;
  status: LeadStatus;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  origem: string;
  total: number;
};

export type AcessoRow = {
  dia: string;
  stage: LeadStage;
  utm_source: string;
  utm_campaign: string;
  origem: string;
  acessos: number;
  visitantes: number;
};

export async function fetchPromo1010Funnel(): Promise<FunnelRow[]> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/promo1010_funnel?select=*`, { headers: headers() });
  if (!resp.ok) throw new Error(`funnel_${resp.status}`);
  const rows = (await resp.json()) as FunnelRow[];
  return Array.isArray(rows) ? rows : [];
}

export async function fetchPromo1010Acessos(): Promise<AcessoRow[]> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/promo1010_acessos?select=*`, { headers: headers() });
  if (!resp.ok) throw new Error(`acessos_${resp.status}`);
  const rows = (await resp.json()) as AcessoRow[];
  return Array.isArray(rows) ? rows : [];
}

export type LeadRow = {
  id: string;
  created_at: string;
  stage: LeadStage;
  status: LeadStatus;
  name: string | null;
  email: string | null;
  phone: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  origem: string | null;
};

/** Lista individual (com PII). Exige o token do dashboard. */
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
