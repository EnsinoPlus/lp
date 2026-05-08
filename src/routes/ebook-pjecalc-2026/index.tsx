import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UrgencyBar } from "@/components/UrgencyBar";
import heroImg from "@/assets/hero-ebook.jpg";
import catalogoCover from "@/assets/catalogo-capa-pjecalc-vicelmo.png";
import sumarioPdf from "@/assets/pjecalc-sumario.pdf";
import { CheckCircle2, ChevronDown, Clock, ShieldCheck, Star, Zap, BookOpen, Calculator, Scale, FileCheck } from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-2026/")({
  head: () => ({
    meta: [
      { title: "E-book Pje-Calc 2026 — Domine a Lei 14.905/2024 | Prof. Vicelmo" },
      { name: "description", content: "Guia prático para liquidar sentenças no Pje-Calc. Lei 14.905/2024, OJ 394, juros e atualização monetária. R$ 57 — oferta de lançamento." },
      { property: "og:title", content: "E-book Pje-Calc 2026 — Prof. Vicelmo Alencar" },
      { property: "og:description", content: "O guia definitivo para liquidar sentenças com precisão na Justiça do Trabalho." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Landing,
});

function CTAButton({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  const href = import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/R105606128X";
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
  return (
    <div className="min-h-screen bg-background">
      <UrgencyBar />

      {/* HERO */}
      <section className="bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, oklch(0.7 0.19 38 / 0.4), transparent 50%)" }} />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
                <Star className="w-4 h-4 fill-primary" /> Edição 2026 — Atualizada
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6">
                Domine o <span className="text-primary">Pje-Calc</span> e a Nova Lei de Atualização Monetária
                <span className="block text-2xl md:text-3xl font-bold text-white/70 mt-3">(Lei 14.905/2024)</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                O guia prático e definitivo do <strong className="text-white">Prof. Vicelmo Alencar</strong> para liquidar sentenças com precisão, evitar o enriquecimento ilícito e dominar o sistema oficial da Justiça do Trabalho.
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

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-white/50 line-through text-2xl">R$ 97</span>
                <span className="text-5xl md:text-6xl font-black text-primary">R$ 57</span>
                <span className="text-sm text-white/60">à vista</span>
              </div>

              <CTAButton large>Quero a versão 2026 do E-book</CTAButton>

              <div className="flex flex-wrap gap-5 mt-8 text-sm text-white/70 justify-center">
                <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-success" /> Garantia 7 dias</div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Acesso imediato</div>
                <div className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-success" /> PDF + Bônus</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG DOWNLOAD */}
      <section className="py-12 md:py-16 bg-secondary">
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
              <span className="text-primary font-bold uppercase text-sm tracking-wider">Sumário do e-book</span>
              <h2 className="text-2xl md:text-4xl font-black mt-2 mb-3">Baixe o catálogo completo (PDF)</h2>
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

      {/* SOCIAL PROOF STATS */}
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
            <p className="text-muted-foreground text-lg">Conteúdo prático baseado em casos reais da Justiça do Trabalho.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Calculator, title: "Sistema Pje-Calc", desc: "Da instalação à parametrização avançada. Aprenda a configurar férias, faltas, histórico salarial e a proporcionalizar verbas sem erros no sistema." },
              { icon: Clock, title: "Jornada e Horas Extras", desc: "Cálculos complexos de hora sexagesimal vs. centesimal, adicional noturno, reflexos em DSR e a aplicação da nova redação da OJ 394 do TST." },
              { icon: Scale, title: "Atualização Monetária 2026", desc: "O que mudou com a Lei 14.905/2024. Domine juros de mora, juros regressivos e a atualização de débitos da Fazenda Pública." },
              { icon: FileCheck, title: "Liquidação e Impugnação", desc: "Aprenda os princípios da inalterabilidade da sentença, limitação aos valores da inicial e como impugnar cálculos com base no art. 884 da CLT." },
            ].map((f) => (
              <div key={f.title} className="group bg-card border-2 border-border rounded-2xl p-7 hover:border-primary hover:shadow-card transition-all">
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
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Diferencial exclusivo</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">Inclui Estudo de Caso Real</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              Não fique apenas na teoria. Na <strong>Unidade VIII</strong>, apresento um <strong>estudo de caso real</strong>, onde aplicamos todo o conhecimento em uma liquidação completa, do zero à finalização no Pje-Calc.
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
              <span className="text-primary font-bold uppercase text-sm tracking-wider">Autoridade</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 mb-5">A experiência de quem vive a Justiça do Trabalho</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                O <strong className="text-foreground">Prof. Vicelmo Alencar</strong> traz sua expertise dos quadros da Justiça do Trabalho para dentro deste livro, unindo o rigor jurídico à prática necessária para peritos e advogados.
              </p>
              <ul className="space-y-3">
                {["Servidor da Justiça do Trabalho", "Especialista em liquidação de sentenças", "Mais de 13 mil profissionais alcançados"].map((t) => (
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
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Dúvidas frequentes</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "O conteúdo serve para quem é iniciante no Pje-Calc?", a: "Sim! Cobrimos desde a instalação do sistema e atualização de tabelas até funções avançadas de exportação de relatórios." },
              { q: "O livro aborda categorias específicas?", a: "Com certeza. Temos seções dedicadas a cálculos de Advogados, Bancários, Vigilantes, Artistas, Aeronautas e até Empregados Domésticos." },
              { q: "Vou entender as mudanças de 2024 e 2025?", a: "Sim, este é o foco da Edição 2026: atualizar você sobre a Lei 14.905/2024 e as novas interpretações dos tribunais (como a OJ 394)." },
            ].map((item, i) => <FAQItem key={i} {...item} defaultOpen={i === 0} />)}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-hero text-dark-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, oklch(0.7 0.19 38 / 0.5), transparent 60%)" }} />
        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            A precisão matemática é o que garante o <span className="text-primary">êxito da execução</span>.
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            Um erro de cálculo pode custar caro. Proteja seu cliente e sua carreira com o guia mais atualizado do mercado.
          </p>

          <div className="flex items-baseline justify-center gap-4 mb-8">
            <span className="text-white/50 line-through text-2xl">R$ 97</span>
            <span className="text-6xl font-black text-primary">R$ 57</span>
          </div>

          <CTAButton large>Garantir meu guia atualizado — R$ 57</CTAButton>

          <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Garantia incondicional de 7 dias
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Prof. Vicelmo Alencar. Todos os direitos reservados.
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
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold hover:bg-accent/50 transition"
      >
        <span>{q}</span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}
