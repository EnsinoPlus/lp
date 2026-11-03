import type { AvaliacaoRow } from "@/lib/cmc-avaliacao-db";

// Lista de avaliações do Calc Machine Connect com as ações da equipe
// (usada no painel de avaliações e no dashboard).

const STATUS_COR: Record<AvaliacaoRow["status"], string> = {
  recebida: "#5C6B64",
  liberada: "#1b7a46",
  rejeitada: "#c0361a",
};

function Estrelas({ n }: { n: number }) {
  return (
    <span style={{ color: "#E8552B", letterSpacing: 1 }} aria-label={`${n} de 5`}>
      {"★".repeat(n)}
      <span style={{ color: "#d9d3c4" }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

const fmtData = (s: string) => {
  try {
    return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
};

export function CmcAvaliacoesLista({
  rows,
  onMarcar,
}: {
  rows: AvaliacaoRow[];
  onMarcar: (id: string, status: AvaliacaoRow["status"]) => void;
}) {
  if (rows.length === 0) return <p style={{ color: "#5C6B64" }}>Nenhuma avaliação ainda.</p>;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {rows.map((r) => (
        <div key={r.id} style={{ background: "#fff", border: "1px solid #d9d3c4", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Estrelas n={r.nota} />
            <span style={{ color: STATUS_COR[r.status], fontWeight: 700, textTransform: "uppercase", fontSize: ".8rem" }}>
              {r.status}
            </span>
          </div>
          <p style={{ margin: "10px 0", whiteSpace: "pre-wrap" }}>{r.depoimento}</p>
          <p style={{ color: "#5C6B64", fontSize: ".9rem", margin: 0 }}>
            <strong>{r.nome || "—"}</strong> · {r.email || "sem e-mail"} · {fmtData(r.created_at)}
            {r.utm_source ? ` · ${r.utm_source}` : ""}
          </p>

          {r.media_url && (
            <div style={{ marginTop: 10 }}>
              {r.media_tipo === "video" ? (
                <video src={r.media_url} controls style={{ maxWidth: "100%", borderRadius: 10, maxHeight: 320 }} />
              ) : (
                <a href={r.media_url} target="_blank" rel="noopener">
                  <img src={r.media_url} alt="mídia da avaliação" style={{ maxWidth: "100%", borderRadius: 10, maxHeight: 320 }} />
                </a>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => onMarcar(r.id, "liberada")}
              disabled={r.status === "liberada"}
              style={{ padding: "9px 14px", border: 0, borderRadius: 10, background: "#1b7a46", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: r.status === "liberada" ? 0.5 : 1 }}
            >
              ✓ Liberei +1 dia
            </button>
            {r.status !== "recebida" && (
              <button
                onClick={() => onMarcar(r.id, "recebida")}
                style={{ padding: "9px 14px", border: "1px solid #d9d3c4", borderRadius: 10, background: "#fff", cursor: "pointer" }}
              >
                Voltar p/ pendente
              </button>
            )}
            <button
              onClick={() => onMarcar(r.id, "rejeitada")}
              disabled={r.status === "rejeitada"}
              style={{ padding: "9px 14px", border: "1px solid #c0361a", borderRadius: 10, background: "#fff", color: "#c0361a", fontWeight: 600, cursor: "pointer", opacity: r.status === "rejeitada" ? 0.5 : 1 }}
            >
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
