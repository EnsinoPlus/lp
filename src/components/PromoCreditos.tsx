import { useEffect, useRef, useState, type ReactNode } from "react";
import { BadgeCheck, CheckCircle2, Coins, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { saveCreditoLead } from "@/lib/cmc-creditos";
import { trackCmcEvent } from "@/lib/cmc-events";
import { cmcAtribuicao } from "@/lib/cmc-attribution";

// Página de promoção de créditos com captura enquanto a pessoa digita. O lead cai na aba
// Créditos do dashboard. Sem checkoutUrl, a compra é fechada pelo WhatsApp; quando a Suite
// criar o checkout da oferta, basta preencher checkoutUrl na rota.

const WHATSAPP = "5585996641461";

export type OfertaCreditos = {
  id: string; // nome gravado no lead
  titulo: string;
  creditos: number | null;
  valor: number | null; // null = valor informado no WhatsApp
  descricao?: string;
  checkoutUrl?: string;
};

const TOOLS = [
  { title: "Calc Machine", desc: "Cole a sentença e receba .PJC e JSON prontos para o PJe-Calc.", href: "/calc-machine/" },
  { title: "Ponto Mágico", desc: "Converta cartão de ponto em CSV para o PJe-Calc em segundos.", href: "/ponto-magico/" },
  { title: "Contracheque Transparente", desc: "Transforme holerites em planilha por rubricas, pronta para o cálculo.", href: "/contracheque-transparente/" },
  { title: "Extrator de Ausências", desc: "Extraia férias e faltas de PDFs e gere o CSV do PJe-Calc.", href: "/extrator-de-ausencias/" },
  { title: "FGTS Fácil", desc: "Analise o extrato de FGTS e os meses sem depósito por período.", href: "/fgts-facil/" },
  { title: "Impugnador", desc: "Valide a sentença contra os cálculos e gere o relatório de impugnação.", href: "/impugnador/" },
  { title: "Chat CCT", desc: "Tire dúvidas de cálculo trabalhista com fontes rastreáveis.", href: "/chat-cct/" },
];

const brl = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v % 1 ? 2 : 0 });
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const campo =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-400";

function fbq(...args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch {
    /* pixel ausente */
  }
}

export function PromoCreditos({
  promo,
  selo,
  titulo,
  subtitulo,
  beneficios,
  ofertas,
  ofertaInicial,
  textoCta,
}: {
  promo: "primeira-recarga" | "11-11";
  selo: string;
  titulo: ReactNode;
  subtitulo: ReactNode;
  beneficios: { title: string; desc: string }[];
  ofertas: OfertaCreditos[];
  ofertaInicial?: string;
  textoCta: string;
}) {
  const [ofertaId, setOfertaId] = useState(ofertaInicial ?? ofertas[0].id);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [destino, setDestino] = useState<string | null>(null);
  const oferta = ofertas.find((o) => o.id === ofertaId) ?? ofertas[0];

  useEffect(() => {
    trackCmcEvent("PageView", { promo });
  }, [promo]);

  // Captura parcial: salva assim que houver e-mail válido ou WhatsApp com DDD.
  const ultimo = useRef("");
  const salvar = useRef<() => void>(() => {});
  salvar.current = () => {
    if (enviando || destino) return;
    const em = email.trim().toLowerCase();
    const tel = telefone.replace(/\D/g, "");
    const dados = {
      promo,
      pacote: oferta.id,
      creditos: oferta.creditos,
      valor: oferta.valor,
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
  }, [nome, email, telefone, ofertaId]);
  useEffect(() => {
    const aoSair = () => salvar.current();
    window.addEventListener("pagehide", aoSair);
    return () => window.removeEventListener("pagehide", aoSair);
  }, []);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const em = email.trim().toLowerCase();
    const tel = telefone.replace(/\D/g, "");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (!EMAIL_OK.test(em)) return setErro("Informe o e-mail da sua conta na Suite.");
    if (tel.length < 10) return setErro("Informe seu WhatsApp com DDD.");

    setEnviando(true);
    await saveCreditoLead({
      promo,
      pacote: oferta.id,
      creditos: oferta.creditos,
      valor: oferta.valor,
      nome: nome.trim(),
      email: em,
      telefone: tel,
      etapa: "enviou",
    });

    const valorMeta = oferta.valor ? { value: oferta.valor, currency: "BRL" } : { currency: "BRL" };
    fbq("track", "Lead", { content_name: oferta.titulo, ...valorMeta });
    fbq("track", "InitiateCheckout", { content_name: oferta.titulo, ...valorMeta });
    trackCmcEvent("CreditosEnviou", { promo, pacote: oferta.id });

    let url: string;
    if (oferta.checkoutUrl) {
      const query = new URLSearchParams({ ...cmcAtribuicao(), email: em });
      url = `${oferta.checkoutUrl}${oferta.checkoutUrl.includes("?") ? "&" : "?"}${query}`;
    } else {
      const origem = cmcAtribuicao().utm_source;
      const msg = [
        `Olá! Quero a oferta: ${oferta.titulo}.`,
        `Nome: ${nome.trim()}`,
        `E-mail da conta: ${em}`,
        origem ? `Vim por: ${origem}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }
    setDestino(url);
    setEnviando(false);
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-background">
      <WhatsAppFloat
        href={`https://wa.me/${WHATSAPP}`}
        label="Tirar dúvidas"
        event="CRED_Whatsapp"
        onClick={() => trackCmcEvent("CRED_Whatsapp", { promo })}
      />

      <section className="relative overflow-hidden bg-[oklch(0.17_0.03_28)] text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, oklch(0.7 0.19 28 / 0.55), transparent 45%), radial-gradient(circle at 10% 90%, oklch(0.82 0.16 85 / 0.3), transparent 40%)",
          }}
        />
        <div className="container mx-auto px-4 py-10 md:py-16 relative">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-200 border border-red-400/50 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-4 h-4" /> {selo}
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-4">{titulo}</h1>
              <p className="text-lg md:text-xl text-white/75 mb-6">{subtitulo}</p>
              <ul className="space-y-3 text-left max-w-md mx-auto lg:mx-0">
                {beneficios.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                    <div>
                      <p className="font-bold leading-tight">{b.title}</p>
                      <p className="text-sm text-white/60">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border-2 border-red-400/40 rounded-2xl p-6 md:p-8 shadow-card">
              {destino ? (
                <div className="text-center py-6">
                  <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-white" />
                  <h2 className="text-2xl font-black mb-2">Dados recebidos!</h2>
                  <p className="text-white/70 mb-5">
                    Falta só um passo: finalize sua compra de <strong className="text-white">{oferta.titulo}</strong>.
                  </p>
                  <a href={destino} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wide py-4 px-4">
                    <MessageCircle className="w-5 h-5" /> Continuar a compra
                  </a>
                </div>
              ) : (
                <form onSubmit={enviar} noValidate>
                  <h2 className="text-xl md:text-2xl font-black text-center mb-5">
                    {ofertas.length > 1 ? "Escolha seu pacote" : "Garanta sua oferta"}
                  </h2>

                  <div role="radiogroup" aria-label="Oferta" className="space-y-2 mb-5">
                    {ofertas.map((o) => {
                      const ativo = o.id === oferta.id;
                      return (
                        <label
                          key={o.id}
                          className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition ${ativo ? "border-red-400 bg-red-500/15" : "border-white/15 hover:border-white/30"}`}
                        >
                          <input type="radio" name="oferta" checked={ativo} onChange={() => setOfertaId(o.id)} className="accent-red-500" />
                          <Coins className="w-5 h-5 shrink-0 text-amber-300" />
                          <span className="flex-1">
                            <span className="font-bold block">{o.titulo}</span>
                            {o.descricao && <span className="text-xs text-white/60 block">{o.descricao}</span>}
                          </span>
                          <span className="font-black text-amber-300 whitespace-nowrap">{o.valor != null ? brl(o.valor) : ""}</span>
                        </label>
                      );
                    })}
                    {oferta.valor == null && (
                      <p className="text-xs text-white/60 text-center pt-1">O valor do pacote é enviado no WhatsApp.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="cr-nome" className="block text-sm font-bold mb-1">Nome</label>
                      <input id="cr-nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} className={campo} />
                    </div>
                    <div>
                      <label htmlFor="cr-email" className="block text-sm font-bold mb-1">E-mail da sua conta na Suite</label>
                      <input id="cr-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
                      <p className="text-xs text-white/60 mt-1">
                        Os créditos entram na conta deste e-mail.{" "}
                        <a href="https://suiteplus.ensinoplus.com.br/register" target="_blank" rel="noreferrer" className="underline">
                          Criar conta grátis
                        </a>
                      </p>
                    </div>
                    <div>
                      <label htmlFor="cr-tel" className="block text-sm font-bold mb-1">WhatsApp com DDD</label>
                      <input id="cr-tel" type="tel" autoComplete="tel" inputMode="tel" placeholder="(85) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={campo} />
                    </div>
                  </div>

                  {erro && <p role="alert" className="text-red-300 font-bold text-sm mt-3">{erro}</p>}

                  <button type="submit" disabled={enviando} className="mt-5 w-full rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-black uppercase tracking-wide py-4 px-4 transition">
                    {enviando ? "Enviando…" : textoCta}
                  </button>
                  <p className="text-xs text-white/50 text-center mt-3">
                    Os dados preenchidos aqui são salvos para podermos falar com você sobre a oferta.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-10">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: "1", t: "Preencha seus dados", d: "Use o mesmo e-mail da sua conta na Suite." },
              { n: "2", t: "Finalize a compra", d: ofertas.some((o) => o.checkoutUrl) ? "Você segue para a página de pagamento, com Pix ou cartão." : "Você continua no nosso atendimento para concluir o pagamento." },
              { n: "3", t: "Receba os créditos", d: "Depois da confirmação do pagamento, os créditos entram na sua conta." },
            ].map((p) => (
              <div key={p.n} className="bg-card border-2 border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mb-3">{p.n}</div>
                <h3 className="font-black text-lg mb-1">{p.t}</h3>
                <p className="text-muted-foreground text-sm">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-2">Use os créditos em todas as ferramentas</h2>
          <p className="text-muted-foreground text-center mb-10">Um login, as soluções de IA da Suite para cálculo e produtividade trabalhista.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map((t) => (
              <a key={t.title} href={t.href} className="bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition">
                <h3 className="font-black mb-1">{t.title}</h3>
                <p className="text-muted-foreground text-sm">{t.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Ensino Plus · SuitePlus</p>
      </footer>
    </div>
  );
}
