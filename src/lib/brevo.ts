import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_CCT_LIST_ID = 46;

/**
 * Lê env em runtime no Worker (Cloudflare) e no Node.
 * Import dinâmico de cloudflare:workers — este módulo também é referenciado no client (RPC stub).
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

const inputSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

/**
 * Adiciona o contato à lista Brevo do funil CCT (lista 46).
 * API key só no servidor (BREVO_API_KEY) — nunca VITE_.
 */
export const addCctContactToBrevo = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const apiKey = await readRuntimeEnv("BREVO_API_KEY");
    if (!apiKey) {
      console.error(
        "[brevo] BREVO_API_KEY ausente no Worker. Defina no Easypanel e reinicie o serviço (entrypoint injeta no wrangler.json).",
      );
      return { ok: false as const, reason: "missing_api_key" as const };
    }

    const listIdRaw = await readRuntimeEnv("BREVO_CCT_FUNNEL_LIST_ID");
    const listId = Number(listIdRaw ?? DEFAULT_CCT_LIST_ID) || DEFAULT_CCT_LIST_ID;
    const email = data.email.trim().toLowerCase();
    const name = (data.name ?? "").trim();

    try {
      const resp = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          attributes: name ? { FIRSTNAME: name } : undefined,
          listIds: [listId],
          updateEnabled: true,
        }),
      });

      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        console.error("[brevo] falha ao adicionar contato lista", listId, resp.status, body);
        return { ok: false as const, reason: "brevo_error" as const, status: resp.status };
      }

      console.info("[brevo] contato adicionado à lista", listId, email);
      return { ok: true as const, listId };
    } catch (err) {
      console.error("[brevo] erro de rede:", err);
      return { ok: false as const, reason: "network_error" as const };
    }
  });
