import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  email: z.string().email(),
  eventId: z.string().uuid(),
  eventSourceUrl: z.string().url(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
});

async function readRuntimeEnv(name: string): Promise<string | undefined> {
  try {
    const value = process.env[name]?.trim();
    if (value) return value;
  } catch {
    // Fora do Node.
  }

  try {
    const mod = await import("cloudflare:workers");
    const value = (mod as { env?: Record<string, unknown> }).env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  } catch {
    // Fora do Cloudflare.
  }
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Envia o Lead server-side. O token nunca é enviado ao navegador. */
export const sendMetaLead = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const [pixelId, accessToken] = await Promise.all([
      readRuntimeEnv("META_PIXEL_ID"),
      readRuntimeEnv("META_CONVERSIONS_API_TOKEN"),
    ]);

    if (!pixelId || !accessToken) return { ok: false as const, reason: "not_configured" as const };

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: data.eventId,
              action_source: "website",
              event_source_url: data.eventSourceUrl,
              user_data: {
                em: [await sha256(data.email.trim().toLowerCase())],
                fbp: data.fbp,
                fbc: data.fbc,
              },
            },
          ],
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        console.error("[meta] Conversions API retornou", response.status);
        return { ok: false as const, reason: "meta_error" as const, status: response.status };
      }

      return { ok: true as const };
    } catch (error) {
      console.error("[meta] Falha ao enviar Lead para Conversions API", error);
      return { ok: false as const, reason: "network_error" as const };
    }
  });
