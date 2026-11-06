import { useMemo, useState } from "react";
import type { LeadCentral, LeadEtapa } from "@/lib/leads-central";

// Aba "Todos os leads": uma linha por pessoa, juntando os cadastros de todas as páginas
// pelo e-mail (ou WhatsApp, quando não há e-mail).

const C = { ink: "#0F1F1A", paper: "#F3EFE6", signal: "#E8552B", muted: "#5C6B64", line: "#d9d3c4", ok: "#1b7a46", alerta: "#b7791f" };

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
};

const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 };
const btn: React.CSSProperties = { padding: "8px 14px", border: `1px solid ${C.line}`, borderRadius: 10, background: "#fff", cursor: "pointer", font: "inherit", color: C.ink };
const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", fontSize: ".8rem", color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "8px 10px", borderBottom: `1px solid ${C.line}`, fontSize: ".9rem", verticalAlign: "top" };

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
    const chave = r.email?.trim().toLowerCase() || r.telefone?.replace(/\D/g, "") || `sem-contato-${i}`;
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
  });
  return [...mapa.values()].sort((a, b) => (a.quando < b.quando ? 1 : -1));
}

function baixarCsv(rows: LeadCentral[]) {
  const cab = ["pagina", "etapa", "cadastro", "ultima_atividade", "nome", "email", "whatsapp", "oferta", "valor", "utm_source", "utm_medium", "utm_campaign", "utm_content"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((r) =>
    [r.pagina, ETAPA[r.etapa].txt, fmtData(r.created_at), fmtData(r.quando), r.nome, r.email, r.telefone, r.oferta, String(r.valor ?? "").replace(".", ","), r.utm_source, r.utm_medium, r.utm_campaign, r.utm_content]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["﻿" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function LeadsCentralLista({ rows }: { rows: LeadCentral[] }) {
  const [pagina, setPagina] = useState("todas");
  const [etapa, setEtapa] = useState<LeadEtapa | "todas">("todas");
  const [busca, setBusca] = useState("");

  const paginas = useMemo(() => [...new Set(rows.map((r) => r.pagina))].sort(), [rows]);
  const daPagina = useMemo(() => rows.filter((r) => pagina === "todas" || r.pagina === pagina), [rows, pagina]);
  const pessoas = useMemo(() => agrupar(daPagina), [daPagina]);
  const q = busca.trim().toLowerCase();
  const lista = pessoas
    .filter((p) => etapa === "todas" || p.etapa === etapa)
    .filter((p) => !q || `${p.nome || ""} ${p.email || ""} ${p.telefone || ""} ${p.origem} ${p.paginas.join(" ")}`.toLowerCase().includes(q));

  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {(["todas", ...ORDEM] as const).map((e) => {
          const n = e === "todas" ? pessoas.length : pessoas.filter((p) => p.etapa === e).length;
          if (e !== "todas" && n === 0) return null;
          const ativo = etapa === e;
          return (
            <button key={e} onClick={() => setEtapa(e)}
              style={{ ...btn, borderRadius: 999, fontSize: ".85rem", background: ativo ? C.ink : "#fff", color: ativo ? "#fff" : C.ink }}>
              {e === "todas" ? "Todas as pessoas" : ETAPA[e].txt} ({n})
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <select aria-label="Página" value={pagina} onChange={(e) => setPagina(e.target.value)} style={btn}>
          <option value="todas">Todas as páginas</option>
          {paginas.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, e-mail, WhatsApp ou UTM"
          style={{ ...btn, flex: "1 1 220px", cursor: "text" }} />
        <span style={{ color: C.muted, fontSize: ".9rem" }}>{lista.length} pessoas</span>
        <button onClick={() => baixarCsv(daPagina)} style={btn} disabled={!daPagina.length}>Baixar CSV</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Nome</th>
              <th style={th}>E-mail</th>
              <th style={th}>WhatsApp</th>
              <th style={th}>Etapa</th>
              <th style={th}>Páginas</th>
              <th style={th}>Origem (UTM)</th>
              <th style={th}>Última atividade</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td style={td} colSpan={7}>Nenhum lead no filtro.</td></tr>}
            {lista.map((p) => {
              const zap = zapDe(p.telefone);
              return (
                <tr key={p.chave}>
                  <td style={td}>{p.nome || "—"}</td>
                  <td style={td}>{p.email ? <a href={`mailto:${p.email}`} style={{ color: C.ink }}>{p.email}</a> : "—"}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {zap ? <a href={zap} target="_blank" rel="noreferrer" style={{ color: C.ok, fontWeight: 700 }}>{p.telefone}</a> : p.telefone || "—"}
                  </td>
                  <td style={{ ...td, color: ETAPA[p.etapa].cor, fontWeight: 700, whiteSpace: "nowrap" }}>{ETAPA[p.etapa].txt}</td>
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
        Cada pessoa aparece uma vez, na etapa mais avançada. &quot;Criou conta&quot; é o cadastro do CCT. O CSV traz uma linha por cadastro. O CCT começou a ser salvo agora: cadastros antigos dele não aparecem aqui.
      </p>
    </div>
  );
}
