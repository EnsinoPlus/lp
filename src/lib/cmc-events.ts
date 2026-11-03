/**
 * Eventos das páginas do Calc Machine Connect gravados no NOSSO banco (sistema-b7),
 * em paralelo ao Pixel do Meta, para o dashboard interno (/calc-machine-connect/dashboard).
 * Client-side (o Worker do deploy não alcança o Supabase). Escrita pela RPC
 * `cmc_track_event`; leitura só pela RPC `cmc_dashboard`, que exige e-mail + senha.
 */

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

// Mesma chave do checkout e da avaliação: liga a visita ao lead.
const VID_KEY = "cmc_vid";

function headers() {
  return {
    apikey: LEADS_ANON_KEY,
    Authorization: `Bearer ${LEADS_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VID_KEY) ?? "";
    if (!/^[a-z0-9-]{8,64}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Grava um evento. Best-effort: nunca lança. keepalive para sobreviver à troca de página. */
export function trackCmcEvent(event: string, params?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URLSearchParams(window.location.search);
    void fetch(`${LEADS_URL}/rest/v1/rpc/cmc_track_event`, {
      method: "POST",
      keepalive: true,
      headers: headers(),
      body: JSON.stringify({
        p_event: event,
        p_page: window.location.pathname,
        p_params: params && Object.keys(params).length ? params : null,
        p_visitor_id: getVisitorId() || null,
        p_utm_source: url.get("utm_source"),
        p_utm_medium: url.get("utm_medium"),
        p_utm_campaign: url.get("utm_campaign"),
        p_referrer: document.referrer || null,
      }),
    }).catch(() => {});
  } catch {
    // best-effort
  }
}

// ----------------- Dashboard (e-mail + senha) -----------------

export type CmcDashboard = {
  resumo: {
    visitantes: number;
    pageviews: number;
    cliques_assinar: number;
    cliques_teste: number;
    cliques_whatsapp: number;
    checkouts: number;
    pagos: number;
    expirados: number;
    valor_pago: number;
    avaliacoes: number;
    nota_media: number | null;
    avaliacoes_pendentes: number;
  };
  eventos: { event: string; total: number; visitantes: number }[];
  paginas: { page: string; pageviews: number; visitantes: number }[];
  origens: {
    origem: string;
    visitantes: number;
    cliques_assinar: number;
    checkouts: number;
    pagos: number;
    valor_pago: number;
  }[];
  por_dia: { dia: string; visitantes: number; checkouts: number; pagos: number }[];
  checkouts: {
    created_at: string;
    updated_at: string;
    nome: string | null;
    email: string | null;
    plano_label: string | null;
    forma: string | null;
    parcelas: number | null;
    valor: number | null;
    status: "iniciado" | "pago" | "expirado";
    utm_source: string | null;
    utm_campaign: string | null;
    charge_id: string | null;
  }[];
  eventos_recentes: {
    created_at: string;
    event: string;
    page: string | null;
    params: Record<string, string> | null;
    utm_source: string | null;
    visitante: string | null;
  }[];
};

export async function fetchCmcDashboard(
  email: string,
  senha: string,
  desde: Date | null,
): Promise<{ ok: true; data: CmcDashboard } | { ok: false; status: number }> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/cmc_dashboard`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_email: email, p_senha: senha, p_desde: desde ? desde.toISOString() : null }),
  });
  if (!resp.ok) return { ok: false, status: resp.status };
  return { ok: true, data: (await resp.json()) as CmcDashboard };
}

export type CmcEtapa = "pagou" | "gerou_cobranca" | "clicou" | "visitou" | "sem_rastreio";

export type CmcContato = {
  chave: string;
  nome: string | null;
  email: string;
  documento: string | null;
  origem: string | null;
  campanha: string | null;
  plano: string | null;
  forma: string | null;
  primeiro_contato: string;
  ultima_atividade: string;
  valor_pago: number;
  cobrancas: number;
  avaliou: boolean;
  expirou: boolean;
  etapa: CmcEtapa;
  acoes: number;
  jornada: {
    quando: string;
    tipo: "evento" | "checkout" | "avaliacao";
    nome: string;
    pagina: string | null;
    detalhes: Record<string, unknown> | null;
  }[];
};

export type CmcFunil = {
  visitantes: number;
  viram_planos: number;
  clicaram_assinar: number;
  clicaram_teste: number;
  chegaram_checkout: number;
  geraram_cobranca: number;
  pagaram: number;
};

async function rpcPainel<T>(fn: string, email: string, senha: string, desde: Date | null) {
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_email: email, p_senha: senha, p_desde: desde ? desde.toISOString() : null }),
  });
  if (!resp.ok) return { ok: false as const, status: resp.status };
  return { ok: true as const, data: (await resp.json()) as T };
}

export const fetchCmcContatos = (email: string, senha: string, desde: Date | null) =>
  rpcPainel<CmcContato[]>("cmc_dashboard_contatos", email, senha, desde);

export const fetchCmcFunil = (email: string, senha: string, desde: Date | null) =>
  rpcPainel<CmcFunil>("cmc_funil_visitantes", email, senha, desde);
