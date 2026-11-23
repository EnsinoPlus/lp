import type { CmcDashboard } from "@/lib/cmc-events";
import type { CreditoLead } from "@/lib/cmc-creditos";

// Aba Black Week do dashboard: funil da página /black-week (visitas → preencheu → clicou em pagar
// → pagou → liberado) e a lista de recuperação (quem deixou contato e não pagou).
// Visitas e cliques vêm dos eventos da página; leads e status vêm da tabela de créditos
// (promo "black-week"). O status "pago" é marcado pela equipe na aba Créditos depois de conferir o Asaas.

const C = {
  ink: "#0F1F1A",
  paper: "#F3EFE6",
  signal: "#E8552B",
  muted: "#5C6B64",
  line: "#d9d3c4",
  ok: "#1b7a46",
  alerta: "#b7791f",
};
const card: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  padding: 18,
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

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (a: number, b: number) =>
  b > 0 ? `${((a / b) * 100).toFixed(1).replace(".", ",")}%` : "—";
const fmtData = (s: string) => {
  try {
    return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
};

function zapDe(telefone: string | null, nome: string | null, pacote: string | null) {
  const d = (telefone || "").replace(/\D/g, "");
  if (d.length < 10) return null;
  const msg = `Olá${nome ? `, ${nome.split(" ")[0]}` : ""}! Vi que você se interessou pela Black Week da Ensino Plus (${pacote || "Connect + CCT"}). Posso te ajudar a concluir? A condição vale até segunda, 30/11.`;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}?text=${encodeURIComponent(msg)}`;
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

export function BlackWeekPainel({
  dados,
  creditos,
}: {
  dados: CmcDashboard | null;
  creditos: CreditoLead[];
}) {
  const leads = creditos.filter((l) => l.promo === "black-week" && !l.email?.endsWith(".invalid"));
  const pagina = (dados?.paginas || []).filter((p) => p.page.startsWith("/black-week"));
  const visitantes = pagina.reduce((t, p) => t + Number(p.visitantes || 0), 0);
  const pageviews = pagina.reduce((t, p) => t + Number(p.pageviews || 0), 0);
  const ev = (nome: string) => (dados?.eventos || []).find((e) => e.event === nome);
  const cliquesPagar = ev("BlackWeekCheckout");
  const cliquesZap = ev("BW_Whatsapp");

  const enviaram = leads.filter((l) => l.etapa === "enviou" || l.status !== "aguardando");
  const pagos = leads.filter((l) => l.status === "pago" || l.status === "liberado");
  const liberados = leads.filter((l) => l.status === "liberado");
  const paraLiberar = leads.filter((l) => l.status === "pago");
  const comEbook = pagos.filter((l) => /ebook/i.test(l.pacote || ""));
  const faturamento = pagos.reduce((t, l) => t + Number(l.valor || 0), 0);
  const recuperar = leads
    .filter((l) => l.status === "aguardando")
    .sort((a, b) =>
      a.etapa === b.etapa ? (a.updated_at < b.updated_at ? 1 : -1) : a.etapa === "enviou" ? -1 : 1,
    );

  const funil = [
    { nome: "Visitaram a página", v: visitantes },
    { nome: "Deixaram contato", v: leads.length },
    { nome: "Clicaram em pagar", v: enviaram.length },
    { nome: "Pagaram (marcado pela equipe)", v: pagos.length },
    { nome: "Acesso liberado", v: liberados.length },
  ];
  const base = Math.max(1, ...funil.map((f) => f.v));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}
      >
        <Kpi titulo="Visitantes" valor={String(visitantes)} sub={`${pageviews} visualizações`} />
        <Kpi
          titulo="Deixaram contato"
          valor={String(leads.length)}
          sub={`${pct(leads.length, visitantes)} dos visitantes`}
        />
        <Kpi
          titulo="Clicaram em pagar"
          valor={String(enviaram.length)}
          sub={cliquesPagar ? `${cliquesPagar.total} cliques no total` : undefined}
        />
        <Kpi
          titulo="Pagaram"
          valor={String(pagos.length)}
          sub={`${comEbook.length} com ebook · ${brl(faturamento)}`}
        />
        <Kpi
          titulo="Para liberar"
          valor={String(paraLiberar.length)}
          sub="pagos aguardando liberação"
        />
        <Kpi
          titulo="Para recuperar"
          valor={String(recuperar.length)}
          sub={
            cliquesZap
              ? `${cliquesZap.total} cliques em Tirar dúvidas`
              : "deixaram contato e não pagaram"
          }
        />
      </div>

      <div style={card}>
        <h2 style={{ fontSize: "1rem", margin: "0 0 12px" }}>Funil da Black Week</h2>
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
                    background: i >= 3 ? C.ok : C.signal,
                    width: `${Math.min(100, (f.v / base) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: C.muted, fontSize: ".78rem", margin: "10px 0 0" }}>
          O pagamento é feito no Asaas e não volta sozinho para cá: marque &quot;Pagou&quot; e
          &quot;Liberado&quot; na aba Créditos (filtro Black Week).
        </p>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: "1rem", margin: "0 0 4px" }}>Recuperação ({recuperar.length})</h2>
        <p style={{ color: C.muted, fontSize: ".85rem", margin: "0 0 10px" }}>
          Salvo automaticamente enquanto a pessoa digita na página. Primeiro quem clicou em pagar e
          não concluiu, depois quem só preencheu. O botão abre o WhatsApp com a mensagem pronta.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>E-mail</th>
                <th style={th}>WhatsApp</th>
                <th style={th}>Etapa</th>
                <th style={th}>Opção</th>
                <th style={th}>Origem</th>
                <th style={th}>Quando</th>
              </tr>
            </thead>
            <tbody>
              {recuperar.length === 0 && (
                <tr>
                  <td style={td} colSpan={7}>
                    Ninguém para recuperar no momento.
                  </td>
                </tr>
              )}
              {recuperar.map((l) => {
                const zap = zapDe(l.telefone, l.nome, l.pacote);
                return (
                  <tr key={l.id}>
                    <td style={td}>{l.nome || "—"}</td>
                    <td style={td}>
                      {l.email ? (
                        <a href={`mailto:${l.email}`} style={{ color: C.ink }}>
                          {l.email}
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
                          Chamar {l.telefone}
                        </a>
                      ) : (
                        l.telefone || "—"
                      )}
                    </td>
                    <td
                      style={{
                        ...td,
                        color: l.etapa === "enviou" ? C.signal : C.alerta,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {l.etapa === "enviou" ? "Clicou em pagar" : "Só preencheu"}
                    </td>
                    <td style={td}>
                      {l.pacote || "—"}
                      {l.valor ? ` · ${brl(Number(l.valor))}` : ""}
                    </td>
                    <td style={td}>{l.utm_source || "(direto)"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {fmtData(l.updated_at || l.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
