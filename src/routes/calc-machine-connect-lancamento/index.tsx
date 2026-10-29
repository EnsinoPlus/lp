import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { trackMetaCustomEvent } from "@/lib/meta-pixel";
import {
  BadgeCheck,
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

// Página de LANÇAMENTO do Calc Machine Connect — identidade Ensino Plus (vermelho/branco), fundos claros.
// Conteúdo baseado na página informativa /calc-machine-connect (que fica intacta) + camada de oferta.
// Checkout interno (criado pelo time): /calc-machine-connect/assinar — puxa os planos da API,
// aceita ?plano=<id>. Todos os botões apontam pra ele (a pessoa escolhe plano + Pix/cartão lá).
// Os vídeos do Vimeo só tocam em domínios liberados na privacidade de cada vídeo — libere o domínio desta LP lá.
const CHECKOUT_URL = "/calc-machine-connect/assinar";
const SERVIDOR_MCP = "https://suite.ensinoplus.com.br/mcp-usuario";

export const Route = createFileRoute("/calc-machine-connect-lancamento/")({
  head: () => ({
    meta: [
      { title: "Calc Machine Connect — Lançamento | Ensino Plus" },
      {
        name: "description",
        content:
          "Seus cálculos trabalhistas no PJe-Calc direto do Claude, ChatGPT ou Gemini. A sentença entra, o .pjc sai. Oferta de lançamento com vagas limitadas. Monte seus cálculos trabalhistas sem limite ou moderação de IA.",
      },
      { property: "og:title", content: "Calc Machine Connect — Lançamento" },
      {
        property: "og:description",
        content: "A sentença entra, o .pjc sai. Oferta de lançamento, vagas limitadas. Monte seus cálculos trabalhistas sem limite ou moderação de IA.",
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
  { n: "2", title: "Garanta sua vaga", desc: "Assine na 1ª onda com Pix, cartão (até 10×) ou boleto. Dá para assinar só com o e-mail." },
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
  { title: "O que você precisa", desc: "Uma assinatura, uma conta na Suite com o mesmo e-mail e uma IA conectada (Claude, ChatGPT ou Gemini). Para ver no PJe-Calc, o programa instalado no seu computador." },
  { title: "O que você recebe", desc: "O arquivo .pjc do cálculo, o PDF ou HTML da liquidação (quando pedir), arquivos de importação de histórico salarial, cartão de ponto, FGTS e férias, e a conferência da planilha." },
  { title: "Acesso ilimitado", desc: "Sem crédito por uso: gere quantos .pjc precisar, atualize cálculos, faça conferências e embargos — tudo incluso na assinatura." },
  { title: "O que continua com você", desc: "A IA não decide no seu lugar: quando a sentença é ambígua ou falta documento, ela pergunta em vez de supor. A revisão final é sua, como sempre." },
];

const CONECTORES = [
  { aba: "claude", nome: "Claude", video: "https://player.vimeo.com/video/1236224305?h=f5024f5e15&dnt=1", passos: ["Abra Configurações → Conectores.", "Escolha Adicionar conector personalizado.", "Cole o endereço do servidor e entre com a sua conta da Suite."] },
  { aba: "gpt", nome: "ChatGPT", video: "https://player.vimeo.com/video/1236224304?h=8e50a4c008&dnt=1", passos: ["Abra Configurações → Plugins → Explorar catálogo.", "Clique em Adicionar → Adicionar servidor MCP personalizado.", "Preencha o formulário com a URL do servidor."] },
  { aba: "gemini", nome: "Gemini", video: "https://player.vimeo.com/video/1236224300?h=491ad0377f&dnt=1", passos: ["Abra Configurações → Habilidades → Conectores → Personalizado.", "Cole o endereço do servidor.", "O Google exige conta pessoal e idioma em English (United States) para liberar conectores personalizados."] },
];

const PAGAMENTOS = ["Pix", "Cartão (até 10× no lançamento)", "Boleto"];

const FAQ = [
  { q: "Como funciona a oferta de lançamento?", a: "Na 1ª onda, o acesso ilimitado (R$ 1.997) sai por metade: R$ 997 à vista ou 10× R$ 99,70, e com 2 meses grátis de bônus. As vagas são limitadas — quando a onda fecha, o preço volta a R$ 1.997 (ou 12× R$ 197)." },
  { q: "O que está incluso no acesso?", a: "Uso ilimitado do Calc Machine pela sua IA, sem crédito por cálculo: gere quantos .pjc precisar, com cartão de ponto, FGTS, ausências, liquidação e conferência." },
  { q: "Quais formas de pagamento?", a: "Pix, cartão de crédito (até 10× no lançamento) e boleto." },
  { q: "Quais IAs funcionam?", a: "Claude, ChatGPT e Gemini (e qualquer ferramenta que aceite conectores MCP personalizados usando o mesmo endereço)." },
  { q: "Como funciona a garantia?", a: "Você tem 7 dias de garantia. Se não for pra você, é só pedir o reembolso dentro do prazo." },
  { q: "Preciso ter o PJe-Calc aberto para gerar o arquivo?", a: "Não. O .pjc é gerado pelo Calc Machine. Você abre no PJe-Calc para ver, ajustar ou liquidar — ou pede a liquidação direto por ele." },
  { q: "A IA calcula sozinha, sem eu ver?", a: "Não. Ela mostra o que encontrou, pergunta o que for incerto e pede a sua confirmação antes de gerar. A revisão final é sua." },
  { q: "Preciso de conta na Suite?", a: "Para assinar, não: basta o e-mail. Para usar o conector na IA, você entra com uma conta da Suite (grátis) com o mesmo e-mail da assinatura." },
  { q: "Posso cancelar?", a: "Sim. Você desliga a renovação quando quiser e segue com acesso até o fim do período pago." },
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

  // Evento Meta ao iniciar o checkout (clique em "Garantir na 1ª onda").
  const initiateCheckout = () => {
    trackMetaCustomEvent("InitiateCheckoutLancamento");
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout", { value: 997, currency: "BRL" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Botão flutuante de WhatsApp (tirar dúvidas) */}
      <WhatsAppFloat href="https://wa.me/5585996641461" label="Tirar dúvidas" event="CMC_Whatsapp" />

      {/* Barra de lançamento */}
      <div className="bg-[#E8552B] text-white py-2.5 px-4 text-center text-sm font-bold">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-wider">Lançamento · Vagas limitadas por lote</span>
        </div>
      </div>

      {/* HERO claro */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[#FDF3EF] to-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <img
                src="/calc-machine-connect/logo.svg"
                alt="Calc Machine Connect"
                className="h-11 w-auto mx-auto lg:mx-0 mb-7 rounded-lg"
              />
              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-4">
                Monte seus cálculos trabalhistas{" "}
                <span className="text-[#E8552B]">sem limite ou moderação de IA</span>
              </h1>
              <p className="text-xl md:text-2xl font-black text-foreground mb-3">
                A sentença entra, o <span className="text-[#E8552B]">.pjc</span> sai — pela sua IA.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                No PJe-Calc, direto do Claude, ChatGPT ou Gemini — sem digitar verba por verba e sem
                pagar crédito por uso.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="#planos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8552B] text-white font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta h-12 px-7"
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
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#E8552B]" /> Garantia de 7 dias</span>
                <span className="inline-flex items-center gap-2"><Gift className="w-5 h-5 text-[#E8552B]" /> + 2 meses grátis</span>
                <span className="inline-flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#E8552B]" /> Pix, cartão ou boleto</span>
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
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B]" /> Claude, ChatGPT e Gemini</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B]" /> Arquivo .pjc pronto para o PJe-Calc</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B]" /> Sem crédito por uso</li>
            <li className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B]" /> Arquivos salvos na plataforma</li>
          </ul>
        </div>
      </section>

      {/* Recursos */}
      <section id="como-funciona" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm font-bold uppercase tracking-wider text-[#E8552B] mb-2">O que você faz com ele</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Do documento ao cálculo, sem retrabalho</h2>
            <p className="text-muted-foreground text-lg">
              O Calc Machine Connect liga a sua IA ao Calc Machine, o gerador de cálculos da Ensino Plus.
              A IA lê o processo; o Calc Machine monta o cálculo com as regras certas do PJe-Calc.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-card transition">
                <div className="w-12 h-12 rounded-xl bg-[#E8552B] flex items-center justify-center text-white mb-4">
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
            <p className="text-sm font-bold uppercase tracking-wider text-[#E8552B] mb-2">Como funciona</p>
            <h2 className="text-3xl md:text-5xl font-black">Três passos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-card border border-border rounded-2xl p-7">
                <div className="w-10 h-10 rounded-full bg-[#E8552B] text-white font-black flex items-center justify-center mb-4">{s.n}</div>
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
            <p className="text-sm font-bold uppercase tracking-wider text-[#E8552B] mb-2">Na prática</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Como é usar, do processo ao cálculo</h2>
            <p className="text-muted-foreground text-lg">
              Você conversa com a sua IA como já faz hoje. A diferença é que ela passa a ter as
              ferramentas do Calc Machine para montar o cálculo de verdade, em vez de só responder em texto.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PRATICA.map((p) => (
              <div key={p.n} className="bg-card border border-border rounded-2xl p-6">
                <div className="w-9 h-9 rounded-full bg-[#E8552B] text-white font-black text-sm flex items-center justify-center mb-3">{p.n}</div>
                <h3 className="font-black text-base mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-6">
            {INFO.map((i) => (
              <div key={i.title} className="bg-secondary border border-border rounded-2xl p-6">
                <h3 className="font-black text-sm uppercase tracking-wide text-[#E8552B] mb-2">{i.title}</h3>
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
            <p className="text-sm font-bold uppercase tracking-wider text-[#E8552B] mb-2">Conectar</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Veja como conectar na sua ferramenta</h2>
            <p className="text-muted-foreground text-lg">Escolha a IA que você usa. Cada vídeo mostra o caminho completo.</p>
          </div>

          <div className="rounded-xl border-2 border-[#E8552B]/35 bg-[#FDF3EF] text-[#0F1F1A] p-4 md:p-5 mb-8 text-sm">
            <strong className="text-[#E8552B]">⚠ Importante ao cadastrar:</strong> conceda as permissões das
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
                    ? "bg-[#E8552B] text-white border-[#E8552B]"
                    : "bg-card text-foreground border-border hover:border-[#E8552B]/35"
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
            <p className="text-sm font-bold uppercase tracking-wider text-[#E8552B] mb-2">Oferta de lançamento · 1ª onda</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3">50% OFF na primeira onda</h2>
            <p className="text-muted-foreground text-lg">
              O acesso ilimitado custa <span className="font-bold text-foreground">R$ 1.997</span>. Na 1ª onda de
              lançamento você garante por <span className="font-bold text-foreground">metade</span> — e ainda leva{" "}
              <span className="font-bold text-foreground">2 meses grátis</span>. Quando a onda fechar, o preço volta
              para R$ 1.997.
            </p>
          </div>

          {/* Card da oferta de lançamento */}
          <div className="max-w-xl mx-auto mt-10">
            <div className="relative bg-card border-2 border-[#E8552B] rounded-2xl p-8 text-center shadow-cta">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8552B] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Zap className="w-3 h-3" /> 1ª onda · 50% OFF
              </span>
              <p className="text-muted-foreground">
                <span className="line-through">De R$ 1.997</span> · por metade no lançamento
              </p>
              <p className="text-6xl md:text-7xl font-black mt-1">R$ 997</p>
              <p className="text-lg font-bold text-[#E8552B] mt-1">ou 10× R$ 99,70 no cartão</p>
              <div className="inline-flex items-center gap-2 bg-[#F7E0D6] text-[#E8552B] rounded-full px-4 py-1.5 text-sm font-bold mt-4">
                <Gift className="w-4 h-4" /> + 2 meses grátis (bônus de lançamento)
              </div>
              <ul className="text-sm text-muted-foreground mt-5 space-y-2 text-left max-w-sm mx-auto">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B] shrink-0" /> Acesso <strong className="text-foreground">ilimitado</strong>, sem crédito por uso</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B] shrink-0" /> Pix, cartão (até 10×) ou boleto</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E8552B] shrink-0" /> Garantia de 7 dias</li>
              </ul>
              <a
                href={CHECKOUT_URL}
                onClick={initiateCheckout}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8552B] text-white font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all py-4 px-6 text-lg"
              >
                <Zap className="w-5 h-5" /> Garantir na 1ª onda
              </a>
              <p className="text-xs text-muted-foreground mt-3">
                Vagas limitadas. Quando a 1ª onda fechar, o preço sobe.
              </p>
            </div>
          </div>

          {/* Depois da 1ª onda */}
          <p className="text-center text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
            Depois que a 1ª onda fechar, o acesso passa a{" "}
            <strong className="text-foreground">R$ 1.997 à vista</strong> ou{" "}
            <strong className="text-foreground">12× R$ 197</strong>. Por isso: corra enquanto está pela metade.
          </p>

          {/* Formas de pagamento */}
          <div className="max-w-xl mx-auto mt-8 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-[#E8552B]" />
              <h3 className="font-black text-lg">Formas de pagamento</h3>
            </div>
            <ul className="flex flex-wrap gap-2 justify-center">
              {PAGAMENTOS.map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded-full px-3 py-1 text-sm font-semibold">
                  <Repeat className="w-3.5 h-3.5 text-[#E8552B]" /> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Garantia */}
          <div className="max-w-xl mx-auto mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 justify-center text-center">
              <ShieldCheck className="w-10 h-10 text-[#E8552B] shrink-0" />
              <div>
                <p className="font-black">Garantia de 7 dias</p>
                <p className="text-sm text-muted-foreground">Não gostou? Devolvemos seu dinheiro em até 7 dias.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan (bloco verde da logo) */}
      <section className="py-16 bg-[#0F1F1A] text-[#F3EFE6] text-center">
        <div className="container mx-auto px-4">
          <p className="text-3xl md:text-5xl font-black">
            Monte seus cálculos trabalhistas <span className="text-[#E8552B]">sem limite ou moderação de IA</span>.
          </p>
          <p className="opacity-80 mt-3 max-w-xl mx-auto">Assinatura sem crédito por uso: gere quantos cálculos precisar.</p>
          <a href="#planos" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8552B] text-white font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all h-12 px-8">
            <Zap className="w-5 h-5" /> Garantir vaga de lançamento
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-wider text-[#E8552B] mb-2">Dúvidas</p>
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

      <footer className="bg-[#0F1F1A] py-10 text-center text-sm text-[#F3EFE6]/70">
        <div className="container mx-auto px-4">
          <img src="/calc-machine-connect/logo.svg" alt="Calc Machine Connect" className="h-9 w-auto mx-auto mb-3 rounded" />
          <p>Um produto <strong className="text-white">Ensino Plus</strong> · © 2026 Ensino Plus. Todos os direitos reservados.</p>
          <p className="mt-2">
            <a href={CHECKOUT_URL} className="underline hover:text-white">Assinar</a> ·{" "}
            <a href="#planos" className="underline hover:text-white">Planos</a> ·{" "}
            <a href="https://wa.me/5585996641461" target="_blank" rel="noreferrer" className="underline hover:text-white">Suporte</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
