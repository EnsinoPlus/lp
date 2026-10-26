/**
 * Grava os dados do checkout do Calc Machine Connect no NOSSO banco (sistema-b7).
 * Client-side porque o Worker do deploy não alcança o Supabase.
 * Chave anon é pública; a escrita passa pela RPC `cmc_record_checkout`
 * (SECURITY DEFINER) — a tabela tem RLS ligado e sem policies, então o REST
 * direto fica bloqueado. Best-effort: nunca lança nem trava o checkout.
 */

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

const VID_KEY = "cmc_vid";

function headers() {
  return {
    apikey: LEADS_ANON_KEY,
    Authorization: `Bearer ${LEADS_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

/** ID estável do visitante (liga a cobrança iniciada → paga). */
function getVisitorId(): string {
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

function readUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (k) out[k.slice(0, 100)] = String(v).slice(0, 500);
    });
  } catch {
    // ignore
  }
  return out;
}

export type CmcCheckoutInput = {
  chargeId?: string | null;
  nome?: string;
  email?: string;
  cpfCnpj?: string;
  productId?: string | number;
  planoLabel?: string;
  forma?: string | null;
  parcelas?: number | null;
  valor?: number | null;
  status?: "iniciado" | "pago" | "expirado";
};

/** Grava/atualiza o lead do checkout. Best-effort: não lança. */
export async function recordCmcCheckout(input: CmcCheckoutInput): Promise<void> {
  const params = readUrlParams();
  try {
    await fetch(`${LEADS_URL}/rest/v1/rpc/cmc_record_checkout`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        p_visitor_id: getVisitorId(),
        p_charge_id: input.chargeId ?? null,
        p_nome: input.nome ?? null,
        p_email: input.email ?? null,
        p_cpf_cnpj: input.cpfCnpj ?? null,
        p_product_id: input.productId != null ? String(input.productId) : null,
        p_plano_label: input.planoLabel ?? null,
        p_forma: input.forma ?? null,
        p_parcelas: input.parcelas ?? null,
        p_valor: input.valor ?? null,
        p_status: input.status ?? "iniciado",
        p_utm_source: params.utm_source || null,
        p_utm_medium: params.utm_medium || null,
        p_utm_campaign: params.utm_campaign || null,
        p_origem: params.origem || params.src || null,
        p_gclid: params.gclid || params.fbclid || null,
        p_url_params: Object.keys(params).length ? params : null,
        p_landing_page: `${window.location.pathname}${window.location.search}`.slice(0, 300),
      }),
    });
  } catch {
    // best-effort: a cobrança já foi criada; não atrapalha o usuário.
  }
}
