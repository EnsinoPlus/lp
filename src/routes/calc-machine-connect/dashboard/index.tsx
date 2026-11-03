import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  fetchCmcContatos,
  fetchCmcDashboard,
  fetchCmcFunil,
  type CmcContato,
  type CmcDashboard,
  type CmcEtapa,
  type CmcFunil,
} from "@/lib/cmc-events";
import { listCmcAvaliacoes, setCmcAvaliacaoStatus, type AvaliacaoRow } from "@/lib/cmc-avaliacao-db";
import { CmcAvaliacoesLista } from "@/components/CmcAvaliacoesLista";

// Dashboard interno do Calc Machine Connect: visitas, cliques, leads do checkout,
// vendas, avaliações e eventos. Login = mesmo e-mail/senha do painel de avaliações.

export const Route = createFileRoute("/calc-machine-connect/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Calc Machine Connect" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
});

const CRED_KEY = "cmc_avaliacoes_cred";

const C = {
  ink: "#0F1F1A",
  paper: "#F3EFE6",
  signal: "#E8552B",
  muted: "#5C6B64",
  line: "#d9d3c4",
  ok: "#1b7a46",
  erro: "#c0361a",
};

type Periodo = "hoje" | "7d" | "30d" | "tudo";
type Aba = "geral" | "contatos" | "leads" | "avaliacoes" | "eventos";

const NOME_EVENTO: Record<string, string> = {
  PageView: "Visita na página",
  CMC_Assinar: "Clique em Assinar",
  CMC_VerPlanos: "Clique em Ver planos",
  CMC_TesteGratis: "Clique em Testar grátis",
  CMC_Whatsapp: "Clique no WhatsApp",
  CMC_CriarConta: "Clique em Criar conta",
  CMC_VerVideo: "Abriu vídeo",
  CMC_ConectarIA: "Clique em Conecte sua IA",
  CMC_Manual: "Abriu manual",
  CMC_FAQ: "Abriu FAQ",
  CMC_FAQ_Pergunta: "Abriu pergunta do FAQ",
  CMC_Navegar: "Navegou no menu",
  CMC_CopiarConector: "Copiou endereço de conector",
  CMC_AbaIA: "Trocou aba de IA",
  CMC_Link: "Clique em outro link",
  CMC_Botao: "Clique em outro botão",
  InitiateCheckout: "Gerou cobrança no checkout",
  Purchase: "Compra confirmada",
  AvaliacaoEnviada: "Enviou avaliação",
  CobrancaGerada: "Gerou cobrança",
  PagamentoConfirmado: "Pagamento confirmado",
  CobrancaExpirada: "Cobrança expirada",
  AvaliacaoRecebida: "Enviou avaliação",
};

const ETAPA: Record<CmcEtapa, { txt: string; cor: string }> = {
  pagou: { txt: "Pagou", cor: C.ok },
  gerou_cobranca: { txt: "Gerou cobrança, não pagou", cor: C.signal },
  clicou: { txt: "Clicou, não gerou cobrança", cor: "#b7791f" },
  visitou: { txt: "Só visitou", cor: C.muted },
  sem_rastreio: { txt: "Sem visitas rastreadas", cor: C.muted },
};
const ORDEM_ETAPA: CmcEtapa[] = ["pagou", "gerou_cobranca", "clicou", "visitou", "sem_rastreio"];

const STATUS_LEAD: Record<string, { txt: string; cor: string }> = {
  iniciado: { txt: "Iniciado", cor: C.muted },
  pago: { txt: "Pago", cor: C.ok },
  expirado: { txt: "Expirado", cor: C.erro },
};

const brl = (v: number | null | undefined) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number | null | undefined) => Number(v || 0).toLocaleString("pt-BR");
const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1).replace(".", ",")}%` : "—");
const fmtData = (s: string) => {
  try {
    return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
};
const fmtDia = (s: string) => {
  const [, m, d] = s.split("-");
  return `${d}/${m}`;
};

function desdeDe(p: Periodo): Date | null {
  const agora = new Date();
  if (p === "hoje") return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  if (p === "7d") return new Date(agora.getTime() - 7 * 86400000);
  if (p === "30d") return new Date(agora.getTime() - 30 * 86400000);
  return null;
}

const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 };
const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", fontSize: ".8rem", color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "8px 10px", borderBottom: `1px solid ${C.line}`, fontSize: ".9rem", verticalAlign: "top" };
const btn: React.CSSProperties = { padding: "8px 14px", border: `1px solid ${C.line}`, borderRadius: 10, background: "#fff", cursor: "pointer", font: "inherit" };

function Tabela({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
    </div>
  );
}

function Kpi({ titulo, valor, sub }: { titulo: string; valor: string; sub?: string }) {
  return (
    <div style={card}>
      <div style={{ color: C.muted, fontSize: ".85rem", fontWeight: 600 }}>{titulo}</div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800, marginTop: 4 }}>{valor}</div>
      {sub && <div style={{ color: C.muted, fontSize: ".8rem", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function baixarCsv(rows: CmcDashboard["checkouts"]) {
  const cab = ["data", "nome", "email", "plano", "forma", "parcelas", "valor", "status", "origem", "campanha"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((r) =>
    [fmtData(r.created_at), r.nome, r.email, r.plano_label, r.forma, r.parcelas, String(r.valor ?? "").replace(".", ","), r.status, r.utm_source, r.utm_campaign]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["﻿" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-calc-machine-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function baixarCsvContatos(rows: CmcContato[]) {
  const cab = ["nome", "email", "cpf_cnpj", "etapa", "origem", "campanha", "plano", "forma", "cobrancas", "valor_pago", "acoes", "avaliou", "primeiro_contato", "ultima_atividade"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((c) =>
    [c.nome, c.email, c.documento, ETAPA[c.etapa].txt, c.origem, c.campanha, c.plano, c.forma, c.cobrancas,
      String(c.valor_pago ?? "").replace(".", ","), c.acoes, c.avaliou ? "sim" : "não", fmtData(c.primeiro_contato), fmtData(c.ultima_atividade)]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["\ufeff" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `contatos-calc-machine-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Dashboard() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("30d");
  const [aba, setAba] = useState<Aba>("geral");
  const [dados, setDados] = useState<CmcDashboard | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRow[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "iniciado" | "pago" | "expirado">("todos");
  const [busca, setBusca] = useState("");
  const [contatos, setContatos] = useState<CmcContato[]>([]);
  const [funilV, setFunilV] = useState<CmcFunil | null>(null);
  const [filtroEtapa, setFiltroEtapa] = useState<CmcEtapa | "todas">("todas");
  const [buscaContato, setBuscaContato] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const carregar = async (em: string, se: string, p: Periodo) => {
    setCarregando(true);
    setErro("");
    const desde = desdeDe(p);
    const [r, av, ct, fu] = await Promise.all([
      fetchCmcDashboard(em, se, desde),
      listCmcAvaliacoes(em, se),
      fetchCmcContatos(em, se, desde),
      fetchCmcFunil(em, se, desde),
    ]);
    setCarregando(false);
    if (!r.ok) {
      setErro(r.status === 401 || r.status === 403 || r.status === 400 ? "E-mail ou senha inválidos." : `Erro ${r.status}.`);
      setLogado(false);
      try {
        localStorage.removeItem(CRED_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    setDados(r.data);
    if (av.ok) setAvaliacoes(av.rows);
    if (ct.ok) setContatos(ct.data);
    if (fu.ok) setFunilV(fu.data);
    setLogado(true);
    try {
      localStorage.setItem(CRED_KEY, JSON.stringify({ email: em, senha: se }));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CRED_KEY);
      if (raw) {
        const c = JSON.parse(raw) as { email?: string; senha?: string };
        if (c.email && c.senha) {
          setEmail(c.email);
          setSenha(c.senha);
          void carregar(c.email, c.senha, periodo);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trocarPeriodo = (p: Periodo) => {
    setPeriodo(p);
    if (logado) void carregar(email, senha, p);
  };

  const marcar = async (id: string, status: AvaliacaoRow["status"]) => {
    const ok = await setCmcAvaliacaoStatus(email, senha, id, status);
    if (ok) setAvaliacoes((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    else setErro("Não consegui atualizar a avaliação. Recarregue e tente de novo.");
  };

  const sair = () => {
    try {
      localStorage.removeItem(CRED_KEY);
    } catch {
      /* ignore */
    }
    setLogado(false);
    setSenha("");
    setDados(null);
    setAvaliacoes([]);
    setContatos([]);
    setFunilV(null);
  };

  const leadsFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return (dados?.checkouts || []).filter(
      (r) =>
        (filtroStatus === "todos" || r.status === filtroStatus) &&
        (!q || `${r.nome || ""} ${r.email || ""} ${r.utm_source || ""}`.toLowerCase().includes(q)),
    );
  }, [dados, filtroStatus, busca]);

  const contatosFiltrados = useMemo(() => {
    const q = buscaContato.trim().toLowerCase();
    return contatos.filter(
      (c) =>
        (filtroEtapa === "todas" || c.etapa === filtroEtapa) &&
        (!q || `${c.nome || ""} ${c.email} ${c.origem || ""} ${c.documento || ""}`.toLowerCase().includes(q)),
    );
  }, [contatos, filtroEtapa, buscaContato]);

  if (!logado) {
    return (
      <div style={{ minHeight: "100vh", background: C.paper, color: C.ink, font: "16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "48px 16px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px" }}>Dashboard — Calc Machine Connect</h1>
          <p style={{ color: C.muted, margin: "0 0 20px" }}>Visitas, cliques, leads, vendas e avaliações.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim() && senha) void carregar(email.trim(), senha, periodo);
            }}
            style={card}
          >
            <label htmlFor="em" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>E-mail</label>
            <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
              style={{ width: "100%", padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: C.paper, color: C.ink, font: "inherit" }} />
            <label htmlFor="se" style={{ display: "block", fontWeight: 600, margin: "14px 0 8px" }}>Senha</label>
            <input id="se" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password"
              style={{ width: "100%", padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: C.paper, color: C.ink, font: "inherit" }} />
            {erro && <p style={{ color: C.erro, marginTop: 10 }}>{erro}</p>}
            <button type="submit" disabled={carregando}
              style={{ width: "100%", marginTop: 16, padding: 14, border: 0, borderRadius: 10, background: C.signal, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: carregando ? 0.6 : 1, font: "inherit" }}>
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const r = dados?.resumo;
  const pendentes = avaliacoes.filter((a) => a.status === "recebida").length;
  const maxDia = Math.max(1, ...(dados?.por_dia || []).map((d) => d.visitantes));
  const funil = funilV
    ? [
        { nome: "Visitaram a página", v: funilV.visitantes },
        { nome: "Viram os planos", v: funilV.viram_planos },
        { nome: "Clicaram em Assinar", v: funilV.clicaram_assinar },
        { nome: "Chegaram no checkout", v: funilV.chegaram_checkout },
        { nome: "Geraram cobrança", v: funilV.geraram_cobranca },
        { nome: "Pagaram", v: funilV.pagaram },
      ]
    : [];

  const abas: { id: Aba; txt: string }[] = [
    { id: "geral", txt: "Visão geral" },
    { id: "contatos", txt: `Contatos (${contatos.length})` },
    { id: "leads", txt: `Leads do checkout (${dados?.checkouts.length ?? 0})` },
    { id: "avaliacoes", txt: `Avaliações${pendentes ? ` (${pendentes} pendente${pendentes > 1 ? "s" : ""})` : ""}` },
    { id: "eventos", txt: "Eventos" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.paper, color: C.ink, font: "16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px 64px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, marginRight: "auto" }}>Dashboard — Calc Machine Connect</h1>
          <select value={periodo} onChange={(e) => trocarPeriodo(e.target.value as Periodo)} style={btn} aria-label="Período">
            <option value="hoje">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="tudo">Desde o início</option>
          </select>
          <button onClick={() => void carregar(email, senha, periodo)} style={btn} disabled={carregando}>
            {carregando ? "Atualizando…" : "Atualizar"}
          </button>
          <button onClick={sair} style={btn}>Sair</button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }} role="tablist">
          {abas.map((a) => (
            <button key={a.id} role="tab" aria-selected={aba === a.id} onClick={() => setAba(a.id)}
              style={{ ...btn, borderRadius: 999, background: aba === a.id ? C.ink : "#fff", color: aba === a.id ? "#fff" : C.ink, fontWeight: 600 }}>
              {a.txt}
            </button>
          ))}
        </div>

        {erro && <p style={{ color: C.erro }}>{erro}</p>}

        {aba === "geral" && r && dados && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
              <Kpi titulo="Visitantes únicos" valor={num(r.visitantes)} sub={`${num(r.pageviews)} visitas`} />
              <Kpi titulo="Cliques em Assinar" valor={num(r.cliques_assinar)} sub={`${pct(r.cliques_assinar, r.visitantes)} dos visitantes`} />
              <Kpi titulo="Cobranças geradas" valor={num(r.checkouts)} sub="leads no checkout" />
              <Kpi titulo="Vendas pagas" valor={num(r.pagos)} sub={`${pct(r.pagos, r.checkouts)} das cobranças`} />
              <Kpi titulo="Faturamento" valor={brl(r.valor_pago)} sub="vendas confirmadas" />
              <Kpi titulo="Testar grátis" valor={num(r.cliques_teste)} sub="cliques" />
              <Kpi titulo="WhatsApp" valor={num(r.cliques_whatsapp)} sub="cliques" />
              <Kpi titulo="Avaliações" valor={num(r.avaliacoes)} sub={r.nota_media ? `nota média ${String(r.nota_media).replace(".", ",")}` : "sem nota ainda"} />
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Funil</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {funil.map((f, i) => {
                  const base = Math.max(1, ...funil.map((x) => x.v));
                  return (
                    <div key={f.nome}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem" }}>
                        <span>{f.nome}</span>
                        <span>
                          <strong>{num(f.v)}</strong>
                          {i > 0 && f.v <= funil[i - 1].v && (
                            <span style={{ color: C.muted }}> · {pct(f.v, funil[i - 1].v)} da etapa anterior</span>
                          )}
                        </span>
                      </div>
                      <div style={{ height: 10, background: C.paper, borderRadius: 999, marginTop: 4 }}>
                        <div style={{ height: 10, borderRadius: 999, background: C.signal, width: `${Math.min(100, (f.v / base) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: C.muted, fontSize: ".8rem", margin: "12px 0 0" }}>
                Cada etapa conta pessoas, não cliques. Visitas e cliques começam a contar a partir do deploy do rastreamento;
                cobranças e vendas vêm do checkout desde 26/10, então no começo podem aparecer maiores que as etapas de cima.
              </p>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Por dia</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Dia</th>
                    <th style={{ ...th, width: "50%" }}>Visitantes</th>
                    <th style={th}>Cobranças</th>
                    <th style={th}>Pagas</th>
                  </tr>
                </thead>
                <tbody>
                  {[...dados.por_dia].reverse().map((d) => (
                    <tr key={d.dia}>
                      <td style={td}>{fmtDia(d.dia)}</td>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ height: 8, borderRadius: 999, background: C.signal, width: `${(d.visitantes / maxDia) * 100}%`, minWidth: d.visitantes ? 4 : 0 }} />
                          <span>{num(d.visitantes)}</span>
                        </div>
                      </td>
                      <td style={td}>{num(d.checkouts)}</td>
                      <td style={{ ...td, color: d.pagos ? C.ok : undefined, fontWeight: d.pagos ? 700 : 400 }}>{num(d.pagos)}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Por origem (utm_source)</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Origem</th>
                    <th style={th}>Visitantes</th>
                    <th style={th}>Cliques Assinar</th>
                    <th style={th}>Cobranças</th>
                    <th style={th}>Pagas</th>
                    <th style={th}>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.origens.length === 0 && (
                    <tr><td style={td} colSpan={6}>Sem dados no período.</td></tr>
                  )}
                  {dados.origens.map((o) => (
                    <tr key={o.origem}>
                      <td style={{ ...td, fontWeight: 600 }}>{o.origem}</td>
                      <td style={td}>{num(o.visitantes)}</td>
                      <td style={td}>{num(o.cliques_assinar)}</td>
                      <td style={td}>{num(o.checkouts)}</td>
                      <td style={td}>{num(o.pagos)}</td>
                      <td style={td}>{brl(o.valor_pago)}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Por página</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Página</th>
                    <th style={th}>Visitas</th>
                    <th style={th}>Visitantes</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.paginas.length === 0 && (
                    <tr><td style={td} colSpan={3}>Sem visitas registradas no período.</td></tr>
                  )}
                  {dados.paginas.map((p) => (
                    <tr key={p.page}>
                      <td style={td}>{p.page}</td>
                      <td style={td}>{num(p.pageviews)}</td>
                      <td style={td}>{num(p.visitantes)}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>
          </div>
        )}

        {aba === "contatos" && (
          <div style={card}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {(["todas", ...ORDEM_ETAPA] as const).map((e) => {
                const n = e === "todas" ? contatos.length : contatos.filter((c) => c.etapa === e).length;
                if (e !== "todas" && n === 0) return null;
                const ativo = filtroEtapa === e;
                return (
                  <button key={e} onClick={() => setFiltroEtapa(e)}
                    style={{ ...btn, borderRadius: 999, fontSize: ".85rem", background: ativo ? C.ink : "#fff", color: ativo ? "#fff" : C.ink }}>
                    {e === "todas" ? "Todos" : ETAPA[e].txt} ({n})
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <input value={buscaContato} onChange={(e) => setBuscaContato(e.target.value)} placeholder="Buscar nome, e-mail, CPF ou origem"
                style={{ ...btn, flex: "1 1 240px", cursor: "text" }} />
              <span style={{ color: C.muted, fontSize: ".9rem" }}>{contatosFiltrados.length} contatos</span>
              <button onClick={() => baixarCsvContatos(contatosFiltrados)} style={btn} disabled={!contatosFiltrados.length}>Baixar CSV</button>
            </div>

            {contatosFiltrados.length === 0 && <p style={{ color: C.muted }}>Nenhum contato no filtro.</p>}
            <div style={{ display: "grid", gap: 10 }}>
              {contatosFiltrados.map((c) => {
                const abre = aberto === c.chave;
                return (
                  <div key={c.chave} style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                    <button onClick={() => setAberto(abre ? null : c.chave)} aria-expanded={abre}
                      style={{ width: "100%", textAlign: "left", background: abre ? C.paper : "#fff", border: 0, padding: "12px 14px", cursor: "pointer", font: "inherit", color: C.ink }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                        <strong style={{ marginRight: "auto" }}>{c.nome || "Sem nome"}</strong>
                        <span style={{ color: ETAPA[c.etapa].cor, fontWeight: 700, fontSize: ".85rem" }}>{ETAPA[c.etapa].txt}</span>
                        {c.avaliou && <span style={{ fontSize: ".75rem", border: `1px solid ${C.line}`, borderRadius: 999, padding: "1px 8px" }}>Avaliou</span>}
                      </div>
                      <div style={{ color: C.muted, fontSize: ".85rem", marginTop: 2 }}>
                        {c.email} · {c.origem || "(direto)"}{c.campanha ? ` / ${c.campanha}` : ""} · {num(c.acoes)} ações
                        {c.cobrancas ? ` · ${c.cobrancas} cobrança${c.cobrancas > 1 ? "s" : ""}` : ""}
                        {c.valor_pago ? ` · ${brl(c.valor_pago)}` : ""} · última atividade {fmtData(c.ultima_atividade)}
                      </div>
                    </button>
                    {abre && (
                      <div style={{ padding: "4px 14px 14px", background: C.paper }}>
                        <div style={{ display: "grid", gap: 4, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", fontSize: ".85rem", margin: "6px 0 12px" }}>
                          <span><span style={{ color: C.muted }}>CPF/CNPJ:</span> {c.documento || "—"}</span>
                          <span><span style={{ color: C.muted }}>Plano:</span> {c.plano || "—"}{c.forma ? ` (${c.forma})` : ""}</span>
                          <span><span style={{ color: C.muted }}>Primeiro contato:</span> {fmtData(c.primeiro_contato)}</span>
                        </div>
                        <strong style={{ fontSize: ".9rem" }}>Jornada (mais recente primeiro)</strong>
                        {c.jornada.length === 0 && <p style={{ color: C.muted, margin: "6px 0 0" }}>Sem ações registradas.</p>}
                        <ol style={{ listStyle: "none", margin: "8px 0 0", padding: 0, borderLeft: `2px solid ${C.line}` }}>
                          {c.jornada.map((j, i) => (
                            <li key={`${j.quando}-${i}`} style={{ padding: "4px 0 6px 12px", position: "relative" }}>
                              <span style={{ position: "absolute", left: -6, top: 10, width: 10, height: 10, borderRadius: 999,
                                background: j.tipo === "checkout" ? (j.nome === "PagamentoConfirmado" ? C.ok : C.signal) : j.tipo === "avaliacao" ? "#b7791f" : C.muted }} />
                              <span style={{ color: C.muted, fontSize: ".8rem" }}>{fmtData(j.quando)}</span>{" "}
                              <strong style={{ fontSize: ".9rem" }}>{NOME_EVENTO[j.nome] || j.nome}</strong>
                              {j.pagina && <span style={{ color: C.muted, fontSize: ".8rem" }}> · {j.pagina}</span>}
                              {j.detalhes && Object.keys(j.detalhes).length > 0 && (
                                <div style={{ color: C.muted, fontSize: ".8rem" }}>
                                  {Object.entries(j.detalhes)
                                    .filter(([, v]) => v !== null && v !== "")
                                    .map(([k, v]) => `${k}: ${k === "valor" ? brl(Number(v)) : String(v)}`)
                                    .join(" · ")}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ color: C.muted, fontSize: ".8rem", margin: "12px 0 0" }}>
              Contato = quem deixou e-mail no checkout ou na avaliação. As ações (visitas e cliques) são ligadas ao contato pelo navegador
              que ele usou, então só aparecem a partir do deploy do rastreamento.
            </p>
          </div>
        )}

        {aba === "leads" && dados && (
          <div style={card}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)} style={btn} aria-label="Status">
                <option value="todos">Todos os status</option>
                <option value="iniciado">Iniciado</option>
                <option value="pago">Pago</option>
                <option value="expirado">Expirado</option>
              </select>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, e-mail ou origem"
                style={{ ...btn, flex: "1 1 220px", cursor: "text" }} />
              <span style={{ color: C.muted, fontSize: ".9rem" }}>{leadsFiltrados.length} leads</span>
              <button onClick={() => baixarCsv(leadsFiltrados)} style={btn} disabled={!leadsFiltrados.length}>Baixar CSV</button>
            </div>
            <Tabela>
              <thead>
                <tr>
                  <th style={th}>Data</th>
                  <th style={th}>Nome</th>
                  <th style={th}>E-mail</th>
                  <th style={th}>Plano / forma</th>
                  <th style={th}>Valor</th>
                  <th style={th}>Status</th>
                  <th style={th}>Origem</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.length === 0 && (
                  <tr><td style={td} colSpan={7}>Nenhum lead no filtro.</td></tr>
                )}
                {leadsFiltrados.map((l) => (
                  <tr key={`${l.charge_id}-${l.created_at}`}>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtData(l.created_at)}</td>
                    <td style={td}>{l.nome || "—"}</td>
                    <td style={td}>{l.email || "—"}</td>
                    <td style={td}>
                      {l.plano_label || "—"}
                      <div style={{ color: C.muted, fontSize: ".8rem" }}>
                        {l.forma || ""}{l.parcelas ? ` · ${l.parcelas}x` : ""}
                      </div>
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{brl(l.valor)}</td>
                    <td style={{ ...td, color: STATUS_LEAD[l.status]?.cor, fontWeight: 700 }}>{STATUS_LEAD[l.status]?.txt || l.status}</td>
                    <td style={td}>
                      {l.utm_source || "(direto)"}
                      {l.utm_campaign && <div style={{ color: C.muted, fontSize: ".8rem" }}>{l.utm_campaign}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tabela>
            <p style={{ color: C.muted, fontSize: ".8rem", margin: "12px 0 0" }}>
              &quot;Pago&quot; é marcado quando o comprador ainda está na página do checkout no momento da confirmação. Quem pagou o Pix depois de fechar a página pode aparecer como &quot;Iniciado&quot;: confira no Asaas.
            </p>
          </div>
        )}

        {aba === "avaliacoes" && (
          <div>
            <p style={{ color: C.muted, margin: "0 0 12px" }}>
              Marque <strong>&quot;Liberei +1 dia&quot;</strong> depois de conceder o dia na plataforma.
            </p>
            <CmcAvaliacoesLista rows={avaliacoes} onMarcar={(id, st) => void marcar(id, st)} />
          </div>
        )}

        {aba === "eventos" && dados && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Eventos no período</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Evento</th>
                    <th style={th}>Nome técnico</th>
                    <th style={th}>Total</th>
                    <th style={th}>Visitantes</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.eventos.length === 0 && (
                    <tr><td style={td} colSpan={4}>Nenhum evento registrado no período.</td></tr>
                  )}
                  {dados.eventos.map((e) => (
                    <tr key={e.event}>
                      <td style={{ ...td, fontWeight: 600 }}>{NOME_EVENTO[e.event] || e.event}</td>
                      <td style={{ ...td, color: C.muted, fontFamily: "monospace", fontSize: ".8rem" }}>{e.event}</td>
                      <td style={td}>{num(e.total)}</td>
                      <td style={td}>{num(e.visitantes)}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Últimos eventos</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Quando</th>
                    <th style={th}>Evento</th>
                    <th style={th}>Página</th>
                    <th style={th}>Detalhes</th>
                    <th style={th}>Origem</th>
                    <th style={th}>Visitante</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.eventos_recentes.length === 0 && (
                    <tr><td style={td} colSpan={6}>Nenhum evento ainda.</td></tr>
                  )}
                  {dados.eventos_recentes.map((e, i) => (
                    <tr key={`${e.created_at}-${i}`}>
                      <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtData(e.created_at)}</td>
                      <td style={td}>{NOME_EVENTO[e.event] || e.event}</td>
                      <td style={{ ...td, color: C.muted }}>{e.page || "—"}</td>
                      <td style={{ ...td, color: C.muted, fontSize: ".8rem" }}>
                        {e.params ? Object.entries(e.params).map(([k, v]) => `${k}: ${v}`).join(" · ") : "—"}
                      </td>
                      <td style={td}>{e.utm_source || "(direto)"}</td>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: ".8rem", color: C.muted }}>{e.visitante || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
