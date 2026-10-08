import { createFileRoute, Link } from "@tanstack/react-router";
import catalogoCover from "@/assets/catalogo-capa-pjecalc-vicelmo.png";
import { UrgencyBar } from "@/components/UrgencyBar";
import { useTrackedUrl } from "@/hooks/useSignupOrigin";
import { getCreditsCheckoutUrl } from "@/lib/runtime-config";
import {
  BookOpen,
  Bot,
  Calculator,
  CalendarX,
  Clock,
  Coins,
  FileCheck,
  FileText,
  Gift,
  MessageSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/suiteplus-promo-1010/")({
  head: () => ({
    meta: [
      {
        title: "10 do 10 — 400 créditos + e-book por R$ 200 | Ensino Plus",
      },
      {
        name: "description",
        content:
          "Oferta 10 do 10: 400 créditos PlusCoin e o e-book Cálculos Trabalhistas Aplicados ao PJe-Calc por R$ 200. Válida em 10 de outubro.",
      },
      { property: "og:title", content: "Ensino Plus — 10 do 10 | 400 créditos + e-book" },
      {
        property: "og:description",
        content:
          "400 créditos + e-book Cálculos Trabalhistas Aplicados ao PJe-Calc por R$ 200,00.",
      },
    ],
  }),
  loader: async () => ({
    checkoutUrl: await getCreditsCheckoutUrl(),
  }),
  component: Landing,
});

const TOOLS = [
  {
    icon: Calculator,
    title: "CALC MACHINE",
    desc: "Cole a sentença e receba .PJC e JSON prontos para o PJe-Calc.",
    href: "/calc-machine/" as const,
  },
  {
    icon: Clock,
    title: "PONTO MÁGICO",
    desc: "Converta cartão de ponto em CSV para o PJe-Calc em segundos.",
    href: "/ponto-magico/" as const,
  },
  {
    icon: FileText,
    title: "CONTRACHEQUE TRANSPARENTE",
    desc: "Transforme holerites em planilha por rubricas, pronta para o cálculo.",
    href: "/contracheque-transparente/" as const,
  },
  {
    icon: CalendarX,
    title: "EXTRATOR DE AUSÊNCIAS",
    desc: "Extraia férias e faltas de PDFs e gere o CSV do PJe-Calc.",
    href: "/extrator-de-ausencias/" as const,
  },
  {
    icon: Wallet,
    title: "FGTS FÁCIL",
    desc: "Analise o extrato de FGTS e os meses sem depósito por período.",
    href: "/fgts-facil/" as const,
  },
  {
    icon: Bot,
    title: "IMPUGNADOR",
    desc: "Valide a sentença contra os cálculos e gere o relatório de impugnação.",
    href: "/impugnador/" as const,
  },
  {
    icon: MessageSquare,
    title: "CHAT CCT",
    desc: "Tire dúvidas de cálculo trabalhista com fontes rastreáveis.",
    href: "/chat-cct/" as const,
  },
] as const;

const EBOOK_TOPICS = [
  {
    icon: Calculator,
    title: "Sistema PJe-Calc",
    desc: "Parametrização, férias, faltas, histórico salarial e verbas proporcionais.",
  },
  {
    icon: Clock,
    title: "Jornada e horas extras",
    desc: "Hora sexagesimal e centesimal, adicional noturno, DSR e OJ 394.",
  },
  {
    icon: Scale,
    title: "Atualização monetária",
    desc: "Lei 14.905/2024, juros de mora e débitos da Fazenda Pública.",
  },
  {
    icon: FileCheck,
    title: "Liquidação e impugnação",
    desc: "Limites da sentença, valores da inicial e o art. 884 da CLT.",
  },
];

function CTAButton({
  children,
  checkoutUrl,
  large = false,
}: {
  children: React.ReactNode;
  checkoutUrl: string;
  large?: boolean;
}) {
  const checkoutHref = useTrackedUrl(checkoutUrl);
  return (
    <a
      href={checkoutHref}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta ${
        large ? "px-8 py-5 text-lg md:text-xl" : "px-6 py-4 text-base"
      }`}
    >
      <Zap className="w-5 h-5" />
      {children}
    </a>
  );
}

function Landing() {
  const { checkoutUrl } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <UrgencyBar message="OFERTA TERMINA EM:" />

      <section className="bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 75% 15%, oklch(0.82 0.16 85 / 0.45), transparent 40%), radial-gradient(circle at 15% 85%, oklch(0.7 0.19 38 / 0.35), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-urgency/25 text-urgency-foreground border border-urgency/50 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" /> Bônus revelado · Edição especial
            </div>

            <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
              Ensino Plus · SuitePlus
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-4">
              Campanha <span className="text-primary">10</span> do <span className="text-primary">10</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              400 créditos para usar na Suite, com o e-book do Prof. Vicelmo de bônus.
            </p>

            <div className="bg-white/5 border-2 border-primary/40 rounded-2xl p-8 md:p-10 max-w-xl mx-auto mb-8 shadow-card">
              <div className="inline-flex items-center gap-1 bg-gradient-cta text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-5">
                <Sparkles className="w-3 h-3" /> OFERTA DO DIA
              </div>
              <p className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2">400</p>
              <p className="text-lg md:text-xl font-bold uppercase tracking-wider text-white/80 mb-2">
                Créditos
              </p>
              <p className="text-base text-white/70 mb-5">
                + e-book <span className="text-white font-semibold">Cálculos Trabalhistas Aplicados ao PJe-Calc</span>
              </p>
              <div className="flex items-end justify-center gap-3 mb-4 flex-wrap">
                <span className="text-5xl md:text-6xl font-black text-primary">R$ 200,00</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" /> Bônus revelado no 10 do 10
              </div>
            </div>

            <CTAButton large checkoutUrl={checkoutUrl}>
              Aproveitar agora — R$ 200
            </CTAButton>

            <div className="flex flex-wrap gap-5 mt-8 text-sm text-white/70 justify-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Válida em 10 de outubro
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" /> Créditos PlusCoin na plataforma
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> E-book do Prof. Vicelmo incluso
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark text-dark-foreground py-12 border-y-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "400", l: "Créditos PlusCoin" },
              { n: "R$ 200", l: "Pacote completo" },
              { n: "E-book", l: "Bônus do PJe-Calc" },
              { n: "10/10", l: "Somente no sábado" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-primary">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-primary mb-3">
              BÔNUS REVELADO
            </h2>
            <p className="text-xl md:text-2xl font-bold text-foreground mb-2">
              O e-book entra junto com os créditos
            </p>
            <p className="text-muted-foreground text-base">
              Edição 2026, do Prof. Vicelmo Alencar.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-[220px_1fr] gap-8 md:gap-12 items-center bg-card border-2 border-border rounded-2xl p-6 md:p-10">
            <img
              src={catalogoCover}
              alt="Capa do e-book Cálculos Trabalhistas Aplicados ao PJe-Calc, edição 2026"
              className="w-44 md:w-full mx-auto drop-shadow-2xl"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Prof. Vicelmo Alencar</p>
              <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                Cálculos Trabalhistas Aplicados ao PJe-Calc
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                O guia prático para liquidar sentenças no sistema oficial da Justiça do Trabalho, com a Lei 14.905/2024 já aplicada.
              </p>
              <ul className="grid sm:grid-cols-2 gap-4">
                {EBOOK_TOPICS.map((topic) => (
                  <li key={topic.title} className="flex gap-3">
                    <topic.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">{topic.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{topic.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-primary mb-3">
              ECOSSISTEMA
            </h2>
            <p className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Use os créditos em todas as ferramentas
            </p>
            <p className="text-muted-foreground text-base">
              Um login, as soluções de IA da Suite para cálculo e produtividade trabalhista.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TOOLS.map((tool) => (
              <Link
                key={tool.title}
                to={tool.href}
                className="group bg-card border-2 border-border rounded-2xl p-7 hover:border-primary hover:shadow-card transition-all text-center sm:text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-cta flex items-center justify-center text-primary-foreground mb-4 mx-auto sm:mx-0 group-hover:scale-110 transition">
                  <tool.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wide mb-2">{tool.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">Conhecer ferramenta →</p>
              </Link>
            ))}

            <div className="sm:col-span-2 lg:col-span-3 bg-gradient-hero text-dark-foreground rounded-2xl p-8 md:p-10 text-center border-2 border-primary/30">
              <p className="text-2xl md:text-4xl font-black">
                MAIS CRÉDITOS, <span className="text-primary">MAIS PRODUTIVIDADE!</span>
              </p>
              <p className="text-white/70 mt-3 text-lg max-w-2xl mx-auto">
                400 créditos PlusCoin e o e-book do PJe-Calc no mesmo pacote por R$ 200.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, oklch(0.82 0.16 85 / 0.35), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-urgency-foreground bg-urgency/30 inline-block rounded-full px-4 py-1 mb-6">
            É hoje — 10 do 10
          </p>
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            <span className="text-primary">400 créditos</span> + e-book por R$ 200,00
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-4">
            Inclui o e-book oficial Cálculos Trabalhistas Aplicados ao PJe-Calc (Edição 2026)
          </p>
          <p className="text-base text-white/60 mb-10">
            A oferta é válida exclusivamente no sábado, 10 de outubro.
          </p>

          <CTAButton large checkoutUrl={checkoutUrl}>
            Aproveitar agora — R$ 200
          </CTAButton>

          <p className="text-sm text-white/60 mt-6">
            Campanha 10 do 10 · Ensino Plus · 10 de outubro de 2026
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · SuitePlus PlusCoin. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
