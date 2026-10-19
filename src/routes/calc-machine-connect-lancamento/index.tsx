import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  CreditCard,
  FileCheck,
  Gift,
  Infinity as InfinityIcon,
  Lock,
  Repeat,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

// Página de LANÇAMENTO do Calc Machine Connect — identidade Ensino Plus (vermelho/branco), fundos claros.
// Conteúdo baseado na página informativa /calc-machine-connect (que fica intacta) + camada de oferta.
// Sem integração de pagamento aqui: todos os botões de plano vão para CHECKOUT_URL (troque pelo seu checkout).
// Os vídeos do Vimeo só tocam em domínios liberados na privacidade de cada vídeo — libere o domínio desta LP lá.
const CHECKOUT_URL = "https://assinaturas.ensinoplus.com.br/assinar";
const SERVIDOR_MCP = "https://suite.ensinoplus.com.br/mcp-usuario";

export const Route = createFileRoute("/calc-machine-connect-lancamento/")({
  head: () => ({
    meta: [
      { title: "Calc Machine Connect — Lançamento | Ensino Plus" },
      {
        name: "description",
        content:
          "Seus cálculos trabalhistas no PJe-Calc direto do Claude, ChatGPT ou Gemini. A sentença entra, o .pjc sai. Oferta de lançamento com vagas limitadas. Use sem moderação.",
      },
      { property: "og:title", content: "Calc Machine Connect — Lançamento" },
      {
        property: "og:description",
        content: "A sentença entra, o .pjc sai. Oferta de lançamento, vagas limitadas. Use sem moderação.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://player.vimeo.com" },
    ],
  }),
  component: Lancamento,
});

const FEATURES = [
  { icon: FileCheck, title: "Cálculo a partir da sentença", desc: "A IA identifica verbas, períodos, bases, reflexos e parâmetros e gera o .pjc pronto, com partes e advogados já preenchidos." },
  { icon: FileCheck, title: "Petições iniciais e acordos", desc: "Use a petição inicial e acordos homologados como ponto de partida, inclusive acordo descumprido." },
  { icon: Repeat, title: "Atualização com deduções", desc: "Atualize um cálculo existente lançando pagamentos e depósitos, com a dedução tratada como a sentença determina." },
  { icon: BadgeCheck, title: "Revisão e conferência", desc: "No fim, a IA confere a planilha contra a sentença ou seus parâmetros, apontando o que está errado, sobrando ou faltando." },
  { icon: FileCheck, title: "Embargos à execução", desc: "Refaça e revise cálculos para embargos e impugnações com a mesma base de regras." },
  { icon: InfinityIcon, title: "Tudo salvo para você", desc: "Cada arquivo gerado fica em 'Meus Arquivos' na plataforma. Peça de novo, atualize depois, baixe quando precisar." },
];

const STEPS = [
  { n: "1", title: "Crie sua conta", desc: "A conta da Suite é grátis e é com ela que você entra no conector. Use o mesmo e-mail da assinatura." },
  { n: "2", title: "Teste ou assine", desc: "Experimente por 2 dias ou assine direto com Pix ou cartão. Dá para assinar só com o e-mail." },
  { n: "3", title: "Conecte a sua IA", desc: "Cole o endereço do servidor no Claude, ChatGPT ou Gemini e entre com a sua conta da Suite." },
];

const PRATICA = [
  { n: "1", title: "Você envia os documentos", desc: "Sentença ou acórdão e, se tiver, contracheques, cartões de ponto, extrato do FGTS e relatórios de férias. Pode enviar o processo inteiro em PDF." },
  { n: "2", title: "A IA organiza e confirma", desc: "Ela localiza as peças que importam, mostra um resumo e faz poucas perguntas, uma de cada vez. Nada é gerado sem a sua confirmação." },
  { n: "3", title: "O arquivo é gerado", desc: "O Calc Machine monta o cálculo e entrega o .pjc em poucos segundos, já salvo em 'Meus Arquivos'." },
  { n: "4", title: "Você escolhe o próximo passo", desc: "Receber só o .pjc, enviar ao seu PJe-Calc aberto, ou pedir a liquidação com relatório em PDF ou HTML." },
  { n: "5", title: "Conferência opcional", desc: "A IA confere a planilha com os seus parâmetros ou contra a sentença, apontando o que está errado, sobrando ou faltando." },
  { n: "6", title: "Atualização depois", desc: "Mais tarde, peça a atualização informando pagamentos e depósitos. O arquivo anterior continua guardado." },
];

const INFO = [
  { title: "O que você precisa", desc: "Uma assinatura (ou o teste grátis), uma conta na Suite com o mesmo e-mail e uma IA conectada (Claude, ChatGPT ou Gemini). Para ver no PJe-Calc, o programa instalado no seu computador." },
  { title: "O que você recebe", desc: "O arquivo .pjc do cálculo, o PDF ou HTML da liquidação (quando pedir), arquivos de importação de histórico salarial, cartão de ponto, FGTS e férias, e a conferência da planilha." },
  { title: "O que o teste grátis inclui", desc: "Dois dias corridos, com até 5 gerações de .pjc, 1 uso do PJe-Calc pelo Calc Machine e 10 anexos processados. Guias e validações são livres." },
  { title: "O que continua com você", desc: "A IA não decide no seu lugar: quando a sentença é ambígua ou falta documento, ela pergunta em vez de supor. A revisão final é sua, como sempre." },
];

const CONECTORES = [
  { aba: "claude", nome: "Claude", video: "https://player.vimeo.com/video/1236224305?h=f5024f5e15&dnt=1", passos: ["Abra Configurações → Conectores.", "Escolha Adicionar conector personalizado.", "Cole o endereço do servidor e entre com a sua conta da Suite."] },
  { aba: "gpt", nome: "ChatGPT", video: "https://player.vimeo.com/video/1236224304?h=8e50a4c008&dnt=1", passos: ["Abra Configurações → Plugins → Explorar catálogo.", "Clique em Adicionar → Adicionar servidor MCP personalizado.", "Preencha o formulário com a URL do servidor."] },
  { aba: "gemini", nome: "Gemini", video: "https://player.vimeo.com/video/1236224300?h=491ad0377f&dnt=1", passos: ["Abra Configurações → Habilidades → Conectores → Personalizado.", "Cole o endereço do servidor.", "O Google exige conta pessoal e idioma em English (United States) para liberar conectores personalizados."] },
];

const LAUNCH_TIERS = [
  { preco: "97", lote: "1º lote", status: "aberto", desc: "As primeiras 20 pessoas entram por este valor. Trava assim que as 20 vagas forem preenchidas." },
  { preco: "197", lote: "2º lote", status: "bloqueado", desc: "Bloqueado. Abre automaticamente quando o 1º lote (R$ 97) esgotar as 20 vagas." },
  { preco: "297", lote: "3º lote", status: "bloqueado", desc: "Bloqueado. Abre quando o 2º lote (R$ 197) esgotar." },
];

const PAGAMENTOS = ["Pix à vista", "Pix automático (recorrente)", "Cartão de crédito"];

const FAQ = [
  { q: "Como funcionam os lotes de lançamento?", a: "Só o lote atual fica aberto. Quando ele preenche as 20 vagas, trava e o próximo lote abre pelo valor seguinte. Depois dos 3 lotes, a assinatura volta para R$ 397/mês." },
  { q: "Tem cobrança por crédito a cada cálculo?", a: "Não. Com a assinatura ativa, o uso do conector não consome créditos — use sem moderação." },
  { q: "Quais IAs funcionam?", a: "Claude, ChatGPT e Gemini (e qualquer ferramenta que aceite conectores MCP personalizados usando o mesmo endereço)." },
  { q: "Como funciona a garantia?", a: "Você tem 7 dias de garantia. Se não for pra você, é só pedir o reembolso dentro do prazo." },
  { q: "E o teste grátis?", a: "Dá pra experimentar por 2 dias antes de assinar, com até 5 gerações de .pjc, 1 uso do PJe-Calc e 10 anexos." },
  { q: "Preciso ter o PJe-Calc aberto para gerar o arquivo?", a: "Não. O .pjc é gerado pelo Calc Machine. Você abre no PJe-Calc para ver, ajustar ou liquidar — ou pede a liquidação direto por ele." },
  { q: "A IA calcula sozinha, sem eu ver?", a: "Não. Ela mostra o que encontrou, pergunta o que for incerto e pede a sua confirmação antes de gerar. A revisão final é sua." },
  { q: "Preciso de conta na Suite?", a: "Para assinar, não: basta o e-mail. Para usar o conector na IA, você entra com uma conta da Suite (grátis) com o mesmo e-mail da assinatura." },
  { q: "Posso cancelar?", a: "Sim. Nos planos com renovação automática, você desliga a renovação quando quiser e segue com acesso até o fim do período pago." },
];

function VideoBox({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl ring-1 ring-black/5">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

function Lancamento() {
  const [tab, setTab] = useState<"claude" | "gpt" | "gemini">("claude");
  const ativo = CONECTORES.find((c) => c.aba === tab) ?? CONECTORES[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Botão flutuante de WhatsApp (tirar dúvidas) */}
      <WhatsAppFloat href="https://wa.me/5585996641461" label="Tirar dúvidas" />

      {/* Barra de lançamento */}
      <div className="bg-red-600 text-white py-2.5 px-4 text-center text-sm font-bold">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-wider">Lançamento · Vagas limitadas por lote</span>
        </div>
      </div>

      {/* HERO claro */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-red-50 to-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <img
                src="/calc-machine-connect/logo.svg"
                alt="Calc Machine Connect"
                className="h-11 w-auto mx-auto lg:mx-0 mb-6 rounded-lg"
              />
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 border border-red-200 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4">
                <Zap className="w-4 h-4" /> Calc Machine Connect
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-5">
                A sentença entra, o <span className="text-red-600">.pjc</span> sai — pela sua IA
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                Monte cálculos trabalhistas no PJe-Calc direto do Claude, ChatGPT ou Gemini. Sem
                digitar verba por verba, sem pagar crédito por uso.
              </p>
              <p className="text-xl md:text-2xl font-black text-red-600 mb-8">“Use sem moderação.”</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="#planos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta h-12 px-7"
                >
                  <Zap className="w-5 h-5" /> Garantir vaga de lançamento
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border text-foreground font-bold h-12 px-6 hover:bg-secondary transition"
                >
                  Como funciona
                </a>
              </div>
              <div className="flex flex-wrap gap-5 mt-7 text-sm text-muted-foreground justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-red-600" /> Garantia de 7 dias</span>
                <span className="inline-flex items-center gap-2"><CalendarClock className="w-5 h-5 text-red-600" /> Teste grátis de 2 dias</span>
                <span className="inline-flex items-center gap-2"><CreditCard className="w-5 h-5 text-red-600" /> Pix ou cartão</span>
              </div>
            </div>

            <div>
              <VideoBox src="https://player.vimeo.com/video/1236227186?h=cdb3db2434&dnt=1" title="Como assinar o Calc Machine Connect" />
              <p className="text-center text-sm text-muted-foreground mt-3">
                Vídeo: como assinar.{" "}
                <a href="https://vimeo.com/1236227186/cdb3db2434" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                  Abrir no Vimeo
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de confiança */}
      <section className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold">
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-600" /> Claude, ChatGPT e Gemini</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-600" /> Arquivo .pjc pronto para o PJe-Calc</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-600" /> Sem crédito por uso</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-red-600" /> Arquivos salvos na plataforma</li>
          </ul>
        </div>
      </section>

      {/* Recursos */}
      <section id="como-funciona" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">O que você faz com ele</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Do documento ao cálculo, sem retrabalho</h2>
            <p className="text-muted-foreground text-lg">
              O Calc Machine Connect liga a sua IA ao Calc Machine, o gerador de cálculos da Ensino Plus.
              A IA lê o processo; o Calc Machine monta o cálculo com as regras certas do PJe-Calc.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-card transition">
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

      {/* Como funciona em 3 passos */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">Como funciona</p>
            <h2 className="text-3xl md:text-5xl font-black">Três passos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-card border border-border rounded-2xl p-7">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black flex items-center justify-center mb-4">{s.n}</div>
                <h3 className="font-black text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Na prática */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">Na prática</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Como é usar, do processo ao cálculo</h2>
            <p className="text-muted-foreground text-lg">
              Você conversa com a sua IA como já faz hoje. A diferença é que ela passa a ter as
              ferramentas do Calc Machine para montar o cálculo de verdade, em vez de só responder em texto.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PRATICA.map((p) => (
              <div key={p.n} className="bg-card border border-border rounded-2xl p-6">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center mb-3">{p.n}</div>
                <h3 className="font-black text-base mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-6">
            {INFO.map((i) => (
              <div key={i.title} className="bg-secondary border border-border rounded-2xl p-6">
                <h3 className="font-black text-sm uppercase tracking-wide text-red-600 mb-2">{i.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conectar na sua IA */}
      <section id="conectar" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">Conectar</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Veja como conectar na sua ferramenta</h2>
            <p className="text-muted-foreground text-lg">Escolha a IA que você usa. Cada vídeo mostra o caminho completo.</p>
          </div>

          <div className="rounded-xl border-2 border-red-300 bg-red-50 text-red-900 p-4 md:p-5 mb-8 text-sm">
            <strong className="text-red-700">⚠ Importante ao cadastrar:</strong> conceda as permissões das
            ferramentas do Calc Machine (escolha “Sempre permitir”, ou equivalente, quando a sua IA perguntar).
            Sem isso, ela pede autorização a cada ferramenta usada. No Claude: Configurações → Conectores →
            Calc Machine Connect → permissões; deixe os dois grupos em “Sempre permitir”.
          </div>

          <div className="flex gap-2 flex-wrap justify-center mb-6">
            {CONECTORES.map((c) => (
              <button
                key={c.aba}
                type="button"
                onClick={() => setTab(c.aba as typeof tab)}
                className={`rounded-full px-5 py-2 font-bold text-sm border-2 transition ${
                  tab === c.aba
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-card text-foreground border-border hover:border-red-300"
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-start">
            <VideoBox src={ativo.video} title={`Como conectar no ${ativo.nome}`} />
            <ol className="space-y-3 text-muted-foreground text-sm list-decimal pl-5">
              {ativo.passos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>

          <p className="mt-8 text-sm">
            <strong>Endereço do servidor:</strong>{" "}
            <code className="bg-card border border-border rounded px-2 py-0.5">{SERVIDOR_MCP}</code>
          </p>
        </div>
      </section>

      {/* PLANOS / OFERTA */}
      <section id="planos" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">Oferta de lançamento</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Entre agora pelo menor preço</h2>
            <p className="text-muted-foreground text-lg">
              <span className="font-bold text-foreground">Só o lote atual fica aberto.</span> Ao preencher as
              20 vagas, ele trava e o próximo abre pelo valor seguinte. Depois dos 3 lotes, a assinatura volta
              para <span className="font-bold text-foreground">R$ 397/mês</span>.
            </p>
          </div>

          {/* Lotes com bloqueio */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
            {LAUNCH_TIERS.map((t) => {
              const locked = t.status === "bloqueado";
              return (
                <div
                  key={t.preco}
                  className={`relative rounded-2xl p-7 flex flex-col ${
                    locked ? "bg-secondary border-2 border-dashed border-border opacity-80" : "bg-card border-2 border-red-500 shadow-cta"
                  }`}
                >
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                      locked ? "bg-muted text-muted-foreground" : "bg-red-600 text-white"
                    }`}
                  >
                    {locked ? (<><Lock className="w-3 h-3" /> Bloqueado</>) : (<><Zap className="w-3 h-3" /> Aberto agora</>)}
                  </span>
                  <p className={`text-sm font-bold uppercase tracking-wider ${locked ? "text-muted-foreground" : "text-red-600"}`}>{t.lote}</p>
                  <p className={`text-5xl font-black mt-2 ${locked ? "text-muted-foreground" : ""}`}>
                    R$ {t.preco}
                    <span className="text-lg font-bold text-muted-foreground">/mês</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 flex-1">{t.desc}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider mt-4 mb-4 inline-flex items-center gap-1 ${locked ? "text-muted-foreground" : "text-red-600"}`}>
                    {locked ? (<><Lock className="w-3.5 h-3.5" /> Aguardando o lote anterior esgotar</>) : "Apenas 20 vagas · trava ao esgotar"}
                  </p>
                  {locked ? (
                    <span className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-muted text-muted-foreground font-bold uppercase tracking-wide h-12 px-6 cursor-not-allowed select-none">
                      <Lock className="w-4 h-4" /> Bloqueado
                    </span>
                  ) : (
                    <a
                      href={CHECKOUT_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all h-12 px-6"
                    >
                      <Zap className="w-5 h-5" /> Assinar por R$ {t.preco}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-5 max-w-2xl mx-auto">
            Os valores de R$ 197 e R$ 297 estão <strong className="text-foreground">bloqueados</strong> — só
            abrem quando o lote anterior fechar as 20 vagas. O de <strong className="text-foreground">R$ 97
            trava</strong> assim que as 20 primeiras vagas forem preenchidas.
          </p>

          {/* Mensal + Anual */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
            <div className="bg-card border border-border rounded-2xl p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mensal (valor cheio)</p>
              <p className="text-4xl font-black mt-2">R$ 397<span className="text-lg font-bold text-muted-foreground">/mês</span></p>
              <p className="text-sm text-muted-foreground mt-3">O valor normal da assinatura mensal, após o lançamento.</p>
              <a href={CHECKOUT_URL} target="_blank" rel="noreferrer" className="mt-5 w-full inline-flex items-center justify-center rounded-xl border-2 border-red-500 text-red-600 font-bold uppercase tracking-wide hover:bg-red-50 transition-all h-12 px-6">
                Assinar mensal
              </a>
            </div>
            <div className="bg-card border border-border rounded-2xl p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Anual</p>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-1 mt-2">
                <p className="text-4xl font-black">R$ 970</p>
                <p className="text-lg font-bold text-muted-foreground">· R$ 1.970 · R$ 2.970</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Planos anuais para travar o preço o ano todo. Escolha o nível no checkout.</p>
              <a href={CHECKOUT_URL} target="_blank" rel="noreferrer" className="mt-5 w-full inline-flex items-center justify-center rounded-xl border-2 border-red-500 text-red-600 font-bold uppercase tracking-wide hover:bg-red-50 transition-all h-12 px-6">
                Ver planos anuais
              </a>
            </div>
          </div>

          {/* Créditos + pagamentos */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center text-primary-foreground shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Créditos avulsos (plano mensal)</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Precisou de mais? <span className="font-bold text-foreground">R$ 100 = 300 créditos</span>, para quem está no plano mensal.
                </p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
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
            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-red-600 shrink-0" />
              <div>
                <p className="font-black">Garantia de 7 dias</p>
                <p className="text-sm text-muted-foreground">Não gostou? Devolvemos seu dinheiro.</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
              <BadgeCheck className="w-10 h-10 text-red-600 shrink-0" />
              <div>
                <p className="font-black">Teste grátis de 2 dias</p>
                <p className="text-sm text-muted-foreground">Experimente antes de assinar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan (único bloco vermelho) */}
      <section className="py-16 bg-gradient-cta text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <p className="text-3xl md:text-5xl font-black">Use sem moderação.</p>
          <p className="opacity-90 mt-3 max-w-xl mx-auto">Assinatura sem crédito por uso: gere quantos cálculos precisar.</p>
          <a href="#planos" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-red-700 font-bold uppercase tracking-wide shadow-cta hover:brightness-95 transition-all h-12 px-8">
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
              <details key={item.q} className="bg-card border border-border rounded-xl p-5">
                <summary className="font-bold cursor-pointer">{item.q}</summary>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-secondary border-t border-border py-10 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <img src="/calc-machine-connect/logo.svg" alt="Calc Machine Connect" className="h-9 w-auto mx-auto mb-3 rounded" />
          <p>Um produto <strong className="text-foreground">Ensino Plus</strong> · © 2026 Ensino Plus. Todos os direitos reservados.</p>
          <p className="mt-2">
            <a href={CHECKOUT_URL} className="underline hover:text-foreground">Assinar</a> ·{" "}
            <a href="#planos" className="underline hover:text-foreground">Planos</a> ·{" "}
            <a href="https://wa.me/5585996641461" target="_blank" rel="noreferrer" className="underline hover:text-foreground">Suporte</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
