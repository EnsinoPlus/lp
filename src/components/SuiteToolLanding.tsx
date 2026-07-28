import { useState, type ComponentType } from "react";
import { UrgencyBar } from "@/components/UrgencyBar";
import { CheckCircle2, ChevronDown, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";

export type SuiteToolIcon = ComponentType<{ className?: string }>;

export type SuiteToolLandingProps = {
  brand: string;
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  description: string;
  signupUrl: string;
  appUrl: string;
  appLinkLabel: string;
  ctaLabel?: string;
  finalCtaLabel?: string;
  urgencyMessage?: string;
  freeCreditsNote?: string;
  heroHighlights: Array<{ icon: SuiteToolIcon; label: string; sub: string }>;
  trustItems: Array<{ icon: SuiteToolIcon; label: string }>;
  stats: Array<{ n: string; l: string }>;
  painEyebrow?: string;
  painTitle: string;
  painText: string;
  featuresEyebrow?: string;
  featuresTitle: string;
  featuresSubtitle?: string;
  features: Array<{ icon: SuiteToolIcon; title: string; desc: string }>;
  steps: Array<{ step: string; title: string; desc: string }>;
  differentialTitle: string;
  differentialText: string;
  differentialPoints: string[];
  faqs: Array<{ q: string; a: string }>;
  finalTitle: React.ReactNode;
  finalText: string;
  footerLabel: string;
};

function CTAButton({
  href,
  children,
  large = false,
}: {
  href: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <a
      href={href}
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

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold hover:bg-accent/50 transition"
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

export function SuiteToolLanding(props: SuiteToolLandingProps) {
  const {
    brand,
    badge,
    title,
    subtitle,
    description,
    signupUrl,
    appUrl,
    appLinkLabel,
    ctaLabel = "Criar conta e testar grátis",
    finalCtaLabel = "Começar grátis no SuitePlus",
    urgencyMessage = "TESTE GRÁTIS COM 20 CRÉDITOS — OFERTA POR TEMPO LIMITADO:",
    freeCreditsNote = "ao criar sua conta no SuitePlus",
    heroHighlights,
    trustItems,
    stats,
    painEyebrow = "O problema",
    painTitle,
    painText,
    featuresEyebrow = "A ferramenta",
    featuresTitle,
    featuresSubtitle = "Integrado ao ecossistema SuitePlus — um login, múltiplas ferramentas de IA para cálculos trabalhistas.",
    features,
    steps,
    differentialTitle,
    differentialText,
    differentialPoints,
    faqs,
    finalTitle,
    finalText,
    footerLabel,
  } = props;

  return (
    <div className="min-h-screen bg-background">
      <UrgencyBar message={urgencyMessage} />

      <section className="bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, oklch(0.55 0.2 280 / 0.45), transparent 45%), radial-gradient(circle at 10% 80%, oklch(0.7 0.19 38 / 0.35), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4 fill-primary" /> {badge}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6">
              {title}
              {subtitle ? (
                <span className="block text-2xl md:text-3xl font-bold text-white/70 mt-3">{subtitle}</span>
              ) : null}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-3xl mx-auto">
              {description}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="bg-white/5 border border-white/15 rounded-xl p-4 flex gap-3 items-start"
                >
                  <item.icon className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">{item.label}</p>
                    <p className="text-xs text-white/60 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
              <p className="text-white/70 text-sm uppercase tracking-wider font-semibold">Comece agora</p>
              <p className="text-4xl md:text-5xl font-black text-primary">20 créditos grátis</p>
              <p className="text-sm text-white/60">{freeCreditsNote}</p>
            </div>

            <CTAButton href={signupUrl} large>
              {ctaLabel}
            </CTAButton>

            <div className="flex flex-wrap gap-5 mt-8 text-sm text-white/70 justify-center">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-success" /> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark text-dark-foreground py-12 border-y-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-primary">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-primary font-bold uppercase text-sm tracking-wider">{painEyebrow}</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">{painTitle}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{painText}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">{featuresEyebrow}</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">{featuresTitle}</h2>
            <p className="text-muted-foreground text-lg">{featuresSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-card border-2 border-border rounded-2xl p-7 hover:border-primary hover:shadow-card transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-accent">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Passo a passo</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Como funciona na prática</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5 bg-card border-2 border-border rounded-2xl p-6">
                <div className="w-14 h-14 rounded-xl bg-dark text-primary font-black text-xl flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <ShieldCheck className="w-14 h-14 text-primary mx-auto mb-4" />
          <span className="text-primary font-bold uppercase text-sm tracking-wider">Diferencial</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">{differentialTitle}</h2>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8">{differentialText}</p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {differentialPoints.map((t) => (
              <div key={t} className="bg-card border border-border rounded-xl p-5 flex gap-3 items-start">
                <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Dúvidas frequentes</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <FAQItem key={item.q} {...item} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, oklch(0.7 0.19 38 / 0.5), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">{finalTitle}</h2>
          <p className="text-lg md:text-xl text-white/80 mb-10">{finalText}</p>
          <p className="text-4xl md:text-5xl font-black text-primary mb-8">20 créditos grátis</p>
          <CTAButton href={signupUrl} large>
            {finalCtaLabel}
          </CTAButton>
          <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2 flex-wrap">
            <a href={appUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition underline">
              Já tem conta? {appLinkLabel}
            </a>
          </p>
          <p className="text-xs text-white/40 mt-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {brand} · SuitePlus
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · SuitePlus {footerLabel}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
