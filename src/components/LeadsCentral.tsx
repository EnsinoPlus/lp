import { useMemo, useState } from "react";
import type { LeadCentral, LeadEtapa } from "@/lib/leads-central";

// Aba "Todos os leads": uma linha por pessoa, juntando os cadastros de todas as páginas
// pelo e-mail (ou WhatsApp, quando não há e-mail).

const C = {
  ink: "#0F1F1A",
  paper: "#F3EFE6",
  signal: "#E8552B",
  muted: "#5C6B64",
  line: "#d9d3c4",
  ok: "#1b7a46",
  alerta: "#b7791f",
};

const ETAPA: Record<LeadEtapa, { txt: string; cor: string; peso: number }> = {
  pagou: { txt: "Pagou", cor: C.ok, peso: 7 },
  cadastrou: { txt: "Criou conta", cor: C.ok, peso: 6 },
  cobranca: { txt: "Gerou cobrança", cor: C.signal, peso: 5 },
  avaliou: { txt: "Avaliou", cor: C.ink, peso: 4 },
  enviou: { txt: "Enviou os dados", cor: C.alerta, peso: 3 },
  expirou: { txt: "Não pagou", cor: C.muted, peso: 2 },
  preencheu: { txt: "Só preencheu", cor: C.alerta, peso: 1 },
};
const ORDEM = (Object.keys(ETAPA) as LeadEtapa[]).sort((a, b) => ETAPA[b].peso - ETAPA[a].peso);

type Pessoa = {
  chave: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  etapa: LeadEtapa;
  paginas: string[];
  quando: string;
  origem: string;
  valorPago: number;
  ofertas: string[];
};

const card: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  padding: 18,
};
const btn: React.CSSProperties = {
  padding: "8px 14px",
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  background: "#fff",
  cursor: "pointer",
  font: "inherit",
  color: C.ink,
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: ".8rem",
  color: C.muted,
  fontWeight: 700,
  borderBottom: `1px solid ${C.line}`,
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: `1px solid ${C.line}`,
  fontSize: ".9rem",
  verticalAlign: "top",
};

const fmtData = (s: string) => {
  try {
    return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
};

function zapDe(telefone: string | null) {
  const d = (telefone || "").replace(/\D/g, "");
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`;
}

function agrupar(rows: LeadCentral[]): Pessoa[] {
  const mapa = new Map<string, Pessoa>();
  rows.forEach((r, i) => {
    const chave =
      r.email?.trim().toLowerCase() || r.telefone?.replace(/\D/g, "") || `sem-contato-${i}`;
    const p = mapa.get(chave);
    const origem = [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / ");
    if (!p) {
      mapa.set(chave, {
        chave,
        nome: r.nome,
        email: r.email,
        telefone: r.telefone,
        etapa: r.etapa,
        paginas: [r.pagina],
        quando: r.quando,
        origem,
        valorPago: r.etapa === "pagou" ? Number(r.valor || 0) : 0,
        ofertas: r.oferta ? [r.oferta] : [],
      });
      return;
    }
    p.nome = p.nome || r.nome;
    p.email = p.email || r.email;
    p.telefone = p.telefone || r.telefone;
    p.origem = p.origem || origem;
    if (ETAPA[r.etapa].peso > ETAPA[p.etapa].peso) p.etapa = r.etapa;
    if (!p.paginas.includes(r.pagina)) p.paginas.push(r.pagina);
    if (r.quando > p.quando) p.quando = r.quando;
    if (r.etapa === "pagou") p.valorPago += Number(r.valor || 0);
    if (r.oferta && !p.ofertas.includes(r.oferta)) p.ofertas.push(r.oferta);
  });
  return [...mapa.values()].sort((a, b) => (a.quando < b.quando ? 1 : -1));
}

function baixarCsv(rows: LeadCentral[]) {
  const cab = [
    "pagina",
    "etapa",
    "cadastro",
    "ultima_atividade",
    "nome",
    "email",
    "whatsapp",
    "oferta",
    "valor",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((r) =>
    [
      r.pagina,
      ETAPA[r.etapa].txt,
      fmtData(r.created_at),
      fmtData(r.quando),
      r.nome,
      r.email,
      r.telefone,
      r.oferta,
      String(r.valor ?? "").replace(".", ","),
      r.utm_source,
      r.utm_medium,
      r.utm_campaign,
      r.utm_content,
    ]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["﻿" + [cab.join(";"), ...linhas].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (a: number, b: number) =>
  b > 0 ? `${((a / b) * 100).toFixed(1).replace(".", ",")}%` : "—";
const COM_COBRANCA: LeadEtapa[] = ["cobranca", "expirou", "pagou"];

type Linha = {
  nome: string;
  pessoas: number;
  enviaram: number;
  pagaram: number;
  faturamento: number;
};

function chaveDe(r: LeadCentral, i: number) {
  return r.email?.trim().toLowerCase() || r.telefone?.replace(/\D/g, "") || `sem-contato-${i}`;
}

/** Agrupa por um campo e conta pessoas únicas, quem enviou os dados, quem pagou e o faturamento. */
function porCampo(rows: LeadCentral[], campo: (r: LeadCentral) => string): Linha[] {
  const g = new Map<string, { p: Set<string>; e: Set<string>; pg: Set<string>; f: number }>();
  rows.forEach((r, i) => {
    const k = campo(r);
    const c = chaveDe(r, i);
    const x = g.get(k) ?? { p: new Set(), e: new Set(), pg: new Set(), f: 0 };
    x.p.add(c);
    if (r.etapa !== "preencheu") x.e.add(c);
    if (r.etapa === "pagou") {
      x.pg.add(c);
      x.f += Number(r.valor || 0);
    }
    g.set(k, x);
  });
  return [...g.entries()]
    .map(([nome, x]) => ({
      nome,
      pessoas: x.p.size,
      enviaram: x.e.size,
      pagaram: x.pg.size,
      faturamento: x.f,
    }))
    .sort(
      (a, b) => b.faturamento - a.faturamento || b.pagaram - a.pagaram || b.pessoas - a.pessoas,
    );
}

function Kpi({ titulo, valor, sub }: { titulo: string; valor: string; sub?: string }) {
  return (
    <div style={{ ...card, padding: 14 }}>
      <div style={{ color: C.muted, fontSize: ".8rem", fontWeight: 600 }}>{titulo}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 2 }}>{valor}</div>
      {sub && <div style={{ color: C.muted, fontSize: ".78rem", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function TabelaQuebra({
  titulo,
  coluna,
  linhas,
}: {
  titulo: string;
  coluna: string;
  linhas: Linha[];
}) {
  return (
    <div style={card}>
      <h2 style={{ fontSize: "1rem", margin: "0 0 10px" }}>{titulo}</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>{coluna}</th>
              <th style={th}>Pessoas</th>
              <th style={th}>Enviaram</th>
              <th style={th}>Pagaram</th>
              <th style={th}>Conversão</th>
              <th style={th}>Faturamento</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td style={td} colSpan={6}>
                  Sem dados no período.
                </td>
              </tr>
            )}
            {linhas.map((l) => (
              <tr key={l.nome}>
                <td style={{ ...td, fontWeight: 600 }}>{l.nome}</td>
                <td style={td}>{l.pessoas}</td>
                <td style={td}>{l.enviaram}</td>
                <td
                  style={{
                    ...td,
                    color: l.pagaram ? C.ok : undefined,
                    fontWeight: l.pagaram ? 700 : 400,
                  }}
                >
                  {l.pagaram}
                </td>
                <td style={td}>{pct(l.pagaram, l.pessoas)}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  {l.faturamento ? brl(l.faturamento) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadsMetricas({ rows }: { rows: LeadCentral[] }) {
  // Marcas por pessoa, olhando todas as linhas dela (uma pessoa pode ter passado por várias páginas).
  const pessoas = new Map<string, { enviou: boolean; cobranca: boolean; pagou: boolean }>();
  let faturamento = 0;
  let vendas = 0;
  rows.forEach((r, i) => {
    const c = chaveDe(r, i);
    const p = pessoas.get(c) ?? { enviou: false, cobranca: false, pagou: false };
    if (r.etapa !== "preencheu") p.enviou = true;
    if (COM_COBRANCA.includes(r.etapa)) p.cobranca = true;
    if (r.etapa === "pagou") {
      p.pagou = true;
      vendas += 1;
      faturamento += Number(r.valor || 0);
    }
    pessoas.set(c, p);
  });
  const lista = [...pessoas.values()];
  const total = lista.length;
  const enviaram = lista.filter((p) => p.enviou).length;
  const cobranca = lista.filter((p) => p.cobranca).length;
  const pagaram = lista.filter((p) => p.pagou).length;
  const recuperar = total - pagaram;

  const funil = [
    { nome: "Deixaram contato", v: total },
    { nome: "Enviaram os dados", v: enviaram },
    { nome: "Geraram cobrança", v: cobranca },
    { nome: "Pagaram", v: pagaram },
  ];

  // Novos leads e vendas por dia (pela data do cadastro), últimos 30 dias com movimento.
  const dias = new Map<string, { leads: Set<string>; pagos: number }>();
  rows.forEach((r, i) => {
    const d = new Date(r.created_at);
    if (isNaN(d.getTime())) return;
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const x = dias.get(k) ?? { leads: new Set(), pagos: 0 };
    x.leads.add(chaveDe(r, i));
    if (r.etapa === "pagou") x.pagos += 1;
    dias.set(k, x);
  });
  const porDia = [...dias.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-30);
  const maxDia = Math.max(1, ...porDia.map(([, x]) => x.leads.size));

  const origens = porCampo(rows, (r) => r.utm_source || "(direto / sem UTM)");
  const campanhas = porCampo(rows, (r) => r.utm_campaign || "(sem campanha)");
  const produtos = porCampo(rows, produtoDe);
  const planos = porCampo(
    rows.filter((r) => planoDe(r)),
    (r) => `${produtoDe(r)} · ${planoDe(r)}`,
  );

  return (
    <div style={{ display: "grid", gap: 16, marginBottom: 16 }}>
      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}
      >
        <Kpi titulo="Pessoas" valor={String(total)} sub={`${rows.length} cadastros`} />
        <Kpi titulo="Pagaram" valor={String(pagaram)} sub={`${pct(pagaram, total)} das pessoas`} />
        <Kpi
          titulo="Faturamento"
          valor={brl(faturamento)}
          sub={`${vendas} venda${vendas === 1 ? "" : "s"}`}
        />
        <Kpi titulo="Ticket médio" valor={vendas ? brl(faturamento / vendas) : "—"} />
        <Kpi
          titulo="Para recuperar"
          valor={String(recuperar)}
          sub="deixaram contato e não pagaram"
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        <div style={card}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 12px" }}>Funil</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {funil.map((f, i) => (
              <div key={f.nome}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    fontSize: ".88rem",
                  }}
                >
                  <span>{f.nome}</span>
                  <span>
                    <strong>{f.v}</strong>
                    {i > 0 && <span style={{ color: C.muted }}> · {pct(f.v, funil[i - 1].v)}</span>}
                  </span>
                </div>
                <div style={{ height: 10, background: C.paper, borderRadius: 999, marginTop: 4 }}>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: i === funil.length - 1 ? C.ok : C.signal,
                      width: `${Math.min(100, (f.v / Math.max(1, total)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: C.muted, fontSize: ".78rem", margin: "10px 0 0" }}>
            O percentual é em relação à etapa anterior.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 12px" }}>Novos leads por dia</h2>
          {porDia.length === 0 ? (
            <p style={{ color: C.muted, margin: 0 }}>Sem dados no período.</p>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
                {porDia.map(([dia, x]) => (
                  <div
                    key={dia}
                    title={`${dia.slice(8)}/${dia.slice(5, 7)}: ${x.leads.size} leads, ${x.pagos} pagos`}
                    style={{
                      flex: 1,
                      minWidth: 4,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        height: `${(x.leads.size / maxDia) * 100}%`,
                        background: x.pagos ? C.ok : C.signal,
                        borderRadius: "4px 4px 0 0",
                        minHeight: 2,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: C.muted,
                  fontSize: ".75rem",
                  marginTop: 4,
                }}
              >
                <span>
                  {porDia[0][0].slice(8)}/{porDia[0][0].slice(5, 7)}
                </span>
                <span>
                  {porDia[porDia.length - 1][0].slice(8)}/{porDia[porDia.length - 1][0].slice(5, 7)}
                </span>
              </div>
              <p style={{ color: C.muted, fontSize: ".78rem", margin: "8px 0 0" }}>
                Verde = dia com venda. Passe o mouse para ver os números.
              </p>
            </>
          )}
        </div>
      </div>

      <TabelaQuebra titulo="Por produto" coluna="Produto" linhas={produtos} />
      {planos.length > 0 && (
        <TabelaQuebra titulo="Por plano / pacote" coluna="Plano / pacote" linhas={planos} />
      )}
      <TabelaQuebra titulo="Por origem (utm_source)" coluna="Origem" linhas={origens} />
      <TabelaQuebra titulo="Por campanha (utm_campaign)" coluna="Campanha" linhas={campanhas} />
    </div>
  );
}

/** Produto de cada cadastro: junta as páginas do mesmo produto. */
function produtoDe(r: LeadCentral): string {
  if (r.oferta?.startsWith("Black Week")) return "Black Week: Connect + CCT";
  if (r.pagina.startsWith("Calc Machine")) return "Calc Machine";
  if (r.pagina === "Primeira Recarga" || r.pagina === "11.11 Mais Créditos")
    return `Créditos: ${r.pagina}`;
  return r.pagina;
}

/** Plano ou pacote comprado (só faz sentido onde há oferta com preço). */
function planoDe(r: LeadCentral): string | null {
  const pr = produtoDe(r);
  if (
    r.pagina === "Calc Machine: checkout" ||
    pr.startsWith("Créditos") ||
    pr.startsWith("Black Week")
  )
    return r.oferta || null;
  return null;
}

export function LeadsCentralLista({ rows: todas }: { rows: LeadCentral[] }) {
  const rows = useMemo(() => todas.filter((r) => !r.email?.endsWith(".invalid")), [todas]);
  const [produto, setProduto] = useState("todos");
  const [plano, setPlano] = useState("todos");
  const [etapa, setEtapa] = useState<LeadEtapa | "todas">("todas");
  const [busca, setBusca] = useState("");

  const produtos = useMemo(() => {
    const n = new Map<string, Set<string>>();
    rows.forEach((r, i) => {
      const k = produtoDe(r);
      const x = n.get(k) ?? new Set<string>();
      x.add(chaveDe(r, i));
      n.set(k, x);
    });
    return [...n.entries()].map(([nome, x]) => ({ nome, n: x.size })).sort((a, b) => b.n - a.n);
  }, [rows]);
  const doProduto = useMemo(
    () => rows.filter((r) => produto === "todos" || produtoDe(r) === produto),
    [rows, produto],
  );
  const planos = useMemo(
    () => [...new Set(doProduto.map(planoDe).filter((x): x is string => !!x))].sort(),
    [doProduto],
  );
  const daPagina = useMemo(
    () => doProduto.filter((r) => plano === "todos" || planoDe(r) === plano),
    [doProduto, plano],
  );
  const pessoas = useMemo(() => agrupar(daPagina), [daPagina]);
  const q = busca.trim().toLowerCase();
  const lista = pessoas
    .filter((p) => etapa === "todas" || p.etapa === etapa)
    .filter(
      (p) =>
        !q ||
        `${p.nome || ""} ${p.email || ""} ${p.telefone || ""} ${p.origem} ${p.paginas.join(" ")}`
          .toLowerCase()
          .includes(q),
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: ".9rem" }}>Produto:</span>
        {[{ nome: "todos", n: new Set(rows.map((r, i) => chaveDe(r, i))).size }, ...produtos].map(
          (pr) => {
            const ativo = produto === pr.nome;
            return (
              <button
                key={pr.nome}
                onClick={() => {
                  setProduto(pr.nome);
                  setPlano("todos");
                }}
                style={{
                  ...btn,
                  borderRadius: 999,
                  fontSize: ".85rem",
                  fontWeight: 600,
                  background: ativo ? C.signal : "#fff",
                  color: ativo ? "#fff" : C.ink,
                  borderColor: ativo ? C.signal : C.line,
                }}
              >
                {pr.nome === "todos" ? "Todos os produtos" : pr.nome} ({pr.n})
              </button>
            );
          },
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {planos.length > 0 && (
          <select
            aria-label="Plano ou pacote"
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
            style={btn}
          >
            <option value="todos">Todos os planos / pacotes</option>
            {planos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}
        <span style={{ color: C.muted, fontSize: ".85rem" }}>
          Mostrando:{" "}
          <strong style={{ color: C.ink }}>
            {produto === "todos" ? "todos os produtos" : produto}
          </strong>
          {plano !== "todos" && <> · {plano}</>} · período escolhido no topo.
        </span>
      </div>
      <LeadsMetricas rows={daPagina} />
      <div style={card}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {(["todas", ...ORDEM] as const).map((e) => {
            const n = e === "todas" ? pessoas.length : pessoas.filter((p) => p.etapa === e).length;
            if (e !== "todas" && n === 0) return null;
            const ativo = etapa === e;
            return (
              <button
                key={e}
                onClick={() => setEtapa(e)}
                style={{
                  ...btn,
                  borderRadius: 999,
                  fontSize: ".85rem",
                  background: ativo ? C.ink : "#fff",
                  color: ativo ? "#fff" : C.ink,
                }}
              >
                {e === "todas" ? "Todas as pessoas" : ETAPA[e].txt} ({n})
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nome, e-mail, WhatsApp ou UTM"
            style={{ ...btn, flex: "1 1 220px", cursor: "text" }}
          />
          <span style={{ color: C.muted, fontSize: ".9rem" }}>{lista.length} pessoas</span>
          <button onClick={() => baixarCsv(daPagina)} style={btn} disabled={!daPagina.length}>
            Baixar CSV
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>E-mail</th>
                <th style={th}>WhatsApp</th>
                <th style={th}>Etapa</th>
                <th style={th}>Valor pago</th>
                <th style={th}>Páginas</th>
                <th style={th}>Origem (UTM)</th>
                <th style={th}>Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td style={td} colSpan={8}>
                    Nenhum lead no filtro.
                  </td>
                </tr>
              )}
              {lista.map((p) => {
                const zap = zapDe(p.telefone);
                return (
                  <tr key={p.chave}>
                    <td style={td}>{p.nome || "—"}</td>
                    <td style={td}>
                      {p.email ? (
                        <a href={`mailto:${p.email}`} style={{ color: C.ink }}>
                          {p.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {zap ? (
                        <a
                          href={zap}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: C.ok, fontWeight: 700 }}
                        >
                          {p.telefone}
                        </a>
                      ) : (
                        p.telefone || "—"
                      )}
                    </td>
                    <td
                      style={{
                        ...td,
                        color: ETAPA[p.etapa].cor,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ETAPA[p.etapa].txt}
                    </td>
                    <td
                      style={{
                        ...td,
                        whiteSpace: "nowrap",
                        color: p.valorPago ? C.ok : C.muted,
                        fontWeight: p.valorPago ? 700 : 400,
                      }}
                    >
                      {p.valorPago ? brl(p.valorPago) : p.etapa === "pagou" ? "sem valor" : "—"}
                      {p.ofertas.length > 0 && (
                        <div style={{ color: C.muted, fontSize: ".78rem", fontWeight: 400 }}>
                          {p.ofertas.join(", ")}
                        </div>
                      )}
                    </td>
                    <td style={td}>{p.paginas.join(", ")}</td>
                    <td style={td}>{p.origem || "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtData(p.quando)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ color: C.muted, fontSize: ".8rem", margin: "12px 0 0" }}>
          Cada pessoa aparece uma vez, na etapa mais avançada. &quot;Criou conta&quot; é o cadastro
          do CCT. O CSV traz uma linha por cadastro. O CCT começou a ser salvo agora: cadastros
          antigos dele não aparecem aqui.
        </p>
      </div>
    </div>
  );
}
