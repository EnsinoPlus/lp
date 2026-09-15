import { createFileRoute } from "@tanstack/react-router";
import { CctSignupForm } from "@/components/CctSignupForm";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  PlayCircle,
  Search,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/cct/")({
  head: () => ({
    meta: [
      {
        title: "CCT 2026 — Clube do Cálculo Trabalhista | Cadastre-se",
      },
      {
        name: "description",
        content:
          "Formação completa em cálculos trabalhistas: 30+ cursos, 500+ aulas, certificados digitais e trilhas do básico ao avançado. Cadastre-se e comece agora.",
      },
      {
        property: "og:title",
        content: "CCT 2026 — Clube do Cálculo Trabalhista",
      },
      {
        property: "og:description",
        content:
          "Cursos em vídeo, progresso por aula e certificados. Cadastre-se no Clube do Cálculo Trabalhista.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BookOpen,
    title: "Cursos e trilhas",
    desc: "Mais de 30 cursos completos, organizados do básico ao avançado em cálculos trabalhistas.",
  },
  {
    icon: PlayCircle,
    title: "Aulas em vídeo",
    desc: "500+ aulas práticas para assistir no seu ritmo, com progresso salvo automaticamente.",
  },
  {
    icon: Award,
    title: "Certificados digitais",
    desc: "Emita certificado ao concluir o curso, com verificação pública do seu aproveitamento.",
  },
  {
    icon: GraduationCap,
    title: "Formação CFC",
    desc: "Conteúdo pensado para fortalecer sua carreira — inclusive com pontuação CFC.",
  },
  {
    icon: Search,
    title: "Busca e favoritos",
    desc: "Encontre aulas rapidamente, marque favoritos e retome de onde parou.",
  },
  {
    icon: Sparkles,
    title: "Metodologia Vicelmo",
    desc: "Aprenda com a referência nacional em PJe-Calc e cálculos trabalhistas.",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Cadastre-se",
    desc: "Crie sua conta em poucos minutos com nome, e-mail e senha.",
  },
  {
    step: "02",
    title: "Confirme o e-mail",
    desc: "Valide seu cadastro pelo link enviado na sua caixa de entrada.",
  },
  {
    step: "03",
    title: "Comece a estudar",
    desc: "Acesse cursos, trilhas e aulas e avance no seu ritmo.",
  },
] as const;

function ScrollToSignup({
  children,
  large = false,
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <a
      href="#cadastro"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta ${
        large ? "px-8 py-5 text-lg md:text-xl" : "px-6 py-4 text-base"
      }`}
    >
      <UserPlus className="w-5 h-5" />
      {children}
    </a>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 15%, oklch(0.55 0.22 250 / 0.45), transparent 45%), radial-gradient(circle at 10% 85%, oklch(0.7 0.19 38 / 0.4), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-14 md:py-24 relative">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-4 h-4 fill-primary" /> Clube do Cálculo Trabalhista · 2026
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.05] mb-6">
                Domine os cálculos trabalhistas
                <span className="block text-primary mt-2">com formação completa</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Cursos em vídeo, trilhas por nível, progresso por aula e certificados digitais — tudo em
                uma plataforma feita para quem quer evoluir na prática.
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 mb-6 text-center">
                {[
                  { n: "30+", l: "Cursos" },
                  { n: "500+", l: "Aulas" },
                  { n: "CFC", l: "Certificação" },
                ].map((item) => (
                  <div
                    key={item.l}
                    className="bg-white/5 border border-white/15 rounded-xl p-3"
                  >
                    <p className="text-2xl font-black text-primary">{item.n}</p>
                    <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">{item.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50 hidden lg:block">
                Cadastro rápido · Confirme o e-mail e comece
              </p>
            </div>

            <div
              id="cadastro"
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl scroll-mt-8"
            >
              <div className="mb-5 text-center">
                <h2 className="text-xl font-black text-white">Crie sua conta</h2>
                <p className="text-sm text-white/60 mt-1">Preencha e comece em minutos</p>
              </div>
              <CctSignupForm variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-dark text-dark-foreground py-12 border-y-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "30+", l: "Cursos" },
              { n: "500+", l: "Aulas" },
              { n: "Trilhas", l: "Do básico ao avançado" },
              { n: "100%", l: "Online e no seu ritmo" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-primary">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-primary font-bold uppercase text-sm tracking-wider">Para quem é</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">
            Feito para quem vive de cálculo trabalhista
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Advogados, calculistas, peritos, contadores e profissionais de DP que precisam de conteúdo
            atualizado, prático e organizado — sem perder tempo caçando material espalhado.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">A plataforma</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">
              Tudo que você precisa para evoluir
            </h2>
            <p className="text-muted-foreground text-lg">
              Uma experiência moderna para estudar, acompanhar progresso e se certificar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((f) => (
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

          <div className="text-center mt-12">
            <ScrollToSignup>Criar minha conta</ScrollToSignup>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-16 md:py-20 bg-accent">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Comece agora</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Como funciona</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-card border-2 border-border rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-dark text-primary font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, oklch(0.7 0.19 38 / 0.5), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            Pronto para <span className="text-primary">começar sua formação?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            Cadastre-se agora, confirme o e-mail e acesse a plataforma do Clube do Cálculo Trabalhista.
          </p>
          <ScrollToSignup large>Quero me cadastrar</ScrollToSignup>
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-white/60">
            {["Cadastro em minutos", "Confirmação por e-mail", "Acesso à plataforma"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · Clube do Cálculo Trabalhista. Todos os direitos reservados.
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
}
