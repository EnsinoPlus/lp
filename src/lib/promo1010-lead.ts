import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Lead da campanha 10 do 10.
 * - Brevo: adiciona o contato à lista do funil (página 1 ou checkout) — segmentação/CRM.
 * - n8n: dispara a campanha (e-mail + WhatsApp oficial/WABA) via webhook, roteada por `stage`.
 *
 * WABA id / phone id e os templates de WhatsApp ficam no n8n; aqui só encaminhamos o payload.
 * Todas as integrações são best-effort: nunca derrubam o fluxo do usuário (ex.: ir ao checkout).
 */

/**
 * Banco de LEADS padrão = projeto da agência (sistema-b7). Chave anon é pública
 * (protegida por RLS: anon só INSERE, não lê PII). Pode ser sobrescrito por env.
 */
const DEFAULT_LEADS_URL = "https://rartcafydsaocdzshqcx.supabase.co";
const DEFAULT_LEADS_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcnRjYWZ5ZHNhb2NkenNocWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTM5ODgsImV4cCI6MjEwNDUyOTk4OH0.kM0xlo6YjKWY1i7jqrYwwG1RkkVHMFte12K9_AHuT-I";

/** Lê env em runtime no Worker (Cloudflare) e no Node. */
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

/** Normaliza telefone BR para E.164 (ex.: "(11) 98888-7777" -> "+5511988887777"). */
function toE164BR(raw: string | undefined): string | undefined {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  return `+${digits}`;
}

const inputSchema = z.object({
  stage: z.enum(["page1", "checkout"]),
  name: z.string().trim().max(120).optional(),
  email: z.string().email(),
  phone: z.string().trim().max(40).optional(),
  attribution: z.record(z.string()).optional(),
  /** TODOS os parâmetros da URL (não só marketing). */
  params: z.record(z.string()).optional(),
  landingPage: z.string().max(300).optional(),
});

type Stage = z.infer<typeof inputSchema>["stage"];

async function resolveListId(stage: Stage): Promise<number | undefined> {
  const name =
    stage === "page1"
      ? "BREVO_PROMO1010_PAGE1_LIST_ID"
      : "BREVO_PROMO1010_CHECKOUT_LIST_ID";
  const raw = await readRuntimeEnv(name);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

async function addToBrevo(
  stage: Stage,
  email: string,
  name: string,
  phoneE164: string | undefined,
): Promise<{ ok: boolean; reason?: string; listId?: number }> {
  const apiKey = await readRuntimeEnv("BREVO_API_KEY");
  if (!apiKey) return { ok: false, reason: "missing_api_key" };

  const listId = await resolveListId(stage);
  if (!listId) return { ok: false, reason: "missing_list_id" };

  const attributes: Record<string, string> = {};
  if (name) attributes.FIRSTNAME = name;
  if (phoneE164) {
    attributes.SMS = phoneE164;
    attributes.WHATSAPP = phoneE164;
  }

  try {
    const resp = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        attributes: Object.keys(attributes).length ? attributes : undefined,
        listIds: [listId],
        updateEnabled: true,
      }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error("[promo1010] Brevo falhou", stage, listId, resp.status, body);
      return { ok: false, reason: `brevo_${resp.status}`, listId };
    }
    return { ok: true, listId };
  } catch (err) {
    console.error("[promo1010] Brevo erro de rede:", err);
    return { ok: false, reason: "network_error" };
  }
}

async function fireN8n(
  stage: Stage,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; reason?: string }> {
  // URL por stage (opcional) ou única com o stage no corpo.
  const perStage =
    stage === "page1"
      ? await readRuntimeEnv("N8N_PROMO1010_PAGE1_WEBHOOK_URL")
      : await readRuntimeEnv("N8N_PROMO1010_CHECKOUT_WEBHOOK_URL");
  const url = perStage || (await readRuntimeEnv("N8N_PROMO1010_WEBHOOK_URL"));
  if (!url) return { ok: false, reason: "missing_webhook_url" };

  const wabaId = await readRuntimeEnv("WABA_ID");
  const wabaPhoneId = await readRuntimeEnv("WABA_PHONE_NUMBER_ID");

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        waba_id: wabaId || undefined,
        waba_phone_number_id: wabaPhoneId || undefined,
      }),
    });
    if (!resp.ok) {
      console.error("[promo1010] n8n webhook falhou", stage, resp.status);
      return { ok: false, reason: `n8n_${resp.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[promo1010] n8n erro de rede:", err);
    return { ok: false, reason: "network_error" };
  }
}

async function insertSupabase(
  stage: Stage,
  row: {
    name: string;
    email: string;
    phoneRaw: string | undefined;
    phoneE164: string | undefined;
    attribution?: Record<string, string>;
    params?: Record<string, string>;
    landingPage?: string;
  },
): Promise<{ ok: boolean; reason?: string }> {
  // Banco de LEADS = sistema-b7 por padrão (não o Supabase de login do cliente).
  const url = (await readRuntimeEnv("SUPABASE_LEADS_URL")) || DEFAULT_LEADS_URL;
  const key =
    (await readRuntimeEnv("SUPABASE_LEADS_KEY")) ||
    (await readRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY")) ||
    DEFAULT_LEADS_KEY;
  if (!url || !key) return { ok: false, reason: "missing_supabase_env" };

  const attr = row.attribution || {};
  const body = {
    stage,
    name: row.name || null,
    email: row.email,
    phone: row.phoneE164 || row.phoneRaw || null,
    utm_source: attr.utm_source || null,
    utm_medium: attr.utm_medium || null,
    utm_campaign: attr.utm_campaign || null,
    origem: attr.origem || null,
    gclid: attr.gclid || null,
    attribution: Object.keys(attr).length ? attr : null,
    url_params: row.params && Object.keys(row.params).length ? row.params : null,
    landing_page: row.landingPage || null,
  };

  try {
    const resp = await fetch(`${url.replace(/\/$/, "")}/rest/v1/promo1010_leads`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      console.error("[promo1010] Supabase insert falhou", stage, resp.status, txt);
      return { ok: false, reason: `supabase_${resp.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[promo1010] Supabase erro de rede:", err);
    return { ok: false, reason: "network_error" };
  }
}

export const registerPromo1010Lead = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const name = (data.name ?? "").trim();
    const phoneE164 = toE164BR(data.phone);

    const [brevo, n8n, supabase] = await Promise.all([
      addToBrevo(data.stage, email, name, phoneE164),
      fireN8n(data.stage, {
        stage: data.stage,
        source: "lp:suiteplus-promo-1010",
        name: name || undefined,
        email,
        phone: phoneE164 || data.phone || undefined,
        attribution: data.attribution || undefined,
        params: data.params || undefined,
        landing_page: data.landingPage || undefined,
        submitted_at: new Date().toISOString(),
      }),
      insertSupabase(data.stage, {
        name,
        email,
        phoneRaw: data.phone,
        phoneE164,
        attribution: data.attribution,
        params: data.params,
        landingPage: data.landingPage,
      }),
    ]);

    return { ok: brevo.ok || n8n.ok || supabase.ok, brevo, n8n, supabase };
  });
