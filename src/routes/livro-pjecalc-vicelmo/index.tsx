import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UrgencyBar } from "@/components/UrgencyBar";
import { useTrackedUrl } from "@/hooks/useSignupOrigin";
import { getBookCheckoutUrl } from "@/lib/runtime-config";
import bookCover from "@/assets/livro-pjecalc-capa.webp";
import sumarioPdf from "@/assets/livro-pjecalc-sumario.pdf";
import {
  BookOpen,
  Bot,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileCheck,
  Package,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/livro-pjecalc-vicelmo/")({
  head: () => ({
    meta: [
      {
        title: "Manual de Cálculos Trabalhistas no PJe-Calc — 6ª Edição | Livro Físico",
      },
      {
        name: "description",
        content:
          "Livro físico ilustrado com telas do PJe-Calc: liquidação passo a passo, juros, IA e impugnação. De R$ 168 por R$ 151,20 no PIX. Envio para todo o Brasil.",
      },
      {
        property: "og:title",
        content: "Manual de Cálculos Trabalhistas com Aplicação ao PJe-Calc — 6ª Edição",
      },
      {
        property: "og:description",
        content:
          "Pare de liquidar no improviso. O guia prático com telas reais do PJe-Calc — R$ 151,20 no PIX.",
      },
      { property: "og:image", content: bookCover },
    ],
  }),
  loader: async () => ({
    checkoutUrl: await getBookCheckoutUrl(),
  }),
  component: Landing,
});

const HIGHLIGHTS = [
  "Totalmente ilustrado com telas do PJe-Calc",
  "Liquidação de sentença passo a passo",
  "Lições avançadas sobre verbas e reflexos",
  "Casos práticos de liquidação de sentença",
  "Tudo sobre juros e correção nos cálculos trabalhistas e no PJe-Calc",
  "Capítulo exclusivo sobre inteligência artificial",
  "Capítulo inédito sobre impugnação de cálculos",
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
  const href = useTrackedUrl(checkoutUrl);
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

function Landing() {
  const { checkoutUrl } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <UrgencyBar message="ESTOQUE LIMITADO · DESCONTO NO PIX — GARANTA O SEU EM:" />

      {/* HERO */}
      <section className="bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, oklch(0.7 0.19 38 / 0.4), transparent 45%), radial-gradient(circle at 10% 80%, oklch(0.55 0.12 250 / 0.35), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-center max-w-6xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-4 h-4 fill-primary" /> 6ª Edição · Revista, ampliada e atualizada
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/55 mb-3">
                Livro físico · Editora Mizuno
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black leading-[1.05] mb-5">
                Domine o <span className="text-primary">PJe-Calc</span> e liquide sentenças sem medo de errar
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                O manual prático que mostra <strong className="text-white">tela por tela</strong> como fazer
                cálculos trabalhistas no sistema oficial da Justiça do Trabalho — com liquidação, juros,
                reflexos, IA e impugnação.
              </p>

              <div className="flex flex-wrap items-baseline justify-center lg:justify-start gap-3 mb-3">
                <span className="text-white/50 line-through text-2xl">R$ 168,00</span>
                <span className="text-5xl md:text-6xl font-black text-primary">R$ 151,20</span>
                <span className="text-sm text-white/60 uppercase tracking-wider font-semibold">no PIX</span>
              </div>
              <p className="text-sm text-white/55 mb-8">
                Economia de R$ 16,80 no PIX · Envio para todo o Brasil
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                <CTAButton large checkoutUrl={checkoutUrl}>
                  Quero o livro agora
                </CTAButton>
              </div>

              <div className="flex flex-wrap gap-5 mt-8 text-sm text-white/70 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-success" /> Frete para todo o Brasil
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Estoque limitado
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" /> Pagamento seguro
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src={bookCover}
                alt="Capa do Manual de Cálculos Trabalhistas com Aplicação ao PJe-Calc — 6ª edição"
                width={280}
                height={280}
                className="w-52 md:w-64 lg:w-72 rounded-xl shadow-card border border-white/15 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-primary font-bold uppercase text-sm tracking-wider">O problema</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">
            Um erro de cálculo pode custar o processo — e a sua reputação
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Advogados, calculistas, peritos e servidores enfrentam o mesmo desafio: liquidar com precisão
            no <strong className="text-foreground">PJe-Calc</strong>, acompanhar juros e correção da{" "}
            <strong className="text-foreground">Lei 14.905/2024</strong> e ainda defender (ou impugnar)
            números sob pressão. Teoria solta não basta. Você precisa de um método aplicado ao sistema
            real.
          </p>
        </div>
      </section>

      {/* SUMÁRIO DOWNLOAD */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-[220px_1fr] gap-8 items-center bg-card border-2 border-border rounded-2xl p-6 md:p-10 shadow-card">
            <img
              src={bookCover}
              alt="Capa do Manual de Cálculos Trabalhistas"
              width={220}
              height={220}
              className="w-44 md:w-52 mx-auto rounded-lg drop-shadow-2xl"
            />
            <div>
              <span className="text-primary font-bold uppercase text-sm tracking-wider">Antes de comprar</span>
              <h2 className="text-2xl md:text-4xl font-black mt-2 mb-3">Baixe o sumário grátis (PDF)</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Veja o índice completo e a amostra do conteúdo. Sem compromisso — e sem mistério sobre o que
                você vai receber em casa.
              </p>
              <a
                href={sumarioPdf}
                download="Manual-Calculos-Trabalhistas-Sumario-Amostra.pdf"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl px-6 py-4 hover:brightness-110 transition shadow-cta"
              >
                <BookOpen className="w-5 h-5" /> Baixar sumário grátis
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-dark text-dark-foreground py-12 border-y-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "6ª", l: "Edição atualizada" },
              { n: "PJe-Calc", l: "Telas reais ilustradas" },
              { n: "PIX", l: "10% de desconto" },
              { n: "BR", l: "Envio para todo o país" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-primary">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">O que você leva</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">
              Não é só teoria: é o passo a passo dentro do PJe-Calc
            </h2>
            <p className="text-muted-foreground text-lg">
              Conteúdo feito para quem precisa liquidar, conferir e defender números com segurança.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {[
              {
                icon: Calculator,
                title: "Sistema PJe-Calc na prática",
                desc: "Parametrização, telas e fluxo real — do lançamento à exportação, sem depender de ‘achismo’.",
              },
              {
                icon: Clock,
                title: "Jornada, horas extras e reflexos",
                desc: "Sexagesimal vs. centesimal, adicional noturno, DSR e as atualizações que mudam o resultado.",
              },
              {
                icon: Scale,
                title: "Juros e correção atualizados",
                desc: "O que mudou com a Lei 14.905/2024 e como aplicar corretamente nos cálculos trabalhistas.",
              },
              {
                icon: FileCheck,
                title: "Liquidação e impugnação",
                desc: "Capítulo inédito para atacar ou defender cálculos com método — não só com opinião.",
              },
              {
                icon: Bot,
                title: "Inteligência artificial aplicada",
                desc: "Capítulo exclusivo sobre IA no fluxo de cálculos — o diferencial da 6ª edição.",
              },
              {
                icon: BookOpen,
                title: "Casos práticos reais",
                desc: "Estudos de liquidação do zero à finalização, para você copiar o método no seu dia a dia.",
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

          <ul className="max-w-3xl mx-auto space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AUTHORITY — cold audience: introduce who wrote it */}
      <section className="py-16 md:py-20 bg-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Star className="w-14 h-14 text-primary mx-auto mb-4 fill-primary" />
          <span className="text-primary font-bold uppercase text-sm tracking-wider">Quem escreveu</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">
            Experiência de quem vive a Justiça do Trabalho
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8">
            Escrito por <strong>Vicelmo Alencar</strong>, servidor da Justiça do Trabalho e especialista em
            liquidação de sentenças. A 6ª edição pela <strong>Editora Mizuno</strong> une rigor jurídico ao
            detalhe operacional do PJe-Calc — o sistema que você usa (ou vai usar) de verdade.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              "Servidor da Justiça do Trabalho",
              "Especialista em liquidação de sentenças",
              "Autor best-seller da Série Mizuno",
            ].map((t) => (
              <div key={t} className="bg-card border border-border rounded-xl p-5 flex gap-3 items-start">
                <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-dark text-dark-foreground rounded-2xl p-8 md:p-12 border-2 border-primary/40 shadow-card text-center">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Oferta</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4">
              Livro físico na sua mesa — com desconto no PIX
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              De <span className="line-through text-white/50">R$ 168,00</span> por{" "}
              <strong className="text-primary text-2xl">R$ 151,20</strong> pagando no PIX. Cartão também
              disponível. Se já usa o SuitePlus, pode aplicar créditos como desconto extra no checkout.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-success" /> Envio Brasil
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" /> Checkout seguro (Asaas)
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Unidades limitadas
              </div>
            </div>
            <CTAButton large checkoutUrl={checkoutUrl}>
              Garantir meu exemplar — R$ 151,20
            </CTAButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Dúvidas frequentes</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Serve para quem está começando no PJe-Calc?",
                a: "Sim. O manual cobre desde a lógica da liquidação até o uso ilustrado do sistema — ideal para quem quer parar de ‘adivinhar’ e seguir um método.",
              },
              {
                q: "É livro físico ou PDF?",
                a: "É o livro físico (Editora Mizuno, 6ª edição), enviado para o endereço que você informar no checkout. O sumário em PDF é só a amostra gratuita.",
              },
              {
                q: "Por que pagar R$ 151,20 e não R$ 168?",
                a: "No PIX você ganha 10% de desconto (R$ 16,80 a menos). Cartão fica no valor integral de R$ 168,00.",
              },
              {
                q: "Posso usar créditos do SuitePlus?",
                a: "Sim. No checkout do livro, faça login na sua conta SuitePlus para aplicar créditos como desconto (conforme regras da plataforma).",
              },
              {
                q: "Entrega para todo o Brasil?",
                a: "Sim. O envio é para todo o território nacional. Após a confirmação do pagamento, o pedido é preparado e enviado ao endereço informado.",
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
            backgroundImage: "radial-gradient(circle at 50% 50%, oklch(0.7 0.19 38 / 0.5), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            A precisão do cálculo é o que garante o <span className="text-primary">êxito da execução</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            Pare de improvisar. Tenha na sua mesa o manual ilustrado que transforma dúvida em método —
            direto no PJe-Calc.
          </p>

          <div className="flex items-baseline justify-center gap-4 mb-8">
            <span className="text-white/50 line-through text-2xl">R$ 168</span>
            <span className="text-6xl font-black text-primary">R$ 151,20</span>
          </div>

          <CTAButton large checkoutUrl={checkoutUrl}>
            Comprar com desconto no PIX
          </CTAButton>

          <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4" /> Pagamento seguro · Envio para todo o Brasil
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · Manual de Cálculos Trabalhistas (Editora Mizuno). Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
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
