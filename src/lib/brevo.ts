import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_CCT_LIST_ID = 46;

function readEnv(name: string): string | undefined {
  try {
    return process.env[name]?.trim() || undefined;
  } catch {
    return undefined;
  }
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
    const apiKey = readEnv("BREVO_API_KEY");
    if (!apiKey) {
      console.warn("[brevo] BREVO_API_KEY ausente — contato não enviado à lista CCT");
      return { ok: false as const, reason: "missing_api_key" };
    }

    const listId =
      Number(readEnv("BREVO_CCT_FUNNEL_LIST_ID") ?? DEFAULT_CCT_LIST_ID) || DEFAULT_CCT_LIST_ID;
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
        console.error("[brevo] falha ao adicionar contato:", resp.status, body);
        return { ok: false as const, reason: "brevo_error" };
      }

      return { ok: true as const, listId };
    } catch (err) {
      console.error("[brevo] erro de rede:", err);
      return { ok: false as const, reason: "network_error" };
    }
  });
