import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// Página de venda do Calc Machine Connect (conector MCP do Calc Machine para Claude, ChatGPT e Gemini).
// Conteúdo e estilo copiados da página do gateway (suite.ensinoplus.com.br/calc-machine-connect); o CSS fica isolado em .cmc.
// ATENÇÃO: os vídeos do Vimeo só tocam nos domínios liberados na privacidade de cada vídeo; libere o domínio desta LP lá.

export const Route = createFileRoute("/calc-machine-connect/")({
  head: () => ({
    meta: [
      { title: "Calc Machine Connect - cálculos trabalhistas pela sua IA" },
      {
        name: "description",
        content:
          "Monte cálculos trabalhistas no PJe-Calc direto do Claude, ChatGPT ou Gemini. Sentença entra, arquivo .pjc sai. Assinatura sem créditos por uso.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: CalcMachineConnect,
});

const ASSINATURAS_API = "https://assinaturas.ensinoplus.com.br/api/public/mcp/plans";

type Plano = {
  id: string | number;
  label: string;
  description?: string;
  name: string;
  link: string;
  prices: Record<string, number>;
  renovam_sozinhas?: string[];
  cartao_parcelas_max?: number;
};
type RespostaPlanos = { plans?: Plano[]; teste_gratis?: { disponivel: boolean; dias: number } };

const brl = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

function CalcMachineConnect() {
  useEffect(() => {
    const raiz = document.querySelector(".cmc");
    if (!raiz) return;
    const abas = Array.from(raiz.querySelectorAll<HTMLButtonElement>(".aba"));
    const ligarAba = (b: HTMLButtonElement) => () => {
      abas.forEach((x) => {
        const ativa = x === b;
        x.setAttribute("aria-selected", String(ativa));
        x.style.color = ativa ? "#fff" : "var(--ink)";
        x.style.borderColor = ativa ? "var(--signal)" : "var(--line)";
      });
      raiz.querySelectorAll<HTMLElement>(".painel").forEach((p) => {
        p.hidden = p.dataset.painel !== b.dataset.aba;
      });
    };
    const handlers = abas.map((b) => {
      const h = ligarAba(b);
      b.addEventListener("click", h);
      return [b, h] as const;
    });
    abas[0]?.style.setProperty("color", "#fff");

    const copiar = Array.from(raiz.querySelectorAll<HTMLButtonElement>("#conectores .conector .copiar"));
    const ligarCopiar = (b: HTMLButtonElement) => async () => {
      const original = b.textContent;
      try {
        await navigator.clipboard.writeText(b.parentElement?.querySelector("code")?.textContent ?? "");
        b.textContent = "Copiado";
      } catch {
        b.textContent = "Selecione e copie";
      }
      setTimeout(() => {
        b.textContent = original;
      }, 1500);
    };
    const handlersCopiar = copiar.map((b) => {
      const h = ligarCopiar(b);
      b.addEventListener("click", h);
      return [b, h] as const;
    });

    let cancelado = false;
    (async () => {
      const msg = raiz.querySelector<HTMLElement>("#planos-msg");
      if (!msg) return;
      try {
        const d: RespostaPlanos = await (await fetch(ASSINATURAS_API)).json();
        if (cancelado) return;
        if (!d.plans || !d.plans.length) throw new Error("sem planos");
        const lista = raiz.querySelector<HTMLElement>("#planos-lista");
        if (lista) {
          lista.innerHTML = d.plans
            .map((p) => {
              const menor = Math.min(...Object.values(p.prices));
              const rs = p.renovam_sozinhas || [];
              const renova = rs.length
                ? `Renova sozinho ${rs.includes("pix_recorrente") && rs.includes("card") ? "no Pix Automático ou cartão" : rs.includes("card") ? "no cartão" : "no Pix Automático"}.`
                : "Pagamento único, sem renovação automática.";
              // cartao parcelado (plano anual): destaca a parcela sem juros
              const max = Number(p.cartao_parcelas_max) || 1;
              const nx =
                max > 1 && p.prices.card
                  ? `<p style="margin:0 0 6px;font-weight:600">ou ${max}x de ${brl(p.prices.card / max)} sem juros no cartão</p>`
                  : "";
              return `<div class="plano" style="color:var(--ink)"><h3>${esc(p.label)}</h3><div class="preco">${brl(menor)}<small> a partir de</small></div>${nx}<p>${p.description ? esc(p.description) + " " : ""}${renova}</p><a class="btn" href="/calc-machine-connect/assinar?plano=${encodeURIComponent(String(p.id))}">Assinar ${esc(p.label.toLowerCase())}</a></div>`;
            })
            .join("");
        }
        msg.hidden = true;
        // Teste grátis removido: CTA continua "Assinar agora".
      } catch {
        msg.innerHTML =
          'Veja os planos e valores atuais na página de assinatura.<br><br><a class="btn" href="/calc-machine-connect/assinar">Ver planos e assinar</a>';
      }
    })();

    return () => {
      cancelado = true;
      handlers.forEach(([b, h]) => b.removeEventListener("click", h));
      handlersCopiar.forEach(([b, h]) => b.removeEventListener("click", h));
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cmc" dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}

const CSS = String.raw`.cmc { --ink:#0F1F1A; --paper:#F3EFE6; --signal:#E8552B; --muted:#5C6B64; --card:#fff; --line:#ddd6c6; --ok:#1b7a46; }
.cmc, .cmc * { box-sizing: border-box; margin: 0; padding: 0; }
.cmc { background: var(--paper); color: var(--ink); font: 17px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.cmc h1, .cmc h2, .cmc h3 { font-family: "Space Grotesk", system-ui, sans-serif; line-height: 1.15; letter-spacing: -0.01em; }
.cmc a { color: inherit; }
.cmc .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
.cmc section { padding: 64px 0; }
.cmc .eyebrow { color: var(--signal); font-weight: 700; font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 10px; }
.cmc h2 { font-size: clamp(1.7rem, 4vw, 2.4rem); margin-bottom: 14px; }
.cmc .lead { color: var(--muted); font-size: 1.1rem; max-width: 680px; }
.cmc header { background: var(--ink); color: var(--paper); }
.cmc .topo { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0; }
.cmc .topo img { height: 44px; width: auto; display: block; }
.cmc .topo nav { display: flex; gap: 22px; align-items: center; font-size: .95rem; }
.cmc .topo nav a { text-decoration: none; opacity: .85; }
.cmc .topo nav a:hover { opacity: 1; }
.cmc .hero { padding: 56px 0 72px; display: grid; grid-template-columns: 1.05fr .95fr; gap: 40px; align-items: center; }
.cmc .hero h1 { font-size: clamp(2.2rem, 5.4vw, 3.6rem); margin-bottom: 18px; }
.cmc .hero h1 em { font-style: normal; color: var(--signal); }
.cmc .hero p { font-size: 1.15rem; opacity: .88; max-width: 520px; }
.cmc .botoes { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.cmc .btn { display: inline-block; text-decoration: none; font-weight: 700; padding: 14px 24px; border-radius: 12px; border: 2px solid var(--signal); background: var(--signal); color: #fff; font-size: 1rem; }
.cmc .btn:hover { filter: brightness(1.08); }
.cmc .btn.sec { background: transparent; color: inherit; border-color: currentColor; opacity: .9; }
.cmc .nota { margin-top: 14px; font-size: .9rem; opacity: .7; }
.cmc .video { position: relative; padding-top: 56.25%; border-radius: 16px; overflow: hidden; background: #000; box-shadow: 0 24px 60px rgba(0,0,0,.28); }
.cmc .video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.cmc .faixa { background: #fff; border-block: 1px solid var(--line); padding: 22px 0; }
.cmc .faixa ul { list-style: none; display: flex; flex-wrap: wrap; gap: 14px 34px; justify-content: center; font-weight: 600; font-size: .98rem; }
.cmc .faixa li::before { content: "✓"; color: var(--signal); font-weight: 800; margin-right: 8px; }
.cmc .grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 18px; margin-top: 34px; }
.cmc .cartao { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 24px; }
.cmc .cartao h3 { font-size: 1.15rem; margin-bottom: 8px; }
.cmc .cartao p { color: var(--muted); font-size: .98rem; }
.cmc .num { display: inline-flex; width: 34px; height: 34px; border-radius: 50%; background: var(--ink); color: var(--paper); font-weight: 700; align-items: center; justify-content: center; margin-bottom: 14px; font-family: "Space Grotesk", sans-serif; }
.cmc .conector { display: flex; flex-direction: column; gap: 10px; }
.cmc .conector .sel { align-self: flex-start; font-size: .78rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: #e6f4ea; color: #1b6e3a; }
.cmc .conector .sel.breve { background: #f1ece0; color: #7a6a3a; }
.cmc .conector .end { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: auto; }
.cmc .conector code { flex: 1 1 200px; min-width: 0; overflow-wrap: anywhere; background: #fff; border: 1px solid var(--line); padding: 6px 9px; border-radius: 8px; font-size: .82rem; }
.cmc .conector .copiar { cursor: pointer; border: 1px solid var(--line); background: var(--card); border-radius: 8px; padding: 6px 12px; font-weight: 700; font-size: .85rem; }
.cmc .escuro { background: var(--ink); color: var(--paper); }
.cmc .escuro .lead, .cmc .escuro .cartao p { color: #b7c2bc; }
.cmc .escuro .cartao { background: #16302a; border-color: #2b4a42; }
.cmc .escuro .num { background: var(--signal); color: #fff; }
.cmc .abas { display: flex; gap: 8px; flex-wrap: wrap; margin: 28px 0 18px; }
.cmc .aba { border: 1px solid #2b4a42; background: transparent; color: var(--paper); border-radius: 999px; padding: 9px 20px; font: inherit; font-weight: 600; cursor: pointer; }
.cmc .aba[aria-selected="true"] { background: var(--signal); border-color: var(--signal); color: #fff; }
.cmc .painel[hidden] { display: none; }
.cmc .painel .passos { list-style: decimal; margin-top: 18px; color: #b7c2bc; padding-left: 20px; font-size: .98rem; }
.cmc .painel .passos li { margin-bottom: 4px; }
.cmc .videos-lado { display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; align-items: start; }
.cmc .planos { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-top: 34px; }
.cmc .plano { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 26px; display: flex; flex-direction: column; }
.cmc .plano h3 { font-size: 1.2rem; }
.cmc .plano .preco { font-family: "Space Grotesk", sans-serif; font-size: 2.2rem; font-weight: 700; margin: 12px 0 4px; }
.cmc .plano .preco small { font-size: .95rem; font-weight: 500; color: var(--muted); }
.cmc .plano p { color: var(--muted); font-size: .92rem; margin-bottom: 16px; flex: 1; }
.cmc .plano .btn { text-align: center; }
.cmc .carregando { color: var(--muted); margin-top: 28px; }
.cmc .teste { margin-top: 26px; background: #fff3ec; border: 1px solid #f4c3ae; border-radius: 16px; padding: 22px 24px; display: flex; flex-wrap: wrap; gap: 14px 24px; align-items: center; justify-content: space-between; }
.cmc .teste strong { font-family: "Space Grotesk", sans-serif; font-size: 1.15rem; }
.cmc .teste p { color: var(--muted); font-size: .95rem; margin-top: 4px; }
.cmc details.faq { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 20px; margin-top: 12px; }
.cmc details.faq summary { cursor: pointer; font-weight: 700; }
.cmc details.faq p { color: var(--muted); margin-top: 10px; font-size: .98rem; }
.cmc footer { background: var(--ink); color: #b7c2bc; padding: 36px 0; font-size: .9rem; text-align: center; }
.cmc footer img { height: 38px; margin-bottom: 14px; }
.cmc footer a { text-decoration: underline; }
@media (max-width: 820px) { .cmc .hero, .cmc .videos-lado { grid-template-columns: 1fr; }
.cmc .topo nav a.oculta { display: none; }
.cmc section { padding: 48px 0; }

   }

`;

const HTML = String.raw`

<header>
  <div class="wrap">
    <div class="topo">
      <img src="/calc-machine-connect/logo.svg" alt="Calc Machine Connect" style="border-radius:8px">
      <nav><a class="oculta" href="#recursos">Recursos</a><a class="oculta" href="#conectar">Conectar</a><a class="oculta" href="#conectores">Todos os conectores</a><a href="#planos">Planos</a><a class="oculta" href="https://suiteplus.ensinoplus.com.br/register">Criar conta</a><a class="btn" href="/calc-machine-connect/assinar" style="padding:9px 18px;opacity:1">Assinar</a></nav>
    </div>
    <div class="hero">
      <div>
        <h1>Seu cálculo trabalhista <em>pronto no PJe-Calc</em>, pela sua IA.</h1>
        <p>Entregue a sentença ao Claude, ChatGPT ou Gemini e receba o arquivo <strong>.pjc</strong> montado, liquidado e conferido. Sem digitar verba por verba.</p>
        <div class="botoes">
          <a class="btn" id="cta-principal" href="/calc-machine-connect/assinar">Assinar agora</a>
          <a class="btn sec" href="#planos">Ver planos</a>
        </div>
        <p class="nota">Assinatura simples, sem créditos por uso. Dá para assinar só com o e-mail. Para usar na sua IA, use a conta da Suite (grátis) com o <strong>mesmo e-mail</strong> da assinatura.</p>
      </div>
      <div>
        <div class="video"><iframe src="https://player.vimeo.com/video/1236227186?h=cdb3db2434&dnt=1" title="Como assinar o Calc Machine Connect" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div><p style="margin:8px 0 0;font-size:.88rem;opacity:.85">Prefere abrir em outra janela? <a href="https://vimeo.com/1236227186/cdb3db2434" target="_blank" rel="noopener" style="text-decoration:underline">Abrir o vídeo (como assinar) no Vimeo</a></p>
        <p class="nota" id="como-assinar" style="text-align:center">Vídeo: como assinar</p>
      </div>
    </div>
  </div>
</header>

<div class="faixa"><div class="wrap"><ul>
  <li>Funciona no Claude, ChatGPT e Gemini</li>
  <li>Arquivo .pjc pronto para abrir no PJe-Calc</li>
  <li>Seus arquivos ficam salvos na plataforma</li>
  <li>Sem pagar por crédito a cada uso</li>
</ul></div></div>

<section id="como-funciona-video">
  <div class="wrap" style="text-align:center">
    <div class="eyebrow">Veja funcionando</div>
    <h2>Como o sistema funciona</h2>
    <p class="lead" style="margin-inline:auto">Neste vídeo, o Prof. Vicelmo explica o funcionamento do Calc Machine Connect, do envio da sentença ao arquivo de cálculo pronto.</p>
    <div style="max-width:860px;margin:30px auto 0"><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/MSy2zWvv9V8" title="Como o Calc Machine Connect funciona" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div>
    <p class="nota" style="text-align:center"><a href="https://youtu.be/MSy2zWvv9V8" target="_blank" rel="noopener" style="text-decoration:underline">Abrir o vídeo no YouTube</a></p>
  </div>
</section>

<section id="recursos">
  <div class="wrap">
    <div class="eyebrow">O que você faz com ele</div>
    <h2>Do documento ao cálculo, sem retrabalho</h2>
    <p class="lead">O Calc Machine Connect liga a sua IA ao Calc Machine, o gerador de cálculos da Ensino Plus. A IA lê o processo; o Calc Machine monta o cálculo com as regras certas do PJe-Calc.</p>
    <div class="grade">
      <div class="cartao"><h3>Cálculo a partir da sentença</h3><p>Envie a sentença e a IA identifica verbas, períodos, bases, reflexos e parâmetros, e gera o .pjc pronto, com as partes e os advogados já preenchidos.</p></div>
      <div class="cartao"><h3>Petições iniciais e acordos</h3><p>Use também a petição inicial e acordos homologados como ponto de partida, inclusive acordo descumprido.</p></div>
      <div class="cartao"><h3>Atualização com deduções</h3><p>Atualize um cálculo existente lançando pagamentos e depósitos, com a dedução tratada como a sentença determina.</p></div>
      <div class="cartao"><h3>Revisão e conferência</h3><p>Ao final, a IA oferece conferir a planilha com parâmetros que você determina ou contra a sentença, apontando o que está errado, sobrando ou faltando.</p></div>
      <div class="cartao"><h3>Embargos à execução</h3><p>Refaça e revise cálculos para embargos e impugnações com a mesma base de regras.</p></div>
      <div class="cartao"><h3>Tudo salvo para você</h3><p>Cada arquivo gerado fica em "Meus Arquivos" na plataforma. Peça de novo, atualize depois, baixe quando precisar.</p></div>
    </div>
  </div>
</section>

<section class="escuro">
  <div class="wrap">
    <div class="eyebrow">Como funciona</div>
    <h2>Três passos</h2>
    <div class="grade">
      <div class="cartao"><div class="num">1</div><h3>Crie sua conta</h3><p>A conta da Suite é grátis e é com ela que você entra no conector. <strong>Use o mesmo e-mail</strong> da assinatura.</p><p style="margin-top:14px"><a class="btn" href="https://suiteplus.ensinoplus.com.br/register" style="padding:10px 18px;font-size:.95rem">Criar conta grátis</a></p></div>
      <div class="cartao"><div class="num">2</div><h3>Assine</h3><p>Assine direto com Pix, cartão ou boleto. Dá para assinar só informando o e-mail.</p><p style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="#planos" style="padding:10px 18px;font-size:.95rem">Ver planos</a></p></div>
      <div class="cartao"><div class="num">3</div><h3>Conecte a sua IA</h3><p>Cole o endereço do servidor no Claude, ChatGPT ou Gemini e entre com a sua conta da Suite. Os vídeos abaixo mostram cada passo.</p><p style="margin-top:14px"><a class="btn" href="#conectar" style="padding:10px 18px;font-size:.95rem">Ver vídeos</a></p><p style="margin-top:10px"><a href="https://suite.ensinoplus.com.br/calc-machine-connect/manual" target="_blank" rel="noopener">Manual com imagens (Claude)</a> · <a href="https://suite.ensinoplus.com.br/calc-machine-connect/manual-chatgpt" target="_blank" rel="noopener">Manual com imagens (ChatGPT)</a> · <a href="https://suite.ensinoplus.com.br/calc-machine-connect/faq" target="_blank" rel="noopener">Perguntas frequentes</a></p></div>
    </div>
  </div>
</section>

<section id="na-pratica">
  <div class="wrap">
    <div class="eyebrow">Na prática</div>
    <h2>Como é usar, do processo ao cálculo</h2>
    <p class="lead">Você conversa com a sua IA como já faz hoje. A diferença é que ela passa a ter as ferramentas do Calc Machine para montar o cálculo de verdade, em vez de só responder em texto.</p>
    <div class="grade">
      <div class="cartao"><div class="num">1</div><h3>Você envia os documentos</h3><p>Sentença ou acórdão e, se tiver, contracheques, cartões de ponto, extrato do FGTS e relatórios de férias e afastamentos. Pode enviar o processo inteiro em PDF.</p></div>
      <div class="cartao"><div class="num">2</div><h3>A IA organiza e confirma</h3><p>Ela localiza as peças que importam, mostra um resumo do que encontrou e faz poucas perguntas, uma de cada vez, apenas quando a decisão deixa dúvida. Nada é gerado sem a sua confirmação.</p></div>
      <div class="cartao"><div class="num">3</div><h3>O arquivo é gerado</h3><p>O Calc Machine monta o cálculo e entrega o arquivo <strong>.pjc</strong> em poucos segundos, já salvo em “Meus Arquivos” na plataforma.</p></div>
      <div class="cartao"><div class="num">4</div><h3>Você escolhe o próximo passo</h3><p>Receber só o .pjc, enviá-lo para o seu PJe-Calc aberto, ou pedir que o Calc Machine liquide e entregue o relatório em PDF ou HTML, com as telas que você quiser.</p></div>
      <div class="cartao"><div class="num">5</div><h3>Conferência opcional</h3><p>Ao final, a IA oferece conferir a planilha com parâmetros que você determina ou contra a sentença, apontando o que está errado, sobrando ou faltando.</p></div>
      <div class="cartao"><div class="num">6</div><h3>Atualização depois</h3><p>Mais tarde, peça a atualização do cálculo informando pagamentos e depósitos. O arquivo anterior continua guardado.</p></div>
    </div>
    <div class="grade" style="margin-top:26px">
      <div class="cartao"><h3>O que você precisa</h3><p>Uma assinatura, uma conta na Suite com o mesmo e-mail e uma IA conectada (Claude, ChatGPT ou Gemini). Para ver o cálculo no PJe-Calc, o programa instalado no seu computador.</p></div>
      <div class="cartao"><h3>O que você recebe</h3><p>O arquivo .pjc do cálculo, o PDF ou HTML da liquidação (quando pedir), arquivos de importação de histórico salarial, cartão de ponto, FGTS e férias, e a conferência da planilha.</p></div>
      <div class="cartao"><h3>Acesso ilimitado</h3><p>Sem crédito por uso: gere quantos .pjc precisar, atualize cálculos, faça conferências e embargos — tudo incluso na assinatura.</p></div>
      <div class="cartao"><h3>O que continua com você</h3><p>A IA não decide no seu lugar: quando a sentença é ambígua ou falta documento, ela pergunta em vez de supor. A revisão final do cálculo é sua, como sempre.</p></div>
    </div>
  </div>
</section>

<section id="conectar">
  <div class="wrap">
    <div class="eyebrow">Conectar</div>
    <h2>Veja como conectar na sua ferramenta</h2>
    <p class="lead">Escolha a IA que você usa. Cada vídeo mostra o caminho completo.</p>
    <div style="margin-top:22px;background:#fff3ec;border:2px solid var(--signal);border-radius:12px;padding:16px 20px"><strong style="color:var(--signal)">⚠ Importante ao cadastrar:</strong> Ao cadastrar o conector, <strong>conceda as permissões</strong> das ferramentas do Calc Machine (escolha “Sempre permitir”, ou equivalente, quando a sua IA perguntar). Sem isso, ela pede a sua autorização a cada ferramenta usada, a toda hora. <strong>No Claude:</strong> Configurações → Conectores → Calc Machine Connect → permissões das ferramentas; deixe os dois grupos, “Ferramentas somente leitura” e “Ferramentas de gravação/exclusão”, em “Sempre permitir” (se o menu do grupo mostrar “Personalizado”, é porque há ferramentas com permissões diferentes).</div>
    <div class="abas" role="tablist" style="margin-top:24px">
      <button class="aba" role="tab" aria-selected="true" data-aba="claude" style="color:var(--ink);border-color:var(--line)">Claude</button>
      <button class="aba" role="tab" aria-selected="false" data-aba="gpt" style="color:var(--ink);border-color:var(--line)">ChatGPT</button>
      <button class="aba" role="tab" aria-selected="false" data-aba="gemini" style="color:var(--ink);border-color:var(--line)">Gemini</button>
    </div>
    <div class="painel" data-painel="claude"><div class="videos-lado">
      <div class="video"><iframe src="https://player.vimeo.com/video/1236224305?h=f5024f5e15&dnt=1" title="Como conectar no Claude" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div><p style="margin:8px 0 0;font-size:.88rem;opacity:.85">Prefere abrir em outra janela? <a href="https://vimeo.com/1236224305/f5024f5e15" target="_blank" rel="noopener" style="text-decoration:underline">Abrir o vídeo (Claude) no Vimeo</a></p>
      <ol class="passos" style="color:var(--muted)"><li>Abra <strong>Configurações → Conectores</strong>.</li><li>Escolha <strong>Adicionar conector personalizado</strong>.</li><li>Cole o endereço do servidor e entre com a sua conta da Suite.</li></ol>
    </div></div>
    <div class="painel" data-painel="gpt" hidden><div class="videos-lado">
      <div class="video"><iframe src="https://player.vimeo.com/video/1236224304?h=8e50a4c008&dnt=1" title="Como conectar no ChatGPT" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div><p style="margin:8px 0 0;font-size:.88rem;opacity:.85">Prefere abrir em outra janela? <a href="https://vimeo.com/1236224304/8e50a4c008" target="_blank" rel="noopener" style="text-decoration:underline">Abrir o vídeo (ChatGPT) no Vimeo</a></p>
      <ol class="passos" style="color:var(--muted)"><li>Abra <strong>Configurações → Plugins → Explorar catálogo</strong>.</li><li>Clique em <strong>Adicionar → Adicionar servidor MCP personalizado</strong>.</li><li>Preencha o formulário com a URL do servidor.</li></ol>
    </div></div>
    <div class="painel" data-painel="gemini" hidden><div class="videos-lado">
      <div class="video"><iframe src="https://player.vimeo.com/video/1236224300?h=491ad0377f&dnt=1" title="Como conectar no Gemini" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div><p style="margin:8px 0 0;font-size:.88rem;opacity:.85">Prefere abrir em outra janela? <a href="https://vimeo.com/1236224300/491ad0377f" target="_blank" rel="noopener" style="text-decoration:underline">Abrir o vídeo (Gemini) no Vimeo</a></p>
      <ol class="passos" style="color:var(--muted)"><li>Abra <strong>Configurações → Habilidades → Conectores → Personalizado</strong>.</li><li>Cole o endereço do servidor.</li><li>O Google exige conta pessoal e o idioma da conta em <strong>English (United States)</strong> para liberar conectores personalizados.</li></ol>
    </div></div>
    <p style="margin-top:26px"><strong>Endereço do servidor:</strong> <code style="background:#fff;border:1px solid var(--line);padding:3px 8px;border-radius:6px">https://suite.ensinoplus.com.br/mcp-usuario</code></p>
    <p class="nota" style="color:var(--muted)">Depois de assinar, a página <a href="https://suite.ensinoplus.com.br/conectar-ia">Conecte sua IA</a> traz também as skills para baixar e as credenciais do Gemini.</p>
  </div>
</section>

<section id="planos" class="escuro">
  <div class="wrap">
    <div class="eyebrow">Planos</div>
    <h2>Escolha como assinar</h2>
    <p class="lead">Pix ou cartão. Nos planos com renovação automática, você não precisa lembrar de pagar de novo.</p>
    <div id="planos-lista" class="planos"></div>
    <p id="planos-msg" class="carregando">Carregando planos…</p>
  </div>
</section>

<section id="conectores">
  <div class="wrap">
    <div class="eyebrow">Conectores</div>
    <h2>Todos os conectores da Ensino Plus</h2>
    <p class="lead">Cada conector é um endereço que você cola no Claude, ChatGPT ou Gemini (Configurações → Conectores → Adicionar conector personalizado). Entre com a sua conta da Suite quando a IA pedir.</p>
    <div class="grade">
      <div class="cartao conector"><span class="sel">Disponível</span><h3>Calc Machine Connect</h3><p>Monte cálculos trabalhistas no PJe-Calc pela sua IA: a sentença entra e o arquivo .pjc sai. Inclui contracheques, cartão de ponto, FGTS e ausências. Requer assinatura.</p>
        <div class="end"><code>https://suite.ensinoplus.com.br/mcp-usuario</code><button class="copiar" type="button">Copiar</button></div></div>
      <div class="cartao conector"><span class="sel">Disponível</span><h3>DataJud e Comunica PJe (CNJ)</h3><p>Consulte processos públicos de 91 tribunais e as publicações oficiais do Diário de Justiça Eletrônico Nacional, por número do processo ou pela OAB, com linha do tempo. Gratuito.</p>
        <div class="end"><code>https://suite.ensinoplus.com.br/mcp-datajud</code><button class="copiar" type="button">Copiar</button></div></div>
      <div class="cartao conector"><span class="sel">Disponível</span><h3>CCT — Clube do Cálculo Trabalhista</h3><p>Cursos do Prof. Vicelmo: consulte aulas, favoritas e certificados pela sua IA. O conteúdo depende do seu plano no CCT. Somente leitura.</p>
        <div class="end"><code>https://suite.ensinoplus.com.br/mcp-cct</code><button class="copiar" type="button">Copiar</button></div></div>
      <div class="cartao conector"><span class="sel">Disponível</span><h3>Financeiro Ensino Plus</h3><p>Consulte lançamentos, relatórios, categorias e transferências do financeiro da sua instituição pela sua IA.</p>
        <div class="end"><code>https://financeiro.ensinoplus.com.br/mcp</code><button class="copiar" type="button">Copiar</button></div></div>
      <div class="cartao conector"><span class="sel">Disponível</span><h3>Ferramentas Ensino Plus</h3><p>Catálogo gratuito, sem login: a IA conhece todos os conectores e explica como instalar cada um, com listas em cartões.</p>
        <div class="end"><code>https://suite.ensinoplus.com.br/mcp-ensinoplus</code><button class="copiar" type="button">Copiar</button></div></div>
      <div class="cartao conector"><span class="sel breve">Em breve</span><h3>Dossiê Jud</h3><p>Consulta de dados cadastrais de pessoas e empresas pela sua IA. O conector está pronto e aguarda a abertura da venda.</p></div>
    </div>
    <p class="nota" style="color:var(--muted)">Para o passo a passo e as skills que ensinam a IA a usar cada conector, veja a página <a href="https://suite.ensinoplus.com.br/conectar-ia">Conecte sua IA</a>.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="eyebrow">Dúvidas</div>
    <h2>Perguntas frequentes</h2>
    <details class="faq"><summary>Como peço suporte?</summary><p>Com o conector ligado, peça à sua IA para abrir um chamado: a equipe é avisada e responde pelo e-mail ou WhatsApp da sua conta. Se ainda não conseguiu conectar, ou o conector estiver fora do ar, fale conosco pelo <a href="https://wa.me/5585996641461" target="_blank" rel="noopener">WhatsApp de suporte</a>.</p></details>
    <details class="faq"><summary>Preciso ter o PJe-Calc aberto para gerar o arquivo?</summary><p>Não. O arquivo .pjc é gerado pelo Calc Machine. Você abre o arquivo no PJe-Calc para ver, ajustar ou liquidar. Se preferir, o Calc Machine também pode liquidar e entregar o relatório por você.</p></details>
    <details class="faq"><summary>A IA calcula sozinha, sem eu ver?</summary><p>Não. Ela mostra o que encontrou nos documentos, pergunta o que for incerto e pede a sua confirmação antes de gerar. O resultado é um arquivo de cálculo que você confere e pode alterar no PJe-Calc.</p></details>
    <details class="faq"><summary>Quanto tempo leva?</summary><p>A geração do arquivo leva poucos segundos. O tempo total depende da leitura do processo pela sua IA e das perguntas que ela fizer.</p></details>
    <details class="faq"><summary>Preciso ter conta na Suite?</summary><p>Para assinar, não: basta o e-mail. Para usar o conector na sua IA, você entra com uma conta da Suite. Se ainda não tem, <a href="https://suiteplus.ensinoplus.com.br/register">crie uma gratuitamente</a> com o mesmo e-mail da assinatura.</p></details>
    <details class="faq"><summary>Tem cobrança por crédito a cada cálculo?</summary><p>Não. Com a assinatura ativa, o uso do conector não consome créditos.</p></details>
    <details class="faq"><summary>Quais IAs funcionam?</summary><p>Claude, ChatGPT e Gemini. Qualquer outra ferramenta que aceite conectores MCP personalizados também pode usar o mesmo endereço.</p></details>
    <details class="faq"><summary>Meus dados ficam protegidos?</summary><p>O texto que você envia passa pelo seu assistente de IA, sem o anonimizador da Suite. Os arquivos gerados ficam na sua conta, e a chave de acesso é pessoal e pode ser revogada a qualquer momento.</p></details>
    <details class="faq"><summary>Posso cancelar?</summary><p>Sim. Nos planos com renovação automática, você pode desligar a renovação quando quiser e continua com acesso até o fim do período pago.</p></details>
    <details class="faq"><summary>O arquivo gerado abre em qual programa?</summary><p>O arquivo .pjc abre no PJe-Calc. O Calc Machine ainda pode importar e liquidar o cálculo por você e entregar o PDF da liquidação.</p></details>
  </div>
</section>

<footer>
  <div class="wrap">
    <img src="/calc-machine-connect/logo.svg" alt="Calc Machine Connect" style="border-radius:8px">
    <p>Um produto <strong>Ensino Plus</strong>. © 2026 Ensino Plus. Todos os direitos reservados.</p>
    <p style="margin-top:8px"><a href="/calc-machine-connect/assinar">Assinar</a> · <a href="https://suite.ensinoplus.com.br/conectar-ia">Conectar minha IA</a> · <a href="https://suite.ensinoplus.com.br/calc-machine-connect/manual" target="_blank" rel="noopener">Manual (Claude)</a> · <a href="https://suite.ensinoplus.com.br/calc-machine-connect/manual-chatgpt" target="_blank" rel="noopener">Manual (ChatGPT)</a> · <a href="#conectores">Todos os conectores</a> · <a href="https://suiteplus.ensinoplus.com.br/register">Criar conta</a> · <a href="https://wa.me/5585996641461" target="_blank" rel="noopener">Suporte</a></p>
  </div>
</footer>

`;
