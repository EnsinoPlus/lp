import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UrgencyBar } from "@/components/UrgencyBar";
import { useTrackedUrl } from "@/hooks/useSignupOrigin";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  FileUp,
  History,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Wand2,
  Zap,
  Upload,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/ponto-magico/")({
  head: () => ({
    meta: [
      {
        title: "Ponto Mágico — Converta Cartão de Ponto em CSV para o PJe-Calc | SuitePlus",
      },
      {
        name: "description",
        content:
          "IA extrai horários de PDFs de cartão de ponto e gera CSV pronto para o PJe-Calc. Teste grátis com 20 créditos no SuitePlus. Edição, histórico e geração por parâmetros.",
      },
      { property: "og:title", content: "Ponto Mágico — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "Pare de digitar cartão de ponto manualmente. Converta PDFs em segundos com IA integrada ao PJe-Calc.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_PONTO_MAGICO_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_PONTO_MAGICO_APP_URL?.trim() || "https://pontomagico.ensinoplus.com.br/";

const TESTE_PARAMETROS = {
  dataInicial: "01/01/2026",
  dataFinal: "28/02/2026",
  texto:
    "De segunda a sexta horário de 08h às 12h e das 13h às 19h, sendo que em uma quarta-feira por mês o horário era das 8h às 13h e das 13h30 às 20h. Em 2 domingos por mês das 8h às 15h. Em 2 sábados por mês das 8h às 14h.",
};

function CTAButton({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  const signupHref = useTrackedUrl(SIGNUP_URL);
  return (
    <a
      href={signupHref}
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
      <UrgencyBar message="TESTE GRÁTIS COM 20 CRÉDITOS — OFERTA POR TEMPO LIMITADO:" />

      {/* HERO */}
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
              <Sparkles className="w-4 h-4 fill-primary" /> SuitePlus · Ponto Mágico
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6">
              Converta <span className="text-primary">Cartão de Ponto</span> em CSV para o PJe-Calc
              <span className="block text-2xl md:text-3xl font-bold text-white/70 mt-3">
                em segundos, com IA
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-3xl mx-auto">
              Pare de digitar horários manualmente. Envie o PDF, descreva a jornada por parâmetros ou use o exemplo
              gratuito — e receba planilha estruturada pronta para importar no{" "}
              <strong className="text-white">PJe-Calc</strong>.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
              {[
                { icon: FileUp, label: "Upload de PDF", sub: "Cartão de ponto em PDF" },
                { icon: Wand2, label: "Gerar por parâmetros", sub: "Jornada em texto livre" },
                { icon: FileSpreadsheet, label: "CSV para PJe-Calc", sub: "Importação direta" },
              ].map((item) => (
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
              <p className="text-sm text-white/60">ao criar sua conta no SuitePlus</p>
            </div>

            <CTAButton large>Criar conta e testar grátis</CTAButton>

            <div className="flex flex-wrap gap-5 mt-8 text-sm text-white/70 justify-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Exemplo sem consumo de crédito
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Histórico de conversões
              </div>
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-success" /> Edição antes de exportar
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
              { n: "95/100", l: "Potencial de produtividade" },
              { n: "20", l: "Créditos ao cadastrar" },
              { n: "IA", l: "Processamento Gemini" },
              { n: "PJe-Calc", l: "CSV otimizado" },
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
          <span className="text-primary font-bold uppercase text-sm tracking-wider">O problema</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">
            Digitar cartão de ponto é lento, tedioso e arriscado
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Calculistas, advogados trabalhistas, RH e departamentos de pessoal perdem horas transcrevendo espelhos de
            ponto — e um erro de horário pode comprometer todo o cálculo. O Ponto Mágico elimina essa etapa com IA
            treinada para extrair e estruturar jornadas automaticamente.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">A ferramenta</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">
              Tudo que você precisa do PDF ao CSV final
            </h2>
            <p className="text-muted-foreground text-lg">
              Integrado ao ecossistema SuitePlus — um login, múltiplas ferramentas de IA para cálculos trabalhistas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Upload,
                title: "Upload de PDF",
                desc: "Envie o cartão de ponto em PDF. A IA extrai dias, horários e variações de jornada automaticamente.",
              },
              {
                icon: Wand2,
                title: "Gerar por Parâmetros",
                desc: "Descreva a jornada em texto livre — sem PDF — e gere o CSV para períodos longos.",
              },
              {
                icon: History,
                title: "Relatório e Histórico",
                desc: "Consulte todas as conversões realizadas. Rastreie o que foi processado e quando.",
              },
              {
                icon: FileSpreadsheet,
                title: "Planilhas Salvas",
                desc: "Salve na plataforma para revisar, reutilizar ou baixar depois, sem reprocessar.",
              },
              {
                icon: Pencil,
                title: "Edição e Modificações",
                desc: "Corrija dados na tabela, aplique modificações e regenere o resultado com segurança.",
              },
              {
                icon: CheckCircle2,
                title: "CSV para PJe-Calc",
                desc: "Download estruturado e otimizado para importação direta no PJe-Calc.",
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

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-accent">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Passo a passo</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Como funciona na prática</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Upload ou parâmetros",
                desc: "Envie o PDF do cartão ou descreva a jornada no gerador por parâmetros.",
              },
              {
                step: "02",
                title: "IA processa",
                desc: "A extração usa IA (Gemini) para interpretar horários, dias e exceções.",
              },
              {
                step: "03",
                title: "Revise na tabela",
                desc: "Confira os dados, adicione observações e corrija o que for necessário.",
              },
              {
                step: "04",
                title: "Baixe ou salve",
                desc: "Aplique modificações, baixe o CSV ou salve a planilha para o PJe-Calc.",
              },
            ].map((s) => (
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

      {/* CREDITS */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start max-w-6xl mx-auto">
            <div>
              <span className="text-primary font-bold uppercase text-sm tracking-wider">Transparência</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 mb-5">
                Entenda o consumo de créditos antes de comprar pacotes
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Ao criar conta você recebe <strong className="text-foreground">20 créditos</strong> para testar o
                gerador por parâmetros e upload de PDF real — e ter noção real do custo por conversão.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    type: "success" as const,
                    text: (
                      <>
                        <strong>Exemplo na plataforma:</strong> o cartão de demonstração é gratuito e não consome
                        créditos.
                      </>
                    ),
                  },
                  {
                    type: "primary" as const,
                    text: (
                      <>
                        <strong>Gerador por parâmetros (teste real):</strong> jornada de 01/01/2026 a 28/02/2026
                        consumiu cerca de <strong>47% de 1 crédito</strong> (~0,47 crédito).
                      </>
                    ),
                  },
                  {
                    type: "muted" as const,
                    text: (
                      <>
                        <strong>Upload de PDF:</strong> o consumo varia conforme páginas e complexidade — teste com
                        um PDF real usando seus créditos iniciais.
                      </>
                    ),
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start text-foreground/90">
                    <CheckCircle2
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.type === "success" ? "text-success" : item.type === "primary" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-dark text-dark-foreground rounded-2xl p-8 border-2 border-primary/30 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-6">
                Sugestão de teste — Gerar por Parâmetros
              </p>
              <div className="space-y-4 text-sm font-mono">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Data inicial</p>
                  <p>{TESTE_PARAMETROS.dataInicial}</p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Data final</p>
                  <p>{TESTE_PARAMETROS.dataFinal}</p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Texto da jornada</p>
                  <p className="font-sans text-white/80 leading-relaxed">{TESTE_PARAMETROS.texto}</p>
                </div>
              </div>
              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
              >
                Abrir Ponto Mágico <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIAL */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Timer className="w-14 h-14 text-primary mx-auto mb-4" />
          <span className="text-primary font-bold uppercase text-sm tracking-wider">Diferencial</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-6">
            Integração real com o fluxo do calculista
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8">
            Uso recorrente (cartões mensais), edição em tempo real, histórico auditável e CSV pensado para o{" "}
            <strong>PJe-Calc</strong> — economizando horas de digitação em cada caso.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              "Único fluxo PDF → CSV → PJe-Calc com IA",
              "Dois modos: PDF ou descrição textual da jornada",
              "Público: calculistas, RH, advogados e DP",
            ].map((t) => (
              <div
                key={t}
                className="bg-card border border-border rounded-xl p-5 flex gap-3 items-start"
              >
                <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase text-sm tracking-wider">Dúvidas frequentes</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Preciso pagar para testar?",
                a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos. O exemplo de cartão na plataforma é gratuito e não consome créditos.",
              },
              {
                q: "Funciona sem PDF?",
                a: "Sim. O Gerador por Parâmetros permite descrever a jornada em texto (horários, sábados, domingos, exceções) e gerar o CSV para o período desejado.",
              },
              {
                q: "O arquivo serve para o PJe-Calc?",
                a: "Sim. O CSV é estruturado e otimizado para importação no PJe-Calc, após revisão e eventuais correções na plataforma.",
              },
              {
                q: "Quanto custa cada conversão?",
                a: "Depende do tipo e tamanho do processamento. Com os 20 créditos iniciais você pode testar o gerador por parâmetros e upload de PDF para estimar o consumo no seu caso.",
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
            Pare de perder horas com <span className="text-primary">digitação manual</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            Crie sua conta, use os 20 créditos de boas-vindas e converta seu primeiro cartão de ponto hoje.
          </p>

          <p className="text-4xl md:text-5xl font-black text-primary mb-8">20 créditos grátis</p>

          <CTAButton large>Começar grátis no SuitePlus</CTAButton>

          <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2 flex-wrap">
            <a href={APP_URL} target="_blank" rel="noreferrer" className="hover:text-primary transition underline">
              Já tem conta? Acessar Ponto Mágico
            </a>
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · SuitePlus Ponto Mágico. Todos os direitos reservados.
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
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}
