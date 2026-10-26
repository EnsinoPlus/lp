import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// Página de assinatura do Calc Machine Connect (checkout): cópia da página assinaturas.ensinoplus.com.br/assinar.
// Ela fala direto com a API pública do Assinaturas (planos, cobrança por Pix/cartão e acompanhamento do pagamento),
// que aceita chamadas de outros sites (CORS aberto). O CSS fica isolado em .asn.
// Aceita ?plano=<id> para já deixar um plano marcado.

export const Route = createFileRoute("/calc-machine-connect/assinar/")({
  head: () => ({
    meta: [
      { title: "Assinar Calc Machine Connect" },
      {
        name: "description",
        content:
          "Assine o Calc Machine Connect com Pix ou cartão: cálculos trabalhistas no PJe-Calc pela sua IA, sem créditos por uso.",
      },
    ],
  }),
  component: Assinar,
});

const API = "https://assinaturas.ensinoplus.com.br/api/public/mcp";
const PLATAFORMA_URL = "https://suite.ensinoplus.com.br/";

type Plano = {
  id: string | number;
  label: string;
  description?: string;
  name: string;
  prices: Record<string, number>;
  formas_disponiveis?: string[];
  cartao_parcelas_max?: number; // > 1 = cartao em ate N vezes sem juros (cobranca unica, nao renova)
};

const ROTULO: Record<string, string> = {
  pix: "Pix (pagamento único)",
  pix_recorrente: "Pix Automático (renova sozinho)",
  card: "Cartão (renova sozinho)",
};
const brl = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

function Assinar() {
  useEffect(() => {
    const raiz = document.querySelector<HTMLElement>(".asn");
    if (!raiz) return;
    const $ = <T extends HTMLElement = HTMLElement>(id: string) => raiz.querySelector<T>(`#${id}`)!;

    let planos: Plano[] = [];
    let plano: Plano | undefined;
    let forma: string | null = null;
    let chargeId: string | null = null;
    let emailCobranca = "";
    let valorCompra = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelado = false;

    // Pixel Meta (carregado globalmente no app).
    const fbq = (...args: unknown[]) => {
      try {
        (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.(...args);
      } catch {
        /* pixel ausente */
      }
    };

    const mostrarErro = (msg: string) => {
      $("erro").textContent = msg;
      $("erro").hidden = !msg;
    };

    const maxParcelas = () => Number(plano?.cartao_parcelas_max) || 1;
    const parcelado = () => forma === "card" && maxParcelas() > 1;
    const rotulo = (f: string) => (f === "card" && maxParcelas() > 1 ? `Cartão em até ${maxParcelas()}x sem juros` : ROTULO[f] || f);

    const renderParcelas = () => {
      $("boxParcelas").hidden = !parcelado();
      if (!parcelado()) return;
      const total = plano!.prices.card;
      const max = maxParcelas();
      $("parcelas").innerHTML = Array.from({ length: max }, (_, i) => i + 1)
        .map((n) => `<option value="${n}" ${n === max ? "selected" : ""}>${n === 1 ? `À vista: ${brl(total)}` : `${n}x de ${brl(total / n)} sem juros`}</option>`)
        .join("");
    };

    const renderFormas = () => {
      const el = $("formas");
      el.innerHTML = "";
      (plano?.formas_disponiveis || []).forEach((f, i) => {
        const l = document.createElement("label");
        l.className = "opcao";
        l.innerHTML = `<input type="radio" name="forma" value="${esc(f)}" ${i === 0 ? "checked" : ""}><div>${esc(rotulo(f))}</div><span class="v">${brl(plano!.prices[f])}</span>`;
        el.appendChild(l);
      });
      forma = plano?.formas_disponiveis?.[0] || null;
      el.onchange = (e) => {
        forma = (e.target as HTMLInputElement).value;
        renderParcelas();
      };
      renderParcelas();
    };

    const renderPlanos = (preferido: string | null) => {
      const el = $("planos");
      el.innerHTML = "";
      planos.forEach((p) => {
        const menor = Math.min(...Object.values(p.prices));
        const l = document.createElement("label");
        l.className = "opcao";
        l.innerHTML = `<input type="radio" name="plano" value="${esc(p.id)}"><div>${esc(p.label)}<small>${esc(p.description || p.name)}</small></div><span class="v">a partir de ${brl(menor)}${(p.cartao_parcelas_max || 1) > 1 && p.prices.card ? `<small>ou ${p.cartao_parcelas_max}x de ${brl(p.prices.card / p.cartao_parcelas_max!)} sem juros</small>` : ""}</span>`;
        el.appendChild(l);
      });
      plano = planos.find((p) => String(p.id) === String(preferido)) || planos[0];
      const radio = el.querySelector<HTMLInputElement>(`input[value="${plano?.id}"]`);
      if (radio) radio.checked = true;
      el.onchange = (e) => {
        plano = planos.find((p) => String(p.id) === (e.target as HTMLInputElement).value);
        renderFormas();
      };
      renderFormas();
    };

    (async () => {
      try {
        const d = await (await fetch(`${API}/plans`)).json();
        if (cancelado) return;
        planos = d.plans || [];
        if (!planos.length) {
          $("carregando").textContent = "Nenhum plano disponível no momento.";
          return;
        }
        renderPlanos(new URLSearchParams(location.search).get("plano"));
        ($("linkPlataforma") as HTMLAnchorElement).href = PLATAFORMA_URL;
        $("carregando").hidden = true;
        $("form").hidden = false;
      } catch {
        if (!cancelado) $("carregando").textContent = "Não foi possível carregar os planos. Tente novamente em instantes.";
      }
    })();

    const acompanhar = () => {
      timer = setInterval(async () => {
        try {
          const d = await (await fetch(`${API}/charge/${chargeId}?userEmail=${encodeURIComponent(emailCobranca)}`)).json();
          if (d.status === "paid") {
            if (timer) clearInterval(timer);
            $("pagamento").hidden = true;
            $("fim").hidden = false;
            // Evento Meta de COMPRA (confirmação do Asaas).
            fbq("track", "Purchase", {
              value: valorCompra,
              currency: "BRL",
              content_name: plano?.label || "Calc Machine Connect",
            });
            fbq("trackCustom", "CompraCalcMachine", { plano: plano?.label || "", valor: valorCompra });
          } else if (d.status === "expired" || d.status === "canceled") {
            if (timer) clearInterval(timer);
            $("status").textContent = "Este pagamento expirou. Recarregue a página para gerar outro.";
          }
        } catch {
          /* tenta de novo no próximo ciclo */
        }
      }, 5000);
    };

    const aoEnviar = async (e: Event) => {
      e.preventDefault();
      mostrarErro("");
      if (!plano || !forma) return mostrarErro("Escolha o plano e a forma de pagamento.");
      const enviar = $<HTMLButtonElement>("enviar");
      enviar.disabled = true;
      try {
        emailCobranca = $<HTMLInputElement>("email").value.trim().toLowerCase();
        const r = await fetch(`${API}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: emailCobranca,
            nome: $<HTMLInputElement>("nome").value,
            cpfCnpj: $<HTMLInputElement>("cpf").value.replace(/\D/g, ""),
            productId: plano.id,
            method: forma,
            ...(parcelado() ? { parcelas: Number($<HTMLSelectElement>("parcelas").value) } : {}),
            website: raiz.querySelector<HTMLInputElement>("[name=website]")?.value ?? "",
          }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Não foi possível gerar o pagamento.");
        chargeId = d.chargeId;
        valorCompra = Number(d.valor) || (plano && forma ? Number(plano.prices[forma]) : 0);
        // Evento Meta: iniciou o checkout (gerou a cobrança).
        fbq("track", "InitiateCheckout", { value: valorCompra, currency: "BRL" });
        $("form").hidden = true;
        $("pagamento").hidden = false;
        if (d.pix) {
          $("pix").hidden = false;
          $<HTMLTextAreaElement>("copia").value = d.pix.copiaecola || "";
          if (d.pix.qrcode) {
            const qr = $<HTMLImageElement>("qr");
            qr.src = `data:image/png;base64,${d.pix.qrcode}`;
            qr.hidden = false;
          }
        }
        if (d.checkoutUrl) {
          $("cartao").hidden = false;
          ($("linkCartao") as HTMLAnchorElement).href = d.checkoutUrl;
          if (d.parcelas)
            $("txtCartao").textContent = `Total de ${brl(d.valor)} em ${d.parcelas}x de ${brl(d.valorParcela)} sem juros. Abra a página segura de pagamento para informar o cartão. Pagamento único: não renova sozinho.`;
        }
        acompanhar();
      } catch (err) {
        mostrarErro(err instanceof Error ? err.message : "Não foi possível gerar o pagamento.");
      } finally {
        enviar.disabled = false;
      }
    };

    const aoCopiar = async () => {
      try {
        await navigator.clipboard.writeText($<HTMLTextAreaElement>("copia").value);
        $("copiar").textContent = "Copiado!";
      } catch {
        $<HTMLTextAreaElement>("copia").select();
      }
    };

    $("form").addEventListener("submit", aoEnviar);
    $("copiar").addEventListener("click", aoCopiar);

    return () => {
      cancelado = true;
      if (timer) clearInterval(timer);
      $("form").removeEventListener("submit", aoEnviar);
      $("copiar").removeEventListener("click", aoCopiar);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="asn" dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}

const CSS = String.raw`.asn { --ink:#0F1F1A; --paper:#F3EFE6; --signal:#E8552B; --muted:#5C6B64; --card:#fff; --line:#d9d3c4; min-height: 100vh; background: var(--paper); color: var(--ink); font: 16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; }
@media (prefers-color-scheme: dark) { .asn { --ink:#F3EFE6; --paper:#0F1F1A; --muted:#a9b5af; --card:#16302a; --line:#2b4a42; } }
.asn *, .asn *::before, .asn *::after { box-sizing: border-box; }
.asn .faixa-promo { background:var(--signal); color:#fff; text-align:center; font-weight:800; letter-spacing:.04em; text-transform:uppercase; font-size:.9rem; padding:12px 16px; }
.asn main { max-width:560px; margin:0 auto; padding:32px 16px 64px; }
.asn h1 { font-size:1.6rem; margin:0 0 4px; } .asn p.sub { color:var(--muted); margin:0 0 24px; }
.asn .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px; margin-bottom:16px; }
.asn label { display:block; font-weight:600; margin:14px 0 6px; font-size:.92rem; }
.asn input[type=text], .asn input[type=email], .asn select { width:100%; padding:12px; border:1px solid var(--line); border-radius:10px; background:var(--paper); color:var(--ink); font:inherit; }
.asn .opcao { display:flex; gap:10px; align-items:center; padding:12px; border:1px solid var(--line); border-radius:10px; margin:0 0 8px; cursor:pointer; font-weight:400; font-size:1rem; }
.asn .opcao:has(input:checked) { border-color:var(--signal); box-shadow:0 0 0 1px var(--signal); }
.asn .opcao span.v { margin-left:auto; font-weight:700; }
.asn .opcao small { color:var(--muted); display:block; }
.asn button { width:100%; margin-top:20px; padding:14px; border:0; border-radius:10px; background:var(--signal); color:#fff; font:inherit; font-weight:700; cursor:pointer; }
.asn button:disabled { opacity:.6; cursor:wait; }
.asn .erro { color:#c0361a; margin-top:12px; } .asn .ok { color:#1b7a46; }
.asn .hp { position:absolute; left:-9999px; }
.asn textarea { width:100%; height:90px; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--paper); color:var(--ink); font:12px monospace; }
.asn img.qr { display:block; margin:12px auto; width:200px; height:200px; background:#fff; padding:8px; border-radius:10px; }
.asn .nota { color:var(--muted); font-size:.88rem; margin-top:16px; }
.asn [hidden] { display:none !important; }
`;

const HTML = String.raw`<div class="faixa-promo" role="note">PREÇO PROMOCIONAL DE LANÇAMENTO POR TEMPO LIMITADO</div>
<main>
  <h1>Assinar Calc Machine Connect</h1>
  <p class="sub">Informe seus dados e escolha o plano. Não precisa de login para assinar.</p>

  <div id="carregando" class="card">Carregando planos…</div>

  <form id="form" class="card" hidden autocomplete="on">
    <div class="hp" aria-hidden="true"><label>Site <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
    <strong>1. Plano</strong>
    <div id="planos" style="margin-top:10px"></div>
    <strong>2. Forma de pagamento</strong>
    <div id="formas" style="margin-top:10px"></div>
    <div id="boxParcelas" hidden>
      <label for="parcelas">Parcelas no cartão (sem juros)</label>
      <select id="parcelas"></select>
    </div>
    <strong>3. Seus dados</strong>
    <label for="nome">Nome completo</label>
    <input id="nome" type="text" required minlength="3" autocomplete="name">
    <label for="email">E-mail <small style="font-weight:400;color:var(--muted)">(use o mesmo e-mail da sua conta da Suite, ou crie a conta depois com ele)</small></label>
    <input id="email" type="email" required autocomplete="email">
    <label for="cpf">CPF ou CNPJ</label>
    <input id="cpf" type="text" required inputmode="numeric" autocomplete="off">
    <button id="enviar" type="submit">Continuar</button>
    <div id="erro" class="erro" role="alert" hidden></div>
  </form>

  <section id="pagamento" class="card" hidden>
    <div id="pix" hidden>
      <strong>Pague com Pix</strong>
      <img id="qr" class="qr" alt="QR Code do Pix" hidden>
      <label for="copia">Pix copia e cola</label>
      <textarea id="copia" readonly></textarea>
      <button type="button" id="copiar">Copiar código</button>
    </div>
    <div id="cartao" hidden>
      <strong>Pagamento com cartão</strong>
      <p id="txtCartao">Abra a página segura de pagamento para informar o cartão.</p>
      <a id="linkCartao" href="#" target="_blank" rel="noopener"><button type="button">Abrir pagamento seguro</button></a>
    </div>
    <p id="status" class="nota">Aguardando o pagamento…</p>
  </section>

  <section id="fim" class="card" hidden>
    <strong class="ok">Pagamento confirmado!</strong>
    <p>Para usar, entre na plataforma da Suite com este mesmo e-mail (se ainda não tem conta, crie uma gratuitamente com ele). A assinatura já está ativa.</p>
    <a id="linkPlataforma" href="#"><button type="button">Ir para a plataforma</button></a>
  </section>
</main>
`;
