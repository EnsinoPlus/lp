/**
 * Leads de todas as páginas no dashboard central. A leitura exige o login do dashboard (RPC leads_central).
 * saveCctLead grava os dados do formulário do CCT: a senha nunca passa por aqui.
 */

import { cmcAtribuicao } from "@/lib/cmc-attribution";

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

const headers = () => ({
  apikey: LEADS_ANON_KEY,
  Authorization: `Bearer ${LEADS_ANON_KEY}`,
  "Content-Type": "application/json",
});

export type LeadEtapa = "pagou" | "cadastrou" | "cobranca" | "avaliou" | "enviou" | "expirou" | "preencheu";

export type LeadCentral = {
  pagina: string;
  quando: string;
  created_at: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  etapa: LeadEtapa;
  oferta: string | null;
  valor: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

export async function fetchLeadsCentral(email: string, senha: string, desde: Date | null): Promise<LeadCentral[] | null> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/leads_central`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_email: email, p_senha: senha, p_desde: desde ? desde.toISOString() : null }),
  });
  if (!resp.ok) return null;
  return (await resp.json()) as LeadCentral[];
}

function visitorId(): string {
  try {
    let id = localStorage.getItem("cmc_vid") ?? "";
    if (!/^[a-z0-9-]{8,64}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem("cmc_vid", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Grava o lead do CCT. Best-effort: nunca lança nem atrapalha o cadastro. */
export function saveCctLead(d: {
  nome?: string;
  email?: string;
  telefone?: string;
  profissao?: string;
  etapa: "preencheu" | "enviou" | "cadastrou";
}): void {
  if (typeof window === "undefined") return;
  const origem = cmcAtribuicao();
  try {
    void fetch(`${LEADS_URL}/rest/v1/rpc/cct_save_lead`, {
      method: "POST",
      keepalive: true,
      headers: headers(),
      body: JSON.stringify({
        p_visitor_id: visitorId(),
        p_nome: d.nome ?? null,
        p_email: d.email ?? null,
        p_telefone: d.telefone ?? null,
        p_profissao: d.profissao ?? null,
        p_etapa: d.etapa,
        p_utm_source: origem.utm_source ?? null,
        p_utm_medium: origem.utm_medium ?? null,
        p_utm_campaign: origem.utm_campaign ?? null,
        p_url_params: Object.keys(origem).length ? origem : null,
        p_landing_page: `${window.location.pathname}${window.location.search}`.slice(0, 300),
      }),
    }).catch(() => {});
  } catch {
    // best-effort
  }
}
