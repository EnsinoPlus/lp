// Confere as cobranças do Calc Machine Connect na API de Assinaturas e, quando pagas,
// marca no banco e envia o Purchase pela Conversions API do Meta (mesmo event_id do Pixel,
// o Meta deduplica). Pega quem pagou com a página fechada. Chamada pelo pg_cron.
// O "pago" gravado pela página nunca é confiado: só envia após confirmar na API.

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN")?.trim();
const META_PIXEL = Deno.env.get("META_PIXEL_ID")?.trim() || "984600751325289";
const META_TEST_CODE = Deno.env.get("META_TEST_EVENT_CODE")?.trim();
const ASSINATURAS = "https://assinaturas.ensinoplus.com.br/api/public/mcp";

const SETE_DIAS = 7 * 86400000;
const DOIS_DIAS = 2 * 86400000;
const QUINZE_DIAS = 15 * 86400000;
const UMA_HORA = 3600000;

type Lead = {
  id: string;
  created_at: string;
  charge_id: string;
  email: string | null;
  telefone: string | null;
  nome: string | null;
  visitor_id: string | null;
  product_id: string | null;
  plano_label: string | null;
  valor: number | null;
  status: string;
  paid_at: string | null;
  landing_page: string | null;
  url_params: Record<string, string> | null;
  fbp: string | null;
  fbc: string | null;
  client_user_agent: string | null;
  client_ip: string | null;
  status_checked_at: string | null;
};

const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

const atualizar = (id: string, campos: Record<string, unknown>) =>
  rest(`cmc_checkout_leads?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(campos),
  });

async function sha256(v: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("");
}

function telefoneE164(t: string | null) {
  const d = (t || "").replace(/\D/g, "");
  if (d.length < 10) return null;
  return d.length <= 11 ? `55${d}` : d;
}

async function enviarPurchase(l: Lead, eventTimeMs: number) {
  const partes = (l.nome || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const tel = telefoneE164(l.telefone);
  const fbclid = l.url_params?.fbclid;
  const fbc = l.fbc || (fbclid ? `fb.1.${new Date(l.created_at).getTime()}.${fbclid}` : undefined);

  const userData: Record<string, unknown> = { country: [await sha256("br")] };
  if (l.email) userData.em = [await sha256(l.email.trim().toLowerCase())];
  if (tel) userData.ph = [await sha256(tel)];
  if (partes[0]) userData.fn = [await sha256(partes[0])];
  if (partes.length > 1) userData.ln = [await sha256(partes[partes.length - 1])];
  if (l.visitor_id) userData.external_id = [await sha256(l.visitor_id)];
  if (l.fbp) userData.fbp = l.fbp;
  if (fbc) userData.fbc = fbc;
  if (l.client_user_agent) userData.client_user_agent = l.client_user_agent;
  if (l.client_ip) userData.client_ip_address = l.client_ip;

  const resp = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(eventTimeMs / 1000),
          event_id: `purchase_${l.charge_id}`,
          action_source: "website",
          event_source_url: `https://lp.ensinoplus.com.br${l.landing_page || "/calc-machine-connect/assinar"}`,
          user_data: userData,
          custom_data: {
            value: Number(l.valor || 0),
            currency: "BRL",
            content_name: l.plano_label || "Calc Machine Connect",
            content_ids: l.product_id ? [l.product_id] : undefined,
            content_type: "product",
          },
        },
      ],
      ...(META_TEST_CODE ? { test_event_code: META_TEST_CODE } : {}),
      access_token: META_TOKEN,
    }),
  });
  return { ok: resp.ok, corpo: (await resp.text()).slice(0, 500) };
}

Deno.serve(async (req) => {
  const seg = await rest("cmc_cron_secret?select=secret&id=eq.1").then((r) => r.json());
  if (!seg?.[0]?.secret || req.headers.get("x-cmc-cron") !== seg[0].secret) {
    return new Response("unauthorized", { status: 401 });
  }
  const dry = new URL(req.url).searchParams.has("dry");
  const agora = Date.now();
  const desde = new Date(agora - QUINZE_DIAS).toISOString();
  const campos =
    "id,created_at,charge_id,email,telefone,nome,visitor_id,product_id,plano_label,valor,status,paid_at,landing_page,url_params,fbp,fbc,client_user_agent,client_ip,status_checked_at";
  const leads: Lead[] = await rest(
    `cmc_checkout_leads?select=${campos}&charge_id=not.is.null&email=not.is.null&status=in.(iniciado,pago)` +
      `&or=(capi_status.is.null,capi_status.in.(sem_token,erro))&created_at=gte.${desde}` +
      `&order=status_checked_at.asc.nullsfirst&limit=60`,
  ).then((r) => r.json());

  const resumo = { analisadas: 0, pendentes: 0, pagas: 0, expiradas: 0, enviadas: 0, sem_token: 0, erros: 0, falha_api: 0 };
  const amostra: unknown[] = [];

  for (const l of leads) {
    const idade = agora - new Date(l.created_at).getTime();
    const ultima = l.status_checked_at ? agora - new Date(l.status_checked_at).getTime() : Infinity;
    if (!dry && idade > DOIS_DIAS && ultima < UMA_HORA) continue;
    resumo.analisadas++;

    let d: Record<string, unknown>;
    try {
      const r = await fetch(`${ASSINATURAS}/charge/${encodeURIComponent(l.charge_id)}?userEmail=${encodeURIComponent(l.email!)}`);
      if (!r.ok) throw new Error(String(r.status));
      d = await r.json();
    } catch (e) {
      resumo.falha_api++;
      if (dry) amostra.push({ falha: String(e) });
      continue;
    }

    if (dry) {
      amostra.push({ status_banco: l.status, status_api: d.status, chaves: Object.keys(d) });
      continue;
    }

    if (d.status === "paid") {
      resumo.pagas++;
      const dataApi = Date.parse(String(d.pagoEm ?? ""));
      const pagoEm = Number.isNaN(dataApi) ? (l.paid_at ? new Date(l.paid_at).getTime() : agora) : dataApi;
      const base: Record<string, unknown> = {
        status: "pago",
        paid_at: new Date(pagoEm).toISOString(),
        status_checked_at: new Date().toISOString(),
      };
      if (agora - pagoEm > SETE_DIAS) {
        await atualizar(l.id, { ...base, capi_status: "fora_janela" });
      } else if (!META_TOKEN) {
        resumo.sem_token++;
        await atualizar(l.id, { ...base, capi_status: "sem_token" });
      } else {
        const env = await enviarPurchase(l, pagoEm).catch((e) => ({ ok: false, corpo: String(e) }));
        if (env.ok) resumo.enviadas++;
        else resumo.erros++;
        await atualizar(l.id, {
          ...base,
          capi_status: env.ok ? "enviado" : "erro",
          capi_at: new Date().toISOString(),
          capi_resposta: env.corpo,
        });
      }
    } else if (d.status === "expired" || d.status === "canceled") {
      resumo.expiradas++;
      await atualizar(l.id, { status: "expirado", capi_status: "nao_enviar", status_checked_at: new Date().toISOString() });
    } else {
      resumo.pendentes++;
      await atualizar(l.id, { status_checked_at: new Date().toISOString() });
    }
  }

  return Response.json({ dry, token_configurado: !!META_TOKEN, total: leads.length, resumo, ...(dry ? { amostra } : {}) });
});
