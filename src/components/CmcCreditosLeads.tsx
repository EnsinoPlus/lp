import { useMemo, useState } from "react";
import {
  addCredito,
  listCreditos,
  updateCredito,
  type CreditoLead,
  type CreditoNovo,
  type CreditoStatus,
} from "@/lib/cmc-creditos";

// Aba Créditos do dashboard: a equipe confere o pagamento e registra a liberação.
// O crédito é liberado na plataforma; estes botões só registram o que foi feito.

const C = { ink: "#0F1F1A", paper: "#F3EFE6", signal: "#E8552B", muted: "#5C6B64", line: "#d9d3c4", ok: "#1b7a46", erro: "#c0361a", alerta: "#b7791f" };

const STATUS: Record<CreditoStatus, { txt: string; cor: string }> = {
  pago: { txt: "Pagou: liberar créditos", cor: C.signal },
  aguardando: { txt: "Aguardando pagamento", cor: C.alerta },
  liberado: { txt: "Créditos liberados", cor: C.ok },
  nao_pagou: { txt: "Não pagou", cor: C.muted },
};
const ORDEM: CreditoStatus[] = ["pago", "aguardando", "liberado", "nao_pagou"];

const PACOTES: { id: string; txt: string; promo: CreditoLead["promo"]; creditos: number | null; valor: number | null }[] = [
  { id: "Primeira Recarga", txt: "Primeira Recarga (R$ 29)", promo: "primeira-recarga", creditos: null, valor: 29 },
  { id: "350 créditos", txt: "11.11: 350 créditos (R$ 97)", promo: "11-11", creditos: 350, valor: 97 },
  { id: "850 créditos", txt: "11.11: 850 créditos (R$ 197)", promo: "11-11", creditos: 850, valor: 197 },
  { id: "1.300 créditos", txt: "11.11: 1.300 créditos (R$ 297)", promo: "11-11", creditos: 1300, valor: 297 },
];
const ORIGENS = ["Grupo de WhatsApp", "Link da bio", "Story", "E-mail", "Outro"];

const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 };
const btn: React.CSSProperties = { padding: "8px 14px", border: `1px solid ${C.line}`, borderRadius: 10, background: "#fff", cursor: "pointer", font: "inherit", color: C.ink };
const campo: React.CSSProperties = { width: "100%", padding: 10, border: `1px solid ${C.line}`, borderRadius: 10, background: C.paper, color: C.ink, font: "inherit" };
const rotulo: React.CSSProperties = { display: "block", fontWeight: 600, fontSize: ".85rem", marginBottom: 4 };

const fmtData = (s: string | null) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
};
const brl = (v: number | null) => (v == null ? null : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const chaves = (l: CreditoLead) => [l.email, l.telefone].filter(Boolean) as string[];

function zapDe(telefone: string | null) {
  const d = (telefone || "").replace(/\D/g, "");
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`;
}

function baixarCsv(rows: CreditoLead[]) {
  const cab = ["cadastro", "status", "etapa", "promocao", "pacote", "creditos", "valor", "nome", "email", "whatsapp", "utm_source", "utm_medium", "utm_campaign", "pago_em", "liberado_em", "notas"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = rows.map((l) =>
    [fmtData(l.created_at), STATUS[l.status].txt, l.etapa, l.promo, l.pacote, l.creditos, String(l.valor ?? "").replace(".", ","), l.nome, l.email, l.telefone, l.utm_source, l.utm_medium, l.utm_campaign,
      l.pago_em ? fmtData(l.pago_em) : "", l.liberado_em ? fmtData(l.liberado_em) : "", l.notas]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["﻿" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `creditos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const VAZIO = { pacote: PACOTES[0].id, valor: "29", nome: "", email: "", telefone: "", origem: ORIGENS[0], notas: "" };

export function CmcCreditosLeads({
  email,
  senha,
  rows,
  onRows,
}: {
  email: string;
  senha: string;
  rows: CreditoLead[];
  onRows: (r: CreditoLead[]) => void;
}) {
  const [filtro, setFiltro] = useState<CreditoStatus | "todos">("todos");
  const [promo, setPromo] = useState<CreditoLead["promo"] | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const recarregar = async () => {
    const r = await listCreditos(email, senha);
    if (r) onRows(r);
  };

  const mudar = async (id: string, m: { status?: CreditoStatus; notas?: string }) => {
    setErro("");
    if (await updateCredito(email, senha, id, m)) await recarregar();
    else setErro("Não consegui salvar. Recarregue e tente de novo.");
  };

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!form.email.trim() && form.telefone.replace(/\D/g, "").length < 10) {
      setErro("Informe o e-mail ou o WhatsApp com DDD.");
      return;
    }
    const p = PACOTES.find((x) => x.id === form.pacote) ?? PACOTES[0];
    const valor = Number(form.valor.replace(",", "."));
    const dados: CreditoNovo = {
      promo: p.promo,
      pacote: p.id,
      creditos: p.creditos,
      valor: form.valor.trim() && !Number.isNaN(valor) ? valor : null,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      origem: form.origem,
      notas: form.notas,
    };
    setSalvando(true);
    const ok = await addCredito(email, senha, dados);
    setSalvando(false);
    if (!ok) {
      setErro("Não consegui cadastrar. Tente de novo.");
      return;
    }
    setForm(VAZIO);
    setNovo(false);
    await recarregar();
  };

  // Mesmo e-mail ou WhatsApp que já recebeu créditos: evita liberar duas vezes.
  const jaLiberados = useMemo(() => {
    const s = new Set<string>();
    rows.filter((l) => l.status === "liberado").forEach((l) => chaves(l).forEach((c) => s.add(c)));
    return s;
  }, [rows]);

  const daPromo = rows.filter((l) => promo === "todas" || l.promo === promo);
  const q = busca.trim().toLowerCase();
  const lista = daPromo
    .filter((l) => filtro === "todos" || l.status === filtro)
    .filter((l) => !q || `${l.nome || ""} ${l.email || ""} ${l.telefone || ""} ${l.pacote || ""} ${l.utm_source || ""}`.toLowerCase().includes(q))
    .sort((a, b) => ORDEM.indexOf(a.status) - ORDEM.indexOf(b.status));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={card}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: "1.05rem", margin: 0, marginRight: "auto" }}>Liberação de créditos</h2>
          <button onClick={() => setNovo(!novo)} style={{ ...btn, background: C.signal, borderColor: C.signal, color: "#fff", fontWeight: 700 }}>
            {novo ? "Fechar" : "+ Cadastrar lead"}
          </button>
          <button onClick={() => baixarCsv(lista)} style={btn} disabled={!lista.length}>Baixar CSV</button>
        </div>

        {novo && (
          <form onSubmit={adicionar} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", background: C.paper, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div>
              <label htmlFor="cr-pacote" style={rotulo}>Oferta</label>
              <select id="cr-pacote" value={form.pacote} style={{ ...campo, background: "#fff" }}
                onChange={(e) => {
                  const p = PACOTES.find((x) => x.id === e.target.value);
                  setForm({ ...form, pacote: e.target.value, valor: p?.valor != null ? String(p.valor) : "" });
                }}>
                {PACOTES.map((p) => <option key={p.id} value={p.id}>{p.txt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cr-valor" style={rotulo}>Valor (R$)</label>
              <input id="cr-valor" inputMode="decimal" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} style={{ ...campo, background: "#fff" }} />
            </div>
            <div>
              <label htmlFor="cr-nome" style={rotulo}>Nome</label>
              <input id="cr-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={{ ...campo, background: "#fff" }} />
            </div>
            <div>
              <label htmlFor="cr-tel" style={rotulo}>WhatsApp</label>
              <input id="cr-tel" type="tel" placeholder="(85) 99999-9999" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} style={{ ...campo, background: "#fff" }} />
            </div>
            <div>
              <label htmlFor="cr-email" style={rotulo}>E-mail da conta</label>
              <input id="cr-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...campo, background: "#fff" }} />
            </div>
            <div>
              <label htmlFor="cr-origem" style={rotulo}>Origem</label>
              <select id="cr-origem" value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} style={{ ...campo, background: "#fff" }}>
                {ORIGENS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="cr-notas" style={rotulo}>Notas</label>
              <input id="cr-notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ ...campo, background: "#fff" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={salvando} style={{ ...btn, background: C.ink, color: "#fff", fontWeight: 700 }}>
                {salvando ? "Salvando…" : "Salvar lead"}
              </button>
            </div>
          </form>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {(["todos", ...ORDEM] as const).map((s) => {
            const n = s === "todos" ? daPromo.length : daPromo.filter((l) => l.status === s).length;
            const ativo = filtro === s;
            return (
              <button key={s} onClick={() => setFiltro(s)}
                style={{ ...btn, borderRadius: 999, fontSize: ".85rem", background: ativo ? C.ink : "#fff", color: ativo ? "#fff" : C.ink }}>
                {s === "todos" ? "Todos" : STATUS[s].txt} ({n})
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select aria-label="Promoção" value={promo} onChange={(e) => setPromo(e.target.value as typeof promo)} style={btn}>
            <option value="todas">Todas as promoções</option>
            <option value="primeira-recarga">Primeira Recarga</option>
            <option value="11-11">11.11 Mais Créditos</option>
          </select>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, e-mail, WhatsApp ou origem"
            style={{ ...btn, flex: "1 1 220px", cursor: "text" }} />
        </div>
        {erro && <p role="alert" style={{ color: C.erro, margin: "10px 0 0" }}>{erro}</p>}
        <p style={{ color: C.muted, fontSize: ".8rem", margin: "10px 0 0" }}>
          Confira o pagamento no Asaas antes de marcar. Os botões só registram: o crédito é liberado por vocês na plataforma.
        </p>
      </div>

      {lista.length === 0 && <p style={{ color: C.muted, margin: 0 }}>Nenhum lead neste filtro.</p>}

      {lista.map((l) => {
        const zap = zapDe(l.telefone);
        const repetido = l.status !== "liberado" && chaves(l).some((c) => jaLiberados.has(c));
        return (
          <div key={l.id} style={{ ...card, padding: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
              <strong style={{ marginRight: "auto" }}>{l.nome || l.email || l.telefone}</strong>
              {l.etapa === "preencheu" && l.status === "aguardando" && (
                <span style={{ fontSize: ".75rem", border: `1px solid ${C.line}`, borderRadius: 999, padding: "1px 8px" }}>Só preencheu, não enviou</span>
              )}
              {l.etapa === "enviou" && l.status === "aguardando" && (
                <span style={{ fontSize: ".75rem", border: `1px solid ${C.line}`, borderRadius: 999, padding: "1px 8px" }}>Enviou pela página</span>
              )}
              <span style={{ color: STATUS[l.status].cor, fontWeight: 700, fontSize: ".85rem" }}>{STATUS[l.status].txt}</span>
            </div>
            <div style={{ color: C.muted, fontSize: ".85rem", marginTop: 2 }}>
              {l.pacote || l.promo}{brl(l.valor) ? ` · ${brl(l.valor)}` : ""}
              {l.utm_source ? ` · ${l.utm_source}` : ""}{l.utm_medium ? ` / ${l.utm_medium}` : ""}{l.utm_campaign ? ` / ${l.utm_campaign}` : ""} · cadastrado {fmtData(l.created_at)}
              {l.liberado_em ? ` · liberado ${fmtData(l.liberado_em)}` : l.pago_em ? ` · pagamento confirmado ${fmtData(l.pago_em)}` : ""}
            </div>
            <div style={{ fontSize: ".9rem", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {l.email && <a href={`mailto:${l.email}`} style={{ color: C.ink }}>{l.email}</a>}
              {l.telefone && (zap
                ? <a href={zap} target="_blank" rel="noreferrer" style={{ color: C.ok, fontWeight: 700 }}>{l.telefone}</a>
                : <span>{l.telefone}</span>)}
            </div>
            {repetido && (
              <p style={{ color: C.erro, fontSize: ".85rem", fontWeight: 700, margin: "6px 0 0" }}>
                Atenção: este contato já recebeu créditos em outro cadastro.
              </p>
            )}
            <input aria-label="Notas" defaultValue={l.notas || ""} placeholder="Notas (ex.: comprovante, quem liberou)"
              onBlur={(e) => {
                if (e.target.value !== (l.notas || "")) void mudar(l.id, { notas: e.target.value });
              }}
              style={{ ...campo, marginTop: 8, fontSize: ".85rem", padding: 8 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {l.status !== "pago" && l.status !== "liberado" && (
                <button onClick={() => void mudar(l.id, { status: "pago" })} style={{ ...btn, background: C.signal, borderColor: C.signal, color: "#fff", fontWeight: 700 }}>
                  Confirmei o pagamento
                </button>
              )}
              {l.status === "pago" && (
                <button onClick={() => void mudar(l.id, { status: "liberado" })} style={{ ...btn, background: C.ok, borderColor: C.ok, color: "#fff", fontWeight: 700 }}>
                  ✓ Liberei os créditos
                </button>
              )}
              {l.status !== "nao_pagou" && l.status !== "liberado" && (
                <button onClick={() => void mudar(l.id, { status: "nao_pagou" })} style={btn}>Não pagou</button>
              )}
              {l.status !== "aguardando" && (
                <button onClick={() => void mudar(l.id, { status: "aguardando" })} style={btn}>Voltar para aguardando</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
