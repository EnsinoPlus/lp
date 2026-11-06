/**
 * Leads das promoções de créditos (Primeira Recarga e 11.11) e controle manual da liberação.
 * A liberação em si é feita na plataforma: aqui só se registra. Todas as RPCs exigem o login do dashboard.
 */

const LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const LEADS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

export type CreditoStatus = "aguardando" | "pago" | "liberado" | "nao_pagou";

export type CreditoLead = {
  id: string;
  created_at: string;
  updated_at: string;
  promo: "primeira-recarga" | "11-11";
  pacote: string | null;
  creditos: number | null;
  valor: number | null;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  status: CreditoStatus;
  pago_em: string | null;
  liberado_em: string | null;
  notas: string | null;
  origem_cadastro: string;
  utm_source: string | null;
  utm_campaign: string | null;
};

export type CreditoNovo = {
  promo: CreditoLead["promo"];
  pacote: string;
  creditos: number | null;
  valor: number | null;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  notas: string;
};

async function rpc(fn: string, body: Record<string, unknown>) {
  return fetch(`${LEADS_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: LEADS_ANON_KEY,
      Authorization: `Bearer ${LEADS_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function listCreditos(email: string, senha: string): Promise<CreditoLead[] | null> {
  const resp = await rpc("creditos_list", { p_email: email, p_senha: senha });
  if (!resp.ok) return null;
  return (await resp.json()) as CreditoLead[];
}

export async function addCredito(email: string, senha: string, n: CreditoNovo): Promise<boolean> {
  const resp = await rpc("creditos_add", {
    p_email: email,
    p_senha: senha,
    p_promo: n.promo,
    p_pacote: n.pacote,
    p_creditos: n.creditos,
    p_valor: n.valor,
    p_nome: n.nome,
    p_lead_email: n.email,
    p_telefone: n.telefone,
    p_origem: n.origem,
    p_notas: n.notas,
  });
  return resp.ok;
}

export async function updateCredito(
  email: string,
  senha: string,
  id: string,
  mudanca: { status?: CreditoStatus; notas?: string },
): Promise<boolean> {
  const resp = await rpc("creditos_update", {
    p_email: email,
    p_senha: senha,
    p_id: id,
    p_status: mudanca.status ?? null,
    p_notas: mudanca.notas ?? null,
  });
  return resp.ok;
}
