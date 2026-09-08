import { createFileRoute, Link } from "@tanstack/react-router";
import { UrgencyBar } from "@/components/UrgencyBar";
import { useTrackedUrl } from "@/hooks/useSignupOrigin";
import { getCreditsCheckoutUrl } from "@/lib/runtime-config";
import {
  Calculator,
  CalendarX,
  Clock,
  Coins,
  FileText,
  Gift,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/suiteplus-promo-0909/")({
  head: () => ({
    meta: [
      {
        title: "SuitePlus — 400 Créditos por R$ 100 | Promoção 9.9",
      },
      {
        name: "description",
        content:
          "Promoção exclusiva 09/09: recarregue no SuitePlus e ganhe 400 créditos PlusCoin por apenas R$ 100 — com 100 créditos de bônus. Somente 1 dia!",
      },
      { property: "og:title", content: "SuitePlus — Promoção 9.9 | PlusCoin" },
      {
        property: "og:description",
        content:
          "400 créditos por R$ 100,00. R$ 0,25 por crédito + 100 de bônus. Calc Machine, Ponto Mágico e mais ferramentas de IA.",
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
    desc: "Cálculos trabalhistas com IA integrada ao fluxo do calculista.",
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
    desc: "Analise holerites e verbas com clareza e precisão.",
    href: "/contracheque-transparente/" as const,
  },
  {
    icon: CalendarX,
    title: "EXTRATOR DE AUSÊNCIAS",
    desc: "Extraia e organize ausências e faltas automaticamente.",
    href: "/extrator-de-ausencias/" as const,
  },
  {
    icon: Wallet,
    title: "FGTS FÁCIL",
    desc: "Simplifique cálculos e consultas relacionadas ao FGTS.",
    href: "/fgts-facil/" as const,
  },
] as const;

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
      <UrgencyBar message="PROMOÇÃO 9.9 — SOMENTE 1 DIA! TERMINA EM:" />

      {/* HERO */}
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
              <Sparkles className="w-4 h-4" /> Oferta por tempo limitado · 09/09
            </div>

            <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
              SuitePlus
            </p>
            <p className="text-6xl md:text-7xl font-black text-primary leading-none mb-2">09/09</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-4">
              Promoção <span className="text-primary">9.9</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10">
              A melhor oferta de créditos do ano
            </p>

            {/* PlusCoin */}
            <div className="inline-flex flex-col items-center mb-10">
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 blur-2xl opacity-60 rounded-full"
                  style={{ background: "radial-gradient(circle, oklch(0.82 0.16 85), transparent 70%)" }}
                />
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center border-4 border-amber-400/80 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-[0_0_40px_oklch(0.82_0.16_85_/_0.5)]">
                  <Coins className="w-12 h-12 md:w-14 md:h-14 text-amber-900" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black tracking-wide text-amber-300">PLUSCOIN</p>
            </div>

            {/* Price block */}
            <div className="bg-white/5 border-2 border-primary/40 rounded-2xl p-8 md:p-10 max-w-xl mx-auto mb-8 shadow-card">
              <div className="inline-flex items-center gap-1 bg-gradient-cta text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-5">
                <Sparkles className="w-3 h-3" /> MELHOR OFERTA
              </div>
              <p className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2">400</p>
              <p className="text-lg md:text-xl font-bold uppercase tracking-wider text-white/80 mb-4">
                Créditos
              </p>
              <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                <span className="text-white/40 line-through text-lg">300 créditos</span>
                <span className="text-5xl md:text-6xl font-black text-primary">R$ 100,00</span>
              </div>
              <p className="text-sm text-white/50 mb-4">R$ 0,25 por crédito — 100 créditos de bônus</p>
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" /> Bônus exclusivo 09/09
              </div>
            </div>

            <CTAButton large checkoutUrl={checkoutUrl}>
              Recarregar agora — R$ 100
            </CTAButton>

            <div className="flex flex-wrap gap-5 mt-8 text-sm text-white/70 justify-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Oferta válida somente em 09/09
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" /> Créditos PlusCoin na plataforma
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-dark text-dark-foreground py-12 border-y-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "400", l: "Créditos PlusCoin" },
              { n: "R$ 100", l: "Investimento único" },
              { n: "+100", l: "Créditos de bônus" },
              { n: "09/09", l: "Somente 1 dia" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-primary">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Ecossistema</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">
              Use seus créditos em todas as ferramentas
            </h2>
            <p className="text-muted-foreground text-lg">
              Um login, múltiplas soluções de IA para cálculos e produtividade trabalhista.
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
                Aproveite o pacote promocional e acelere seus cálculos, conversões e análises no SuitePlus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
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
            Última chance — 09/09
          </p>
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            <span className="text-primary">400 créditos</span> por R$ 100,00
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-4">
            Inclui 100 créditos de bônus · R$ 0,25 por crédito
          </p>
          <p className="text-base text-white/60 mb-10">
            Recarregue hoje e desbloqueie todo o poder do SuitePlus com PlusCoin.
          </p>

          <CTAButton large checkoutUrl={checkoutUrl}>
            Garantir meus 400 créditos
          </CTAButton>

          <p className="text-sm text-white/60 mt-6">
            Promoção exclusiva válida em 09/09/2026 · Somente 1 dia
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
