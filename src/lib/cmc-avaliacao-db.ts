/**
 * Avaliações/depoimentos do Calc Machine Connect (troca por +1 dia de teste).
 * Client-side (o Worker do deploy não alcança o Supabase). Chave anon é pública:
 * a escrita das avaliações passa pela RPC `cmc_record_avaliacao`; o painel usa
 * um token (senha) conferido no servidor. Tabela com RLS e sem policies de leitura.
 */

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";
const BUCKET = "cmc-avaliacoes";

const VID_KEY = "cmc_vid";

function headers(extra?: Record<string, string>) {
  return {
    apikey: LEADS_ANON_KEY,
    Authorization: `Bearer ${LEADS_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

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

export type MediaUpload = { url: string; tipo: "image" | "video" };

/** Sobe foto/vídeo pro Storage. Lança em erro (pra avisar o usuário). */
export async function uploadCmcAvaliacaoMedia(file: File): Promise<MediaUpload> {
  const tipo: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  const ext = (file.name.split(".").pop() || (tipo === "video" ? "mp4" : "jpg"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const path = `${crypto.randomUUID()}.${ext}`;
  const resp = await fetch(`${LEADS_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: LEADS_ANON_KEY,
      Authorization: `Bearer ${LEADS_ANON_KEY}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`upload_falhou_${resp.status}${t ? `: ${t.slice(0, 120)}` : ""}`);
  }
  return { url: `${LEADS_URL}/storage/v1/object/public/${BUCKET}/${path}`, tipo };
}

export type AvaliacaoInput = {
  nome?: string;
  email?: string;
  nota: number;
  depoimento: string;
  mediaUrl?: string | null;
  mediaTipo?: string | null;
};

/** Grava a avaliação. Lança em erro de validação/rede. Retorna o id criado. */
export async function recordCmcAvaliacao(input: AvaliacaoInput): Promise<string> {
  const params = readUrlParams();
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/cmc_record_avaliacao`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      p_nome: input.nome ?? null,
      p_email: input.email ?? null,
      p_nota: input.nota,
      p_depoimento: input.depoimento,
      p_media_url: input.mediaUrl ?? null,
      p_media_tipo: input.mediaTipo ?? null,
      p_visitor_id: getVisitorId(),
      p_utm_source: params.utm_source || null,
      p_utm_medium: params.utm_medium || null,
      p_utm_campaign: params.utm_campaign || null,
      p_origem: params.origem || params.src || null,
      p_gclid: params.gclid || params.fbclid || null,
      p_url_params: Object.keys(params).length ? params : null,
      p_landing_page: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    }),
  });
  if (!resp.ok) {
    const d = await resp.json().catch(() => ({}) as { message?: string });
    throw new Error((d as { message?: string }).message || `erro_${resp.status}`);
  }
  const id = await resp.json().catch(() => null);
  return typeof id === "string" ? id : "";
}

// ----------------- Painel interno (token) -----------------

export type AvaliacaoRow = {
  id: string;
  created_at: string;
  nome: string | null;
  email: string | null;
  nota: number;
  depoimento: string;
  media_url: string | null;
  media_tipo: string | null;
  status: "recebida" | "liberada" | "rejeitada";
  utm_source: string | null;
};

export async function listCmcAvaliacoes(
  email: string,
  senha: string,
): Promise<{ ok: true; rows: AvaliacaoRow[] } | { ok: false; status: number }> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/cmc_avaliacoes_list`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_email: email, p_senha: senha, p_limit: 2000 }),
  });
  if (!resp.ok) return { ok: false, status: resp.status };
  const rows = (await resp.json()) as AvaliacaoRow[];
  return { ok: true, rows: Array.isArray(rows) ? rows : [] };
}

export async function setCmcAvaliacaoStatus(
  email: string,
  senha: string,
  id: string,
  status: "recebida" | "liberada" | "rejeitada",
): Promise<boolean> {
  const resp = await fetch(`${LEADS_URL}/rest/v1/rpc/cmc_avaliacoes_set_status`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_email: email, p_senha: senha, p_id: id, p_status: status }),
  });
  return resp.ok;
}
