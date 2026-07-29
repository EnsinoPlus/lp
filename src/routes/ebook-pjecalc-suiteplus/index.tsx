import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UrgencyBar } from "@/components/UrgencyBar";
import { useTrackedUrl } from "@/hooks/useSignupOrigin";
import heroImg from "@/assets/hero-ebook-pjecalc-vicelmo-2026.jpg";
import catalogoCover from "@/assets/catalogo-capa-pjecalc-vicelmo.png";
import sumarioPdf from "@/assets/pjecalc-sumario.pdf";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  FileCheck,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  UserPlus,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-suiteplus/")({
  head: () => ({
    meta: [
      {
        title: "E-book Pje-Calc 2026 no SuitePlus — Cadastre-se e compre com créditos",
      },
      {
        name: "description",
        content:
          "Crie sua conta no SuitePlus, ganhe 20 créditos, recarregue R$ 50 (120 créditos) e compre o E-book Pje-Calc 2026 dentro da plataforma.",
      },
      {
        property: "og:title",
        content: "E-book Pje-Calc 2026 — compre no SuitePlus",
      },
      {
        property: "og:description",
        content:
          "Cadastro grátis com 20 créditos. Recarregue R$ 50 e leve o guia do Prof. Vicelmo Alencar pelo SuitePlus.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() ||
  "https://suiteplus.ensinoplus.com.br/register";
const RECHARGE_URL =
  import.meta.env.VITE_SUITEPLUS_RECHARGE_URL?.trim() ||
  "https://suiteplus.ensinoplus.com.br/recarregar";
const SUITEPLUS_URL =
  import.meta.env.VITE_SUITEPLUS_HOME_URL?.trim() ||
  "https://suiteplus.ensinoplus.com.br/";

function SignupCTA({
  children,
  large = false,
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  const href = useTrackedUrl(SIGNUP_URL);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta ${
        large ? "px-8 py-5 text-lg md:text-xl" : "px-6 py-4 text-base"
      }`}
    >
      <UserPlus className="w-5 h-5" />
      {children}
    </a>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const tracked = useTrackedUrl(href);
  return (
    <a
      href={tracked}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 px-6 py-4 text-base font-bold text-white hover:bg-white/10 transition"
    >
      {children}
    </a>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <UrgencyBar message="E-BOOK VIA SUITEPLUS — CADASTRO GRÁTIS + 20 CRÉDITOS:" />

      {/* HERO */}
      <section className="bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, oklch(0.7 0.19 38 / 0.4), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 fill-primary" /> Via SuitePlus · Sem Hotmart
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6 ml-0 md:ml-2">
              <Star className="w-4 h-4 fill-primary text-primary" /> Edição 2026 — Atualizada
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6">
              Domine o <span className="text-primary">Pje-Calc</span> e a Nova Lei de Atualização Monetária
              <span className="block text-2xl md:text-3xl font-bold text-white/70 mt-3">
                (Lei 14.905/2024)
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              O guia prático do <strong className="text-white">Prof. Vicelmo Alencar</strong>.
              Agora você compra pelo <strong className="text-white">SuitePlus</strong>: cria a conta,
              ganha créditos e libera o e-book com uma recarga.
            </p>

            <div className="w-full mb-8">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-card border border-border bg-black max-w-3xl mx-auto">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/eKro92yXXTk?rel=0&modestbranding=1"
                  title="Apresentação do E-book Pje-Calc 2026"
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8 text-left">
              {[
                { n: "1", title: "Cadastre-se", desc: "Conta grátis + 20 créditos" },
                { n: "2", title: "Recarregue R$ 50", desc: "Receba 120 créditos" },
                { n: "3", title: "Compre o e-book", desc: "Direto no SuitePlus" },
              ].map((step) => (
                <div
                  key={step.n}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3"
                >
                  <div className="text-primary font-black text-sm mb-1">Passo {step.n}</div>
                  <div className="font-bold text-white">{step.title}</div>
                  <div className="text-xs text-white/60 mt-0.5">{step.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <SignupCTA large>Criar conta e ganhar 20 créditos</SignupCTA>
              <SecondaryLink href={RECHARGE_URL}>
                <Wallet className="w-5 h-5" />
                Já tenho conta — recarregar
              </SecondaryLink>
            </div>

            <div className="flex flex-wrap gap-5 mt-6 text-sm text-white/70 justify-center">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" /> 20 créditos no cadastro
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-success" /> R$ 50 = 120 créditos
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Acesso no SuitePlus
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">
              Como comprar
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">
              Em 3 passos simples
            </h2>
            <p className="text-muted-foreground text-lg">
              Sem Hotmart. Tudo acontece dentro do ecossistema SuitePlus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: UserPlus,
                title: "1. Crie sua conta",
                desc: "Cadastro gratuito no SuitePlus. Você já recebe 20 créditos para começar a explorar as ferramentas.",
              },
              {
                icon: Wallet,
                title: "2. Recarregue R$ 50",
                desc: "Na área de recarga, escolha o pacote de R$ 50 e receba 120 créditos na hora.",
              },
              {
                icon: BookOpen,
                title: "3. Compre o e-book",
                desc: "Com os créditos disponíveis, adquira o E-book Pje-Calc 2026 dentro do SuitePlus.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border-2 border-border rounded-2xl p-7 hover:border-primary hover:shadow-card transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center text-primary-foreground mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <SignupCTA>Quero começar pelo cadastro</SignupCTA>
          </div>
        </div>
      </section>

      {/* CATALOG DOWNLOAD */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-[220px_1fr] gap-8 items-center bg-card border border-border rounded-2xl p-6 md:p-10 shadow-card">
            <img
              src={catalogoCover}
              alt="Capa do e-book Pje-Calc 2026"
              width={220}
              height={220}
              className="w-44 md:w-52 mx-auto rounded-lg drop-shadow-2xl"
            />
            <div>
              <span className="text-primary font-bold uppercase text-sm tracking-wider">
                Sumário do e-book
              </span>
              <h2 className="text-2xl md:text-4xl font-black mt-2 mb-3">
                Baixe o catálogo completo (PDF)
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Veja todos os tópicos e unidades antes de comprar. Download imediato.
              </p>
              <a
                href={sumarioPdf}
                download="Calculos-Trabalhistas-Aplicados-ao-Pje-Calc-Sumario.pdf"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl px-6 py-4 hover:brightness-110 transition shadow-cta"
              >
                Baixar sumário em PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-dark text-dark-foreground py-12 border-y-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "13.8K+", l: "Profissionais alcançados" },
              { n: "262+", l: "Avaliações positivas" },
              { n: "4.9/5", l: "Nota média" },
              { n: "89%", l: "Recomendam" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-primary">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">O conteúdo</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">
              Muito mais que teoria: o passo a passo dentro do Pje-Calc
            </h2>
            <p className="text-muted-foreground text-lg">
              Conteúdo prático baseado em casos reais da Justiça do Trabalho.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Calculator,
                title: "Sistema Pje-Calc",
                desc: "Da instalação à parametrização avançada. Aprenda a configurar férias, faltas, histórico salarial e a proporcionalizar verbas sem erros no sistema.",
              },
              {
                icon: Clock,
                title: "Jornada e Horas Extras",
                desc: "Cálculos complexos de hora sexagesimal vs. centesimal, adicional noturno, reflexos em DSR e a aplicação da nova redação da OJ 394 do TST.",
              },
              {
                icon: Scale,
                title: "Atualização Monetária 2026",
                desc: "O que mudou com a Lei 14.905/2024. Domine juros de mora, juros regressivos e a atualização de débitos da Fazenda Pública.",
              },
              {
                icon: FileCheck,
                title: "Liquidação e Impugnação",
                desc: "Aprenda os princípios da inalterabilidade da sentença, limitação aos valores da inicial e como impugnar cálculos com base no art. 884 da CLT.",
              },
            ].map((f) => (
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

      {/* DIFFERENTIAL */}
      <section className="py-16 md:py-20 bg-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="w-14 h-14 text-primary mx-auto mb-4" />
            <span className="text-primary font-bold uppercase text-sm tracking-wider">
              Diferencial exclusivo
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">
              Inclui Estudo de Caso Real
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              Não fique apenas na teoria. Na <strong>Unidade VIII</strong>, apresento um{" "}
              <strong>estudo de caso real</strong>, onde aplicamos todo o conhecimento em uma
              liquidação completa, do zero à finalização no Pje-Calc.
            </p>
          </div>
        </div>
      </section>

      {/* AUTHORITY */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <img
              src={heroImg}
              alt="Prof. Vicelmo Alencar — autoridade em Pje-Calc"
              width={600}
              height={600}
              loading="lazy"
              className="rounded-2xl shadow-card"
            />
            <div>
              <span className="text-primary font-bold uppercase text-sm tracking-wider">
                Autoridade
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 mb-5">
                A experiência de quem vive a Justiça do Trabalho
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                O <strong className="text-foreground">Prof. Vicelmo Alencar</strong> traz sua
                expertise dos quadros da Justiça do Trabalho para dentro deste livro, unindo o
                rigor jurídico à prática necessária para peritos e advogados.
              </p>
              <ul className="space-y-3">
                {[
                  "Servidor da Justiça do Trabalho",
                  "Especialista em liquidação de sentenças",
                  "Mais de 13 mil profissionais alcançados",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">
              Dúvidas frequentes
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Por que preciso me cadastrar no SuitePlus?",
                a: "Porque nesta oferta o e-book é adquirido dentro do SuitePlus, com créditos. Ao criar a conta você já ganha 20 créditos e passa a ter acesso às ferramentas da plataforma.",
              },
              {
                q: "O que significa a recarga de R$ 50?",
                a: "Ao recarregar R$ 50 no SuitePlus você recebe 120 créditos. Com esses créditos você compra o e-book dentro da plataforma.",
              },
              {
                q: "Já tenho conta no SuitePlus. O que faço?",
                a: "Faça login, vá em Recarregar, escolha o pacote de R$ 50 (120 créditos) e depois compre o e-book no SuitePlus.",
              },
              {
                q: "O conteúdo serve para quem é iniciante no Pje-Calc?",
                a: "Sim! Cobrimos desde a instalação do sistema e atualização de tabelas até funções avançadas de exportação de relatórios.",
              },
              {
                q: "Vou entender as mudanças de 2024 e 2025?",
                a: "Sim, este é o foco da Edição 2026: atualizar você sobre a Lei 14.905/2024 e as novas interpretações dos tribunais (como a OJ 394).",
              },
            ].map((item, i) => (
              <FAQItem key={i} {...item} defaultOpen={i === 0} />
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
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            Comece pelo cadastro e libere o e-book no{" "}
            <span className="text-primary">SuitePlus</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Conta grátis + 20 créditos → recarga de R$ 50 (120 créditos) → compre o e-book na
            plataforma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <SignupCTA large>Criar conta gratuitamente</SignupCTA>
            <SecondaryLink href={SUITEPLUS_URL}>
              Ir para o SuitePlus
              <ArrowRight className="w-5 h-5" />
            </SecondaryLink>
          </div>

          <p className="text-sm text-white/60 mt-4 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Um login, múltiplas ferramentas + o e-book
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Prof. Vicelmo Alencar · SuitePlus. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function FAQItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
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
          className={`w-5 h-5 flex-shrink-0 text-primary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}
