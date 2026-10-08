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

export const registerPromo1010Lead = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const name = (data.name ?? "").trim();
    const phoneE164 = toE164BR(data.phone);

    const [brevo, n8n] = await Promise.all([
      addToBrevo(data.stage, email, name, phoneE164),
      fireN8n(data.stage, {
        stage: data.stage,
        source: "lp:suiteplus-promo-1010",
        name: name || undefined,
        email,
        phone: phoneE164 || data.phone || undefined,
        attribution: data.attribution || undefined,
        submitted_at: new Date().toISOString(),
      }),
    ]);

    return { ok: brevo.ok || n8n.ok, brevo, n8n };
  });
