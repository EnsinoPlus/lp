import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  CreditCard,
  FileCheck,
  Gift,
  Infinity as InfinityIcon,
  Repeat,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

// Página de LANÇAMENTO do Calc Machine Connect (identidade Ensino Plus, vermelho/branco).
// Sem integração de pagamento neste projeto: todos os botões apontam para CHECKOUT_URL
// (troque pelo link do checkout quando ele existir).
const CHECKOUT_URL = "https://assinaturas.ensinoplus.com.br/assinar";

export const Route = createFileRoute("/calc-machine-connect-lancamento/")({
  head: () => ({
    meta: [
      { title: "Calc Machine Connect — Lançamento | Ensino Plus" },
      {
        name: "description",
        content:
          "Seus cálculos trabalhistas no PJe-Calc direto do Claude, ChatGPT ou Gemini. Oferta de lançamento com vagas limitadas. Use sem moderação.",
      },
      { property: "og:title", content: "Calc Machine Connect — Lançamento" },
      {
        property: "og:description",
        content: "A sentença entra, o .pjc sai. Oferta de lançamento, vagas limitadas. Use sem moderação.",
      },
    ],
  }),
  component: Lancamento,
});

const FEATURES = [
  { icon: FileCheck, title: "Da sentença ao .pjc", desc: "Envie a sentença e receba o arquivo do PJe-Calc montado, liquidado e conferido." },
  { icon: Zap, title: "Na sua própria IA", desc: "Funciona dentro do Claude, ChatGPT ou Gemini — do jeito que você já usa." },
  { icon: InfinityIcon, title: "Sem crédito por uso", desc: "Assinatura simples: use quantas vezes precisar, sem pagar por cálculo." },
  { icon: FileCheck, title: "Tudo salvo", desc: "Cada arquivo gerado fica em 'Meus Arquivos' na plataforma, pronto para atualizar depois." },
];

const LAUNCH_TIERS = [
  { preco: "97", lote: "1º lote", desc: "As primeiras 20 pessoas entram por este valor.", destaque: true },
  { preco: "197", lote: "2º lote", desc: "Próximas 20 vagas.", destaque: false },
  { preco: "297", lote: "3º lote", desc: "Últimas 20 vagas antes do preço cheio.", destaque: false },
];

const PAGAMENTOS = ["Pix à vista", "Pix automático (recorrente)", "Cartão de crédito"];

const FAQ = [
  { q: "Tem cobrança por crédito a cada cálculo?", a: "Não. Com a assinatura ativa, o uso do conector não consome créditos — use sem moderação." },
  { q: "Quais IAs funcionam?", a: "Claude, ChatGPT e Gemini (e qualquer ferramenta que aceite conectores MCP personalizados)." },
  { q: "Como funciona a garantia?", a: "Você tem 7 dias de garantia. Se não for pra você, é só pedir o reembolso dentro do prazo." },
  { q: "E o teste grátis?", a: "Dá pra experimentar por 2 dias antes de assinar, com algumas gerações de .pjc incluídas." },
  { q: "Posso cancelar?", a: "Sim. Nos planos com renovação automática, você desliga a renovação quando quiser e segue com acesso até o fim do período pago." },
];

function Lancamento() {
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de lançamento */}
      <div className="bg-red-600 text-white py-2.5 px-4 text-center text-sm font-bold">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-wider">Lançamento · Vagas limitadas por lote</span>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[oklch(0.17_0.03_28)] text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, oklch(0.7 0.19 28 / 0.55), transparent 45%), radial-gradient(circle at 10% 90%, oklch(0.82 0.16 85 / 0.4), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <img
                src="/calc-machine-connect/logo.svg"
                alt="Calc Machine Connect"
                className="h-11 w-auto mx-auto lg:mx-0 mb-6 rounded-lg"
              />
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-200 border border-red-400/50 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4">
                <Zap className="w-4 h-4" /> Calc Machine Connect
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.03] mb-4">
                A sentença entra, o <span className="text-red-400">.pjc</span> sai — pela sua IA
              </h1>
              <p className="text-lg md:text-xl text-white/75 mb-4">
                Monte cálculos trabalhistas no PJe-Calc direto do Claude, ChatGPT ou Gemini. Sem
                digitar verba por verba, sem pagar crédito por uso.
              </p>
              <p className="text-xl md:text-2xl font-black text-amber-300 mb-8">“Use sem moderação.”</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="#planos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta h-12 px-7"
                >
                  <Zap className="w-5 h-5" /> Garantir vaga de lançamento
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 text-white font-bold h-12 px-6 hover:bg-white/10 transition"
                >
                  Como funciona
                </a>
              </div>
              <div className="flex flex-wrap gap-5 mt-7 text-sm text-white/70 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-300" /> Garantia de 7 dias
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-red-300" /> Teste grátis de 2 dias
                </span>
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-300" /> Pix ou cartão
                </span>
              </div>
            </div>

            {/* Card de oferta */}
            <div className="bg-white/5 border-2 border-red-400/40 rounded-2xl p-6 md:p-8 shadow-card text-center">
              <div className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3 h-3" /> Oferta de lançamento
              </div>
              <p className="text-sm text-white/60 line-through">De R$ 397/mês</p>
              <p className="text-6xl md:text-7xl font-black text-white leading-none mt-1">
                R$ 97<span className="text-2xl font-bold text-white/70">/mês</span>
              </p>
              <p className="text-sm font-bold uppercase tracking-wider text-red-300 mt-2">
                1º lote · apenas 20 vagas
              </p>
              <a
                href="#planos"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all h-12 px-6"
              >
                <Zap className="w-5 h-5" /> Ver planos
              </a>
              <p className="text-xs text-white/50 mt-3">Depois do lote, o valor volta para R$ 397/mês.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de confiança */}
      <section className="bg-dark text-dark-foreground py-6 border-y-4 border-red-500">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold">
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-400" /> Claude, ChatGPT e Gemini</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-400" /> Arquivo .pjc pronto</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-400" /> Sem crédito por uso</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-400" /> Arquivos salvos na plataforma</li>
          </ul>
        </div>
      </section>

      {/* O que faz */}
      <section id="como-funciona" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">O que você faz com ele</p>
            <h2 className="text-3xl md:text-5xl font-black">Do documento ao cálculo, sem retrabalho</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border-2 border-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center text-primary-foreground mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">Oferta de lançamento</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Entre agora pelo menor preço</h2>
            <p className="text-muted-foreground text-lg">
              O valor sobe a cada lote. Quando os 3 lotes fecharem, a assinatura volta para{" "}
              <span className="font-bold text-foreground">R$ 397/mês</span>.
            </p>
          </div>

          {/* Lotes de lançamento */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
            {LAUNCH_TIERS.map((t) => (
              <div
                key={t.preco}
                className={`relative bg-card rounded-2xl p-7 flex flex-col ${
                  t.destaque ? "border-2 border-red-500 shadow-cta" : "border-2 border-border"
                }`}
              >
                {t.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais barato
                  </span>
                )}
                <p className="text-sm font-bold uppercase tracking-wider text-red-600">{t.lote}</p>
                <p className="text-5xl font-black mt-2">
                  R$ {t.preco}
                  <span className="text-lg font-bold text-muted-foreground">/mês</span>
                </p>
                <p className="text-sm text-muted-foreground mt-3 flex-1">{t.desc}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600 mt-4 mb-4">
                  Apenas 20 vagas
                </p>
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all h-12 px-6"
                >
                  <Zap className="w-5 h-5" /> Assinar por R$ {t.preco}
                </a>
              </div>
            ))}
          </div>

          {/* Mensal âncora + Anual */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-6">
            <div className="bg-card border-2 border-border rounded-2xl p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mensal (valor cheio)</p>
              <p className="text-4xl font-black mt-2">
                R$ 397<span className="text-lg font-bold text-muted-foreground">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                O valor normal da assinatura mensal, após o lançamento.
              </p>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 text-red-600 font-bold uppercase tracking-wide hover:bg-red-50 transition-all h-12 px-6"
              >
                Assinar mensal
              </a>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Anual</p>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-1 mt-2">
                <p className="text-4xl font-black">R$ 970</p>
                <p className="text-lg font-bold text-muted-foreground">· R$ 1.970 · R$ 2.970</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Planos anuais para quem quer travar o preço o ano todo. Escolha o nível no checkout.
              </p>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 text-red-600 font-bold uppercase tracking-wide hover:bg-red-50 transition-all h-12 px-6"
              >
                Ver planos anuais
              </a>
            </div>
          </div>

          {/* Créditos + pagamentos */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-6">
            <div className="bg-card border-2 border-border rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center text-primary-foreground shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Créditos avulsos (plano mensal)</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Precisou de mais? <span className="font-bold text-foreground">R$ 100 = 300 créditos</span>,
                  disponível para quem está no plano mensal.
                </p>
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-lg">Formas de pagamento</h3>
              </div>
              <ul className="flex flex-wrap gap-2">
                {PAGAMENTOS.map((p) => (
                  <li key={p} className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded-full px-3 py-1 text-sm font-semibold">
                    <Repeat className="w-3.5 h-3.5 text-red-600" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Garantia + teste */}
          <div className="max-w-5xl mx-auto mt-6 grid sm:grid-cols-2 gap-6">
            <div className="bg-card border-2 border-border rounded-2xl p-6 flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-red-600 shrink-0" />
              <div>
                <p className="font-black">Garantia de 7 dias</p>
                <p className="text-sm text-muted-foreground">Não gostou? Devolvemos seu dinheiro.</p>
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-6 flex items-center gap-4">
              <BadgeCheck className="w-10 h-10 text-red-600 shrink-0" />
              <div>
                <p className="font-black">Teste grátis de 2 dias</p>
                <p className="text-sm text-muted-foreground">Experimente antes de assinar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan */}
      <section className="py-16 bg-[oklch(0.17_0.03_28)] text-white text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, oklch(0.7 0.19 28 / 0.45), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <p className="text-3xl md:text-5xl font-black">Use sem moderação.</p>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Assinatura sem crédito por uso: gere quantos cálculos precisar.
          </p>
          <a
            href="#planos"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all h-12 px-8"
          >
            <Zap className="w-5 h-5" /> Garantir vaga de lançamento
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">Dúvidas</p>
            <h2 className="text-3xl md:text-4xl font-black">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="bg-card border-2 border-border rounded-xl p-5">
                <summary className="font-bold cursor-pointer">{item.q}</summary>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          <img
            src="/calc-machine-connect/logo.svg"
            alt="Calc Machine Connect"
            className="h-9 w-auto mx-auto mb-3 rounded"
          />
          <p>Um produto Ensino Plus · © 2026 Ensino Plus. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
