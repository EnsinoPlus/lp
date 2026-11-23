import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { saveCreditoLead } from "@/lib/cmc-creditos";
import { trackCmcEvent } from "@/lib/cmc-events";

// Black Week: combo Calc Machine Connect + CCT (12 meses) por R$ 942,50 ou só o Connect anual
// por R$ 897, ambos com order bump do ebook (+ R$ 45).
// O pagamento é feito nos links do Asaas abaixo. A liberação é manual: o lead cai na aba
// Créditos do dashboard (promo "black-week") e a equipe libera depois de conferir o pagamento.
// Quando os links ficarem vinculados ao produto no Assinaturas, basta trocar as URLs aqui.

const FIM = new Date("2026-11-30T23:59:59-03:00");
const WHATSAPP = "5585996641461";
const EBOOK = 45;

type PlanoId = "combo" | "connect";
const PLANOS: Record<
  PlanoId,
  {
    nome: string;
    curto: string;
    preco: number;
    de: number;
    selo: string;
    desc: string;
    links: { pix: string; card: string };
    comEbook: { pix: string; card: string };
  }
> = {
  combo: {
    nome: "Calc Machine Connect + CCT",
    curto: "Connect + CCT",
    preco: 942.5,
    de: 1450,
    selo: "35% OFF · Mais completo",
    desc: "Connect + Clube do Cálculo Trabalhista por 12 meses.",
    links: {
      pix: "https://www.asaas.com/000/c/8enoyq1io4pksgjm",
      card: "https://www.asaas.com/000/c/wcfp8rhwbq6q6cas",
    },
    comEbook: {
      pix: "https://www.asaas.com/000/c/nv7f07e2lb5ld5tc",
      card: "https://www.asaas.com/000/c/42xheemg7l4nv1u5",
    },
  },
  connect: {
    nome: "Calc Machine Connect",
    curto: "Connect",
    preco: 897,
    de: 997,
    selo: "R$ 100 OFF",
    desc: "Só o Calc Machine Connect por 12 meses.",
    links: {
      pix: "https://www.asaas.com/000/c/xfcb8ek7hr1lwkfn",
      card: "https://www.asaas.com/000/c/ff96gdlq7n8tytm7",
    },
    comEbook: {
      pix: "https://www.asaas.com/000/c/z9kvkajsqlicq166",
      card: "https://www.asaas.com/000/c/h0zlkxbeitv8fdy4",
    },
  },
};

export const Route = createFileRoute("/black-week/")({
  head: () => ({
    meta: [
      { title: "Black Week Ensino Plus | Connect + CCT por R$ 942,50" },
      {
        name: "description",
        content:
          "Calc Machine Connect + CCT por 12 meses com 35% OFF: R$ 942,50 no Pix ou em até 10x no cartão. Só durante a Black Week.",
      },
      { property: "og:title", content: "Black Week Ensino Plus: Connect + CCT com 35% OFF" },
      {
        property: "og:description",
        content: "R$ 942,50 no Pix ou em até 10x no cartão. Válido até segunda, 30/11.",
      },
      { property: "og:image", content: "/black-week/arte.jpg" },
    ],
  }),
  component: BlackWeek,
});

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const campo =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500";

function fbq(...args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch {
    /* pixel ausente */
  }
}

function useContagem() {
  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => {
    setAgora(Date.now());
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (agora == null) return { encerrada: false, texto: "" };
  const falta = FIM.getTime() - agora;
  if (falta <= 0) return { encerrada: true, texto: "" };
  const d = Math.floor(falta / 86400000);
  const h = Math.floor((falta % 86400000) / 3600000);
  const m = Math.floor((falta % 3600000) / 60000);
  const s = Math.floor((falta % 60000) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return { encerrada: false, texto: `${d > 0 ? `${d}d ` : ""}${p(h)}h ${p(m)}m ${p(s)}s` };
}

const INCLUSO = [
  {
    t: "Calc Machine Connect por 12 meses",
    d: "Cole a sentença na sua IA e receba o cálculo pronto para o PJe-Calc (.PJC).",
  },
  {
    t: "CCT: Clube do Cálculo Trabalhista por 12 meses",
    d: "Conteúdo, materiais e suporte para a rotina de cálculos trabalhistas.",
  },
  {
    t: "Menos etapas manuais",
    d: "Mais agilidade e tecnologia aplicada à sua rotina com o PJe-Calc.",
  },
];

const FAQ = [
  {
    p: "Como recebo o acesso?",
    r: "Depois que o pagamento é confirmado, nossa equipe libera o plano escolhido na sua conta da Suite Plus, no e-mail que você informar aqui. A liberação é feita em até 24 horas.",
  },
  {
    p: "Preciso ter conta na Suite Plus?",
    r: "Sim. Use o mesmo e-mail da sua conta. Se ainda não tem, crie grátis antes de pagar pelo link indicado no formulário.",
  },
  {
    p: "Quais as formas de pagamento?",
    r: "Pix à vista ou cartão de crédito em até 10x. O pagamento é único: não renova sozinho.",
  },
  {
    p: "Até quando vale a oferta?",
    r: "Até segunda-feira, 30/11/2026, às 23h59. Depois disso o combo volta ao preço normal.",
  },
];

function BlackWeek() {
  const { encerrada, texto } = useContagem();
  const [bump, setBump] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [destino, setDestino] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [planoId, setPlanoId] = useState<PlanoId>("combo");
  const plano = PLANOS[planoId];
  const total = plano.preco + (bump ? EBOOK : 0);
  const pacote = `Black Week: ${plano.curto}${bump ? " + Ebook" : ""}`;

  useEffect(() => {
    trackCmcEvent("PageView", { promo: "black-week" });
  }, []);

  // Captura parcial: salva assim que houver e-mail válido ou WhatsApp com DDD.
  const ultimo = useRef("");
  const salvar = useRef<() => void>(() => {});
  salvar.current = () => {
    if (enviando || destino) return;
    const em = email.trim().toLowerCase();
    const tel = telefone.replace(/\D/g, "");
    const dados = {
      promo: "black-week" as const,
      pacote,
      creditos: null,
      valor: total,
      nome: nome.trim() || undefined,
      email: EMAIL_OK.test(em) ? em : undefined,
      telefone: tel.length >= 10 ? tel : undefined,
      etapa: "preencheu" as const,
    };
    if (!dados.email && !dados.telefone) return;
    const chave = JSON.stringify(dados);
    if (chave === ultimo.current) return;
    ultimo.current = chave;
    void saveCreditoLead(dados);
  };
  useEffect(() => {
    const t = setTimeout(() => salvar.current(), 800);
    return () => clearTimeout(t);
  }, [nome, email, telefone, bump, planoId]);
  useEffect(() => {
    const aoSair = () => salvar.current();
    window.addEventListener("pagehide", aoSair);
    return () => window.removeEventListener("pagehide", aoSair);
  }, []);

  const pagar = async (forma: "pix" | "card") => {
    setErro("");
    const em = email.trim().toLowerCase();
    const tel = telefone.replace(/\D/g, "");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (!EMAIL_OK.test(em)) return setErro("Informe o e-mail da sua conta na Suite Plus.");
    if (tel.length < 10) return setErro("Informe seu WhatsApp com DDD.");

    setEnviando(true);
    await saveCreditoLead({
      promo: "black-week",
      pacote: `${pacote} (${forma === "pix" ? "Pix" : "Cartão"})`,
      creditos: null,
      valor: total,
      nome: nome.trim(),
      email: em,
      telefone: tel,
      etapa: "enviou",
    });
    fbq("track", "Lead", { content_name: pacote, value: total, currency: "BRL" });
    fbq("track", "InitiateCheckout", { content_name: pacote, value: total, currency: "BRL" });
    trackCmcEvent("BlackWeekCheckout", { pacote, forma });

    const url = (bump ? plano.comEbook : plano.links)[forma];
    setDestino(url);
    setEnviando(false);
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-[#0b0507] text-white">
      <WhatsAppFloat
        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre a Black Week (Connect + CCT).")}`}
        label="Tirar dúvidas"
        event="BW_Whatsapp"
        onClick={() => trackCmcEvent("BW_Whatsapp", { promo: "black-week" })}
      />

      <div className="bg-red-600 text-center text-sm font-bold py-2 px-4">
        {encerrada ? (
          "A Black Week terminou."
        ) : (
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4" /> Oferta válida até segunda, 30/11 · termina em{" "}
            {texto || "…"}
          </span>
        )}
      </div>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 10%, rgba(220,38,38,.55), transparent 45%), radial-gradient(circle at 5% 95%, rgba(220,38,38,.35), transparent 40%)",
          }}
        />
        <div className="container mx-auto px-4 py-10 md:py-14 relative">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <img
                src="/black-week/arte.jpg"
                alt="Black Week Ensino Plus: Calc Machine Connect + CCT por R$ 942,50 à vista, 35% OFF"
                width={1080}
                height={1350}
                className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl shadow-2xl border border-red-500/30"
              />
              <ul className="space-y-3 mt-8 max-w-md mx-auto lg:mx-0">
                {INCLUSO.map((b) => (
                  <li key={b.t} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <p className="font-bold leading-tight">{b.t}</p>
                      <p className="text-sm text-white/60">{b.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-first lg:order-none lg:sticky lg:top-6">
              <h1 className="text-4xl md:text-5xl font-black leading-[1.05] mb-3">
                Começou a <span className="text-red-500">Black Week</span>
              </h1>
              <p className="text-lg text-white/75 mb-6">
                Garanta o combo <strong className="text-white">Calc Machine Connect + CCT</strong>{" "}
                por 12 meses com 35% OFF, ou só o{" "}
                <strong className="text-white">Connect anual por R$ 897</strong>.
              </p>

              <div className="bg-white/5 border-2 border-red-500/50 rounded-2xl p-6 md:p-7 shadow-2xl">
                {encerrada ? (
                  <div className="text-center py-6">
                    <h2 className="text-2xl font-black mb-2">Oferta encerrada</h2>
                    <p className="text-white/70 mb-5">
                      A condição da Black Week terminou em 30/11. Fale com a gente para ver as
                      condições atuais.
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP}`}
                      className="inline-flex justify-center w-full rounded-xl bg-red-600 hover:bg-red-500 font-black uppercase py-4"
                    >
                      Falar no WhatsApp
                    </a>
                  </div>
                ) : destino ? (
                  <div className="text-center py-6">
                    <BadgeCheck className="w-12 h-12 mx-auto mb-3" />
                    <h2 className="text-2xl font-black mb-2">Dados recebidos!</h2>
                    <p className="text-white/70 mb-5">
                      Falta só concluir o pagamento de {brl(total)}.
                    </p>
                    <a
                      href={destino}
                      className="inline-flex justify-center w-full rounded-xl bg-red-600 hover:bg-red-500 font-black uppercase py-4"
                    >
                      Ir para o pagamento
                    </a>
                  </div>
                ) : (
                  <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div
                      role="radiogroup"
                      aria-label="Escolha seu plano"
                      className="space-y-3 mb-5"
                    >
                      {(Object.keys(PLANOS) as PlanoId[]).map((id) => {
                        const pl = PLANOS[id];
                        const ativo = id === planoId;
                        return (
                          <label
                            key={id}
                            className={`relative flex items-center gap-3 rounded-xl border-2 px-4 py-4 cursor-pointer transition ${ativo ? "border-red-500 bg-red-500/15" : "border-white/15 hover:border-white/35"}`}
                          >
                            <input
                              type="radio"
                              name="plano"
                              checked={ativo}
                              onChange={() => setPlanoId(id)}
                              className="accent-red-500 w-5 h-5 shrink-0"
                            />
                            <span className="flex-1">
                              <span className="font-black block leading-tight">{pl.nome}</span>
                              <span className="text-xs text-white/60 block">{pl.desc}</span>
                              <span className="inline-block mt-1 bg-red-600 rounded-full px-2 py-0.5 text-[10px] font-black uppercase">
                                {pl.selo}
                              </span>
                            </span>
                            <span className="text-right whitespace-nowrap">
                              <span className="block text-xs text-white/50 line-through">
                                {brl(pl.de)}
                              </span>
                              <span className="block font-black text-xl text-red-400">
                                {brl(pl.preco)}
                              </span>
                              <span className="block text-[11px] text-white/60">
                                ou 10x {brl(pl.preco / 10)}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label htmlFor="bw-nome" className="block text-sm font-bold mb-1">
                          Nome
                        </label>
                        <input
                          id="bw-nome"
                          autoComplete="name"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className={campo}
                        />
                      </div>
                      <div>
                        <label htmlFor="bw-email" className="block text-sm font-bold mb-1">
                          E-mail da sua conta na Suite Plus
                        </label>
                        <input
                          id="bw-email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={campo}
                        />
                        <p className="text-xs text-white/60 mt-1">
                          O acesso é liberado neste e-mail.{" "}
                          <a
                            href="https://suiteplus.ensinoplus.com.br/register"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Ainda não tem conta? Crie grátis
                          </a>
                        </p>
                      </div>
                      <div>
                        <label htmlFor="bw-tel" className="block text-sm font-bold mb-1">
                          WhatsApp com DDD
                        </label>
                        <input
                          id="bw-tel"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="(85) 99999-9999"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className={campo}
                        />
                      </div>
                    </div>

                    <label
                      className={`mt-5 flex gap-3 items-start rounded-xl border-2 border-dashed p-4 cursor-pointer transition ${bump ? "border-amber-300 bg-amber-300/10" : "border-amber-300/50 hover:border-amber-300"}`}
                    >
                      <input
                        type="checkbox"
                        checked={bump}
                        onChange={(e) => setBump(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-amber-400"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-black text-amber-300">
                          <BookOpen className="w-5 h-5" /> Sim! Quero o Ebook PJe-Calc por +{" "}
                          {brl(EBOOK)}
                        </span>
                        <span className="block text-sm text-white/70 mt-1">
                          O guia prático do PJe-Calc para acelerar seus cálculos. Oferta só nesta
                          página.
                        </span>
                      </span>
                    </label>

                    <div className="flex justify-between items-baseline mt-5 text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-black text-2xl">{brl(total)}</span>
                    </div>

                    {erro && (
                      <p role="alert" className="text-red-300 font-bold text-sm mt-3">
                        {erro}
                      </p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <button
                        type="button"
                        disabled={enviando}
                        onClick={() => void pagar("pix")}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 font-black uppercase py-4 px-3 transition"
                      >
                        <QrCode className="w-5 h-5" /> Pagar no Pix
                      </button>
                      <button
                        type="button"
                        disabled={enviando}
                        onClick={() => void pagar("card")}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white text-[#0b0507] hover:bg-white/90 disabled:opacity-60 font-black uppercase py-4 px-3 transition"
                      >
                        <CreditCard className="w-5 h-5" /> Cartão até 10x
                      </button>
                    </div>
                    <p className="text-xs text-white/50 text-center mt-3 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Pagamento seguro pelo Asaas. Acesso
                      liberado em até 24h após a confirmação.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-black text-center mb-8">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                n: "1",
                t: "Preencha seus dados",
                d: "Use o mesmo e-mail da sua conta na Suite Plus.",
              },
              {
                n: "2",
                t: "Pague no Pix ou cartão",
                d: "Você segue para a página segura do Asaas.",
              },
              {
                n: "3",
                t: "Receba o acesso",
                d: "Liberamos o seu plano (e o ebook, se escolheu) em até 24h.",
              },
            ].map((p) => (
              <div key={p.n} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-red-600 font-black flex items-center justify-center mb-3">
                  {p.n}
                </div>
                <h3 className="font-black text-lg mb-1">{p.t}</h3>
                <p className="text-white/60 text-sm">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-8">Dúvidas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.p} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <summary className="font-bold cursor-pointer">{f.p}</summary>
                <p className="text-white/70 mt-2 text-sm">{f.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-white/50">
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Ensino Plus · Calc Machine Connect
        </p>
      </footer>
    </div>
  );
}
