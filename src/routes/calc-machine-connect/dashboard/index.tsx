import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  fetchCmcContatos,
  fetchCmcDashboard,
  type CmcContato,
  type CmcDashboard,
  type CmcEtapa,
} from "@/lib/cmc-events";
import { listCmcAvaliacoes, setCmcAvaliacaoStatus, type AvaliacaoRow } from "@/lib/cmc-avaliacao-db";
import { CmcAvaliacoesLista } from "@/components/CmcAvaliacoesLista";

// Dashboard interno do Calc Machine Connect: cobranças, pagamentos, listas de recuperação,
// contatos e avaliações. Login = mesmo e-mail/senha do painel de avaliações.

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
type Aba = "geral" | "recuperacao" | "contatos" | "leads" | "avaliacoes";

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
  PreencheuCheckout: "Preencheu dados no checkout",
  ComecouAvaliacao: "Começou a avaliação",
  CheckoutErro: "Erro ao gerar cobrança",
};

const ETAPA: Record<CmcEtapa, { txt: string; cor: string }> = {
  pagou: { txt: "Pagou", cor: C.ok },
  gerou_cobranca: { txt: "Gerou cobrança, não pagou", cor: C.signal },
  preencheu: { txt: "Preencheu, não gerou cobrança", cor: "#b7791f" },
  clicou: { txt: "Clicou, não gerou cobrança", cor: "#b7791f" },
  visitou: { txt: "Só visitou", cor: C.muted },
  sem_rastreio: { txt: "Sem visitas rastreadas", cor: C.muted },
};
const ORDEM_ETAPA: CmcEtapa[] = ["pagou", "gerou_cobranca", "preencheu", "clicou", "visitou", "sem_rastreio"];

const STATUS_LEAD: Record<string, { txt: string; cor: string }> = {
  parcial: { txt: "Só preencheu", cor: "#b7791f" },
  iniciado: { txt: "Cobrança gerada", cor: C.muted },
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
  const cab = ["data", "nome", "email", "whatsapp", "plano", "forma", "parcelas", "valor", "status", "origem", "campanha"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((r) =>
    [fmtData(r.created_at), r.nome, r.email, r.telefone, r.plano_label, r.forma, r.parcelas, String(r.valor ?? "").replace(".", ","), r.status, r.utm_source, r.utm_campaign]
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

function baixarCsvContatos(rows: CmcContato[], arquivo = "contatos") {
  const cab = ["nome", "email", "whatsapp", "cpf_cnpj", "etapa", "origem", "campanha", "plano", "forma", "cobrancas", "valor_pago", "acoes", "avaliou", "primeiro_contato", "ultima_atividade"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((c) =>
    [c.nome, c.email, c.telefone, c.documento, ETAPA[c.etapa].txt, c.origem, c.campanha, c.plano, c.forma, c.cobrancas,
      String(c.valor_pago ?? "").replace(".", ","), c.acoes, c.avaliou ? "sim" : "não", fmtData(c.primeiro_contato), fmtData(c.ultima_atividade)]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["\ufeff" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${arquivo}-calc-machine-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function zapDe(telefone: string | null) {
  const d = (telefone || "").replace(/\D/g, "");
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`;
}

function ListaRecuperacao({ titulo, ajuda, arquivo, rows }: { titulo: string; ajuda: string; arquivo: string; rows: CmcContato[] }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
        <h2 style={{ fontSize: "1.05rem", margin: 0, marginRight: "auto" }}>
          {titulo} ({rows.length})
        </h2>
        <button onClick={() => baixarCsvContatos(rows, arquivo)} style={btn} disabled={!rows.length}>Baixar CSV</button>
      </div>
      <p style={{ color: C.muted, fontSize: ".85rem", margin: "0 0 10px" }}>{ajuda}</p>
      <Tabela>
        <thead>
          <tr>
            <th style={th}>Nome</th>
            <th style={th}>E-mail</th>
            <th style={th}>WhatsApp</th>
            <th style={th}>Plano / forma</th>
            <th style={th}>Origem</th>
            <th style={th}>Última atividade</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td style={td} colSpan={6}>Ninguém nesta lista no período.</td></tr>
          )}
          {rows.map((c) => {
            const zap = zapDe(c.telefone);
            return (
              <tr key={c.chave}>
                <td style={td}>{c.nome || "—"}</td>
                <td style={td}>{c.email ? <a href={`mailto:${c.email}`} style={{ color: C.ink }}>{c.email}</a> : "—"}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  {zap ? <a href={zap} target="_blank" rel="noreferrer" style={{ color: C.ok, fontWeight: 700 }}>{c.telefone}</a> : c.telefone || "—"}
                </td>
                <td style={td}>{c.plano || "—"}{c.forma ? ` (${c.forma})` : ""}</td>
                <td style={td}>{c.origem || "(direto)"}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtData(c.ultima_atividade)}</td>
              </tr>
            );
          })}
        </tbody>
      </Tabela>
    </div>
  );
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
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "parcial" | "iniciado" | "pago" | "expirado">("todos");
  const [busca, setBusca] = useState("");
  const [contatos, setContatos] = useState<CmcContato[]>([]);
  const [filtroEtapa, setFiltroEtapa] = useState<CmcEtapa | "todas">("todas");
  const [buscaContato, setBuscaContato] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const carregar = async (em: string, se: string, p: Periodo) => {
    setCarregando(true);
    setErro("");
    const desde = desdeDe(p);
    const [r, av, ct] = await Promise.all([
      fetchCmcDashboard(em, se, desde),
      listCmcAvaliacoes(em, se),
      fetchCmcContatos(em, se, desde),
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
  };

  const leadsFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return (dados?.checkouts || []).filter(
      (r) =>
        (filtroStatus === "todos" || r.status === filtroStatus) &&
        (!q || `${r.nome || ""} ${r.email || ""} ${r.telefone || ""} ${r.utm_source || ""}`.toLowerCase().includes(q)),
    );
  }, [dados, filtroStatus, busca]);

  const contatosFiltrados = useMemo(() => {
    const q = buscaContato.trim().toLowerCase();
    return contatos.filter(
      (c) =>
        (filtroEtapa === "todas" || c.etapa === filtroEtapa) &&
        (!q || `${c.nome || ""} ${c.email || ""} ${c.telefone || ""} ${c.origem || ""} ${c.documento || ""}`.toLowerCase().includes(q)),
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
  const comCobranca = contatos.filter((c) => c.cobrancas > 0);
  const recCobranca = contatos.filter((c) => c.etapa === "gerou_cobranca");
  const recForm = contatos.filter(
    (c) => c.etapa === "preencheu" && c.jornada.some((j) => j.nome === "PreencheuCheckout"),
  );
  const pagos = (dados?.checkouts || []).filter((c) => c.status === "pago");
  const pagosPix = pagos.filter((c) => (c.forma || "").startsWith("pix"));
  const pagosCartao = pagos.filter((c) => c.forma === "card");
  const somaValor = (l: typeof pagos) => l.reduce((t, c) => t + Number(c.valor || 0), 0);
  const origensCk = (dados?.origens || []).filter((o) => o.checkouts > 0);
  const diasCk = [...(dados?.por_dia || [])].reverse().filter((d) => d.checkouts > 0 || d.pagos > 0);
  const pagaram = contatos.filter((c) => c.etapa === "pagou").length;
  const funil = [
    { nome: "Preencheram os dados", v: comCobranca.length + recForm.length },
    { nome: "Geraram cobrança", v: comCobranca.length },
    { nome: "Pagaram", v: pagaram },
  ];

  const abas: { id: Aba; txt: string }[] = [
    { id: "geral", txt: "Visão geral" },
    { id: "recuperacao", txt: `Recuperação (${recCobranca.length + recForm.length})` },
    { id: "contatos", txt: `Contatos (${contatos.length})` },
    { id: "leads", txt: `Leads do checkout (${dados?.checkouts.length ?? 0})` },
    { id: "avaliacoes", txt: `Avaliações${pendentes ? ` (${pendentes} pendente${pendentes > 1 ? "s" : ""})` : ""}` },
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
              <Kpi titulo="Cobranças geradas" valor={num(r.checkouts)} sub={`${num(comCobranca.length)} pessoas`} />
              <Kpi titulo="Pix pagos" valor={num(pagosPix.length)} sub={brl(somaValor(pagosPix))} />
              <Kpi titulo="Cartão pagos" valor={num(pagosCartao.length)} sub={brl(somaValor(pagosCartao))} />
              <Kpi titulo="Faturamento" valor={brl(r.valor_pago)} sub={`${num(r.pagos)} pagamentos`} />
              <Kpi titulo="Para recuperar" valor={num(recCobranca.length + recForm.length)} sub="pessoas que não pagaram" />
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Funil de pessoas</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {funil.map((f, i) => {
                  const base = Math.max(1, funil[0].v);
                  return (
                    <div key={f.nome}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem" }}>
                        <span>{f.nome}</span>
                        <span>
                          <strong>{num(f.v)}</strong>
                          {i > 0 && <span style={{ color: C.muted }}> · {pct(f.v, funil[i - 1].v)} da etapa anterior</span>}
                        </span>
                      </div>
                      <div style={{ height: 10, background: C.paper, borderRadius: 999, marginTop: 4 }}>
                        <div style={{ height: 10, borderRadius: 999, background: C.signal, width: `${Math.min(100, (f.v / base) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Por origem (utm_source)</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Origem</th>
                    <th style={th}>Cobranças</th>
                    <th style={th}>Pagas</th>
                    <th style={th}>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {origensCk.length === 0 && (
                    <tr><td style={td} colSpan={4}>Sem cobranças no período.</td></tr>
                  )}
                  {origensCk.map((o) => (
                    <tr key={o.origem}>
                      <td style={{ ...td, fontWeight: 600 }}>{o.origem}</td>
                      <td style={td}>{num(o.checkouts)}</td>
                      <td style={td}>{num(o.pagos)}</td>
                      <td style={td}>{brl(o.valor_pago)}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 12px" }}>Por dia</h2>
              <Tabela>
                <thead>
                  <tr>
                    <th style={th}>Dia</th>
                    <th style={th}>Cobranças</th>
                    <th style={th}>Pagas</th>
                  </tr>
                </thead>
                <tbody>
                  {diasCk.length === 0 && (
                    <tr><td style={td} colSpan={3}>Sem cobranças no período.</td></tr>
                  )}
                  {diasCk.map((d) => (
                    <tr key={d.dia}>
                      <td style={td}>{fmtDia(d.dia)}</td>
                      <td style={td}>{num(d.checkouts)}</td>
                      <td style={{ ...td, color: d.pagos ? C.ok : undefined, fontWeight: d.pagos ? 700 : 400 }}>{num(d.pagos)}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabela>
            </div>
          </div>
        )}

        {aba === "recuperacao" && (
          <div style={{ display: "grid", gap: 16 }}>
            <ListaRecuperacao
              titulo="Gerou cobrança e não pagou"
              ajuda="Confira no Asaas antes de chamar: quem pagou o Pix depois de fechar a página pode aparecer aqui."
              arquivo="cobranca-nao-paga"
              rows={recCobranca}
            />
            <ListaRecuperacao
              titulo="Preencheu os dados e não gerou cobrança"
              ajuda="Salvo enquanto a pessoa digita no checkout. Esta lista começa a contar agora."
              arquivo="abandono-checkout"
              rows={recForm}
            />
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
              <input value={buscaContato} onChange={(e) => setBuscaContato(e.target.value)} placeholder="Buscar nome, e-mail, WhatsApp, CPF ou origem"
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
                        <strong style={{ marginRight: "auto" }}>{c.nome || c.email || c.telefone || "Sem nome"}</strong>
                        <span style={{ color: ETAPA[c.etapa].cor, fontWeight: 700, fontSize: ".85rem" }}>{ETAPA[c.etapa].txt}</span>
                        {c.avaliou && <span style={{ fontSize: ".75rem", border: `1px solid ${C.line}`, borderRadius: 999, padding: "1px 8px" }}>Avaliou</span>}
                      </div>
                      <div style={{ color: C.muted, fontSize: ".85rem", marginTop: 2 }}>
                        {[c.email, c.telefone].filter(Boolean).join(" · ") || "sem contato"} · {c.origem || "(direto)"}{c.campanha ? ` / ${c.campanha}` : ""}
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
                                background: j.tipo === "checkout" ? (j.nome === "PagamentoConfirmado" ? C.ok : C.signal) : j.tipo === "evento" ? C.muted : "#b7791f" }} />
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
              Contato = quem deixou algum dado no checkout ou na avaliação. Visitas e cliques aparecem na jornada só para quem chegou depois de 03/11.
            </p>
          </div>
        )}

        {aba === "leads" && dados && (
          <div style={card}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)} style={btn} aria-label="Status">
                <option value="todos">Todos os status</option>
                <option value="parcial">Só preencheu</option>
                <option value="iniciado">Cobrança gerada</option>
                <option value="pago">Pago</option>
                <option value="expirado">Expirado</option>
              </select>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, e-mail, WhatsApp ou origem"
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
                  <th style={th}>WhatsApp</th>
                  <th style={th}>Plano / forma</th>
                  <th style={th}>Valor</th>
                  <th style={th}>Status</th>
                  <th style={th}>Origem</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.length === 0 && (
                  <tr><td style={td} colSpan={8}>Nenhum lead no filtro.</td></tr>
                )}
                {leadsFiltrados.map((l) => (
                  <tr key={`${l.charge_id}-${l.created_at}`}>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtData(l.created_at)}</td>
                    <td style={td}>{l.nome || "—"}</td>
                    <td style={td}>{l.email || "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{l.telefone || "—"}</td>
                    <td style={td}>
                      {l.plano_label || "—"}
                      <div style={{ color: C.muted, fontSize: ".8rem" }}>
                        {l.forma || ""}{l.parcelas ? ` · ${l.parcelas}x` : ""}
                      </div>
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{l.valor ? brl(l.valor) : "—"}</td>
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
              &quot;Pago&quot; é marcado quando o comprador ainda está na página do checkout no momento da confirmação. Quem pagou o Pix depois de fechar a página pode aparecer como &quot;Cobrança gerada&quot;: confira no Asaas.
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

      </div>
    </div>
  );
}
