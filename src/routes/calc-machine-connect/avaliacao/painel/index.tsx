import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  listCmcAvaliacoes,
  setCmcAvaliacaoStatus,
  type AvaliacaoRow,
} from "@/lib/cmc-avaliacao-db";

// Painel interno (login por e-mail + senha) para ver as avaliações e marcar
// se já liberou +1 dia na plataforma. Acesso restrito; não indexar.

export const Route = createFileRoute("/calc-machine-connect/avaliacao/painel/")({
  head: () => ({
    meta: [
      { title: "Painel — Avaliações Calc Machine Connect" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Painel,
});

const CRED_KEY = "cmc_avaliacoes_cred";

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

function Painel() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);
  const [rows, setRows] = useState<AvaliacaoRow[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = async (em: string, se: string) => {
    setCarregando(true);
    setErro("");
    const r = await listCmcAvaliacoes(em, se);
    setCarregando(false);
    if (!r.ok) {
      setErro(
        r.status === 401 || r.status === 403 || r.status === 400
          ? "E-mail ou senha inválidos."
          : `Erro ${r.status}.`,
      );
      setLogado(false);
      try {
        localStorage.removeItem(CRED_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    setRows(r.rows);
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
          void carregar(c.email, c.senha);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marcar = async (id: string, status: AvaliacaoRow["status"]) => {
    const ok = await setCmcAvaliacaoStatus(email, senha, id, status);
    if (ok) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    else setErro("Não consegui atualizar. Recarregue e tente de novo.");
  };

  const sair = () => {
    try {
      localStorage.removeItem(CRED_KEY);
    } catch {
      /* ignore */
    }
    setLogado(false);
    setSenha("");
    setRows([]);
  };

  const fmtData = (s: string) => {
    try {
      return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return s;
    }
  };

  const pendentes = rows.filter((r) => r.status === "recebida").length;

  return (
    <div style={{ minHeight: "100vh", background: "#F3EFE6", color: "#0F1F1A", font: "16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px 64px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 4px" }}>
          Avaliações — Calc Machine Connect
        </h1>
        <p style={{ color: "#5C6B64", margin: "0 0 24px" }}>
          Painel interno. Marque <strong>&quot;Liberei +1 dia&quot;</strong> depois de conceder o dia na plataforma.
        </p>

        {!logado ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim() && senha) void carregar(email.trim(), senha);
            }}
            style={{ background: "#fff", border: "1px solid #d9d3c4", borderRadius: 14, padding: 20, maxWidth: 420 }}
          >
            <label htmlFor="em" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              E-mail
            </label>
            <input
              id="em"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              style={{ width: "100%", padding: 12, border: "1px solid #d9d3c4", borderRadius: 10, background: "#F3EFE6", color: "#0F1F1A", font: "inherit" }}
            />
            <label htmlFor="se" style={{ display: "block", fontWeight: 600, margin: "14px 0 8px" }}>
              Senha
            </label>
            <input
              id="se"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              style={{ width: "100%", padding: 12, border: "1px solid #d9d3c4", borderRadius: 10, background: "#F3EFE6", color: "#0F1F1A", font: "inherit" }}
            />
            {erro && <p style={{ color: "#c0361a", marginTop: 10 }}>{erro}</p>}
            <button
              type="submit"
              disabled={carregando}
              style={{ width: "100%", marginTop: 16, padding: 14, border: 0, borderRadius: 10, background: "#E8552B", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: carregando ? 0.6 : 1 }}
            >
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontWeight: 700 }}>{rows.length} avaliações</span>
              {pendentes > 0 && (
                <span style={{ background: "#E8552B", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: ".85rem", fontWeight: 700 }}>
                  {pendentes} pendente{pendentes > 1 ? "s" : ""}
                </span>
              )}
              <button onClick={() => void carregar(email, senha)} style={{ marginLeft: "auto", padding: "8px 14px", border: "1px solid #d9d3c4", borderRadius: 10, background: "#fff", cursor: "pointer" }}>
                Atualizar
              </button>
              <button onClick={sair} style={{ padding: "8px 14px", border: "1px solid #d9d3c4", borderRadius: 10, background: "#fff", cursor: "pointer" }}>
                Sair
              </button>
            </div>

            {erro && <p style={{ color: "#c0361a" }}>{erro}</p>}
            {rows.length === 0 && !carregando && <p style={{ color: "#5C6B64" }}>Nenhuma avaliação ainda.</p>}

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
                      onClick={() => void marcar(r.id, "liberada")}
                      disabled={r.status === "liberada"}
                      style={{ padding: "9px 14px", border: 0, borderRadius: 10, background: "#1b7a46", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: r.status === "liberada" ? 0.5 : 1 }}
                    >
                      ✓ Liberei +1 dia
                    </button>
                    {r.status !== "recebida" && (
                      <button
                        onClick={() => void marcar(r.id, "recebida")}
                        style={{ padding: "9px 14px", border: "1px solid #d9d3c4", borderRadius: 10, background: "#fff", cursor: "pointer" }}
                      >
                        Voltar p/ pendente
                      </button>
                    )}
                    <button
                      onClick={() => void marcar(r.id, "rejeitada")}
                      disabled={r.status === "rejeitada"}
                      style={{ padding: "9px 14px", border: "1px solid #c0361a", borderRadius: 10, background: "#fff", color: "#c0361a", fontWeight: 600, cursor: "pointer", opacity: r.status === "rejeitada" ? 0.5 : 1 }}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
