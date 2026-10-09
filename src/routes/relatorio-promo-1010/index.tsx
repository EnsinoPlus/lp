import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  Loader2,
  Lock,
  Moon,
  RefreshCw,
  ShoppingCart,
  UserCheck,
} from "lucide-react";
import {
  fetchPromo1010Acessos,
  fetchPromo1010Funnel,
  fetchPromo1010Leads,
  type AcessoRow,
  type FunnelRow,
  type LeadRow,
  type LeadStage,
} from "@/lib/promo1010-supabase";

const STAGES: { key: LeadStage; label: string; accent: boolean }[] = [
  { key: "page1", label: "Página 1 — Lista de interesse", accent: false },
  { key: "checkout", label: "Checkout (10/10)", accent: true },
  { key: "ressaca", label: "Ressaca (11/10)", accent: true },
];

export const Route = createFileRoute("/relatorio-promo-1010/")({
  head: () => ({ meta: [{ title: "Funil 10 do 10 — Relatório" }] }),
  component: Dashboard,
});

const ALL = "__all__";
const REFRESH_MS = 30_000;

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

type StageTotals = { acessos: number; parciais: number; completos: number };

function emptyTotals(): StageTotals {
  return { acessos: 0, parciais: 0, completos: 0 };
}

function Dashboard() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [funnel, setFunnel] = useState<FunnelRow[] | null>(null);
  const [acessos, setAcessos] = useState<AcessoRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [leadsAuth, setLeadsAuth] = useState<"none" | "ok" | "denied">("none");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [fSource, setFSource] = useState(ALL);
  const [fCampaign, setFCampaign] = useState(ALL);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
    setTokenInput(t);
  }, []);

  const load = useCallback(async () => {
    try {
      const [f, a] = await Promise.all([fetchPromo1010Funnel(), fetchPromo1010Acessos()]);
      setFunnel(f);
      setAcessos(a);
      setState("ok");
      setUpdatedAt(new Date());
    } catch {
      setState("error");
    }
    if (token) {
      const res = await fetchPromo1010Leads(token);
      if (res.ok) {
        setLeads(res.leads);
        setLeadsAuth("ok");
      } else {
        setLeads(null);
        setLeadsAuth("denied");
      }
    } else {
      setLeadsAuth("none");
    }
  }, [token]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const sources = useMemo(() => {
    const s = new Set<string>();
    (funnel ?? []).forEach((r) => s.add(r.utm_source));
    acessos.forEach((r) => s.add(r.utm_source));
    return [...s].sort();
  }, [funnel, acessos]);
  const campaigns = useMemo(() => {
    const s = new Set<string>();
    (funnel ?? []).forEach((r) => s.add(r.utm_campaign));
    acessos.forEach((r) => s.add(r.utm_campaign));
    return [...s].sort();
  }, [funnel, acessos]);

  const matchFilter = useCallback(
    (utmSource: string, utmCampaign: string) =>
      (fSource === ALL || utmSource === fSource) &&
      (fCampaign === ALL || utmCampaign === fCampaign),
    [fSource, fCampaign],
  );

  const fFunnel = useMemo(
    () => (funnel ?? []).filter((r) => matchFilter(r.utm_source, r.utm_campaign)),
    [funnel, matchFilter],
  );
  const fAcessos = useMemo(
    () => acessos.filter((r) => matchFilter(r.utm_source, r.utm_campaign)),
    [acessos, matchFilter],
  );

  const stage = useCallback(
    (s: "page1" | "checkout"): StageTotals => {
      const t = emptyTotals();
      t.acessos = fAcessos.filter((r) => r.stage === s).reduce((a, r) => a + r.acessos, 0);
      for (const r of fFunnel) {
        if (r.stage !== s) continue;
        if (r.status === "completo") t.completos += r.total;
        else t.parciais += r.total;
      }
      return t;
    },
    [fAcessos, fFunnel],
  );

  const totals = useMemo(
    () => ({
      page1: stage("page1"),
      checkout: stage("checkout"),
      ressaca: stage("ressaca"),
    }),
    [stage],
  );
  const totalAcessos = totals.page1.acessos + totals.checkout.acessos + totals.ressaca.acessos;

  // Quebra por utm (apenas completos, todas as etapas)
  const byUtm = useCallback(
    (field: "utm_source" | "utm_campaign") => {
      const map = new Map<string, number>();
      for (const r of fFunnel) {
        if (r.status !== "completo") continue;
        map.set(r[field], (map.get(r[field]) ?? 0) + r.total);
      }
      return [...map.entries()]
        .map(([key, total]) => ({ key, total }))
        .sort((a, b) => b.total - a.total);
    },
    [fFunnel],
  );
  const bySource = useMemo(() => byUtm("utm_source"), [byUtm]);
  const byCampaign = useMemo(() => byUtm("utm_campaign"), [byUtm]);

  const filteredLeads = useMemo(
    () =>
      (leads ?? []).filter((l) =>
        matchFilter(l.utm_source ?? "(direto)", l.utm_campaign ?? "(nenhuma)"),
      ),
    [leads, matchFilter],
  );

  if (state === "loading" && !funnel) {
    return (
      <Centered>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Centered>
    );
  }
  if (state === "error" && !funnel) {
    return (
      <Centered>
        <p className="text-red-600 font-bold">Erro ao carregar o relatório.</p>
        <button
          onClick={() => void load()}
          className="mt-4 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Tentar de novo
        </button>
      </Centered>
    );
  }

  const totalCompletos = totals.page1.completos + totals.checkout.completos + totals.ressaca.completos;
  const totalParciais = totals.page1.parciais + totals.checkout.parciais + totals.ressaca.parciais;
  const hasData = totalAcessos + totalCompletos + totalParciais > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Ensino Plus</p>
            <h1 className="text-2xl font-black">Funil 10 do 10</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {updatedAt && (
              <span className="tabular-nums">atualizado {updatedAt.toLocaleTimeString("pt-BR")}</span>
            )}
            <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> ao vivo
            </span>
            <button
              onClick={() => void load()}
              className="h-9 px-3 rounded-lg border font-semibold inline-flex items-center gap-2 hover:bg-secondary"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex gap-3 flex-wrap">
          <Filter label="Origem (utm_source)" value={fSource} onChange={setFSource} options={sources} />
          <Filter label="Campanha (utm_campaign)" value={fCampaign} onChange={setFCampaign} options={campaigns} />
        </div>

        {!hasData && (
          <div className="rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">
            Ainda não há dados. Assim que alguém acessar ou se cadastrar, os números aparecem aqui
            (atualiza sozinho a cada 30s).
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Kpi icon={Eye} label="Acessos" value={totalAcessos} tone="default" />
          <Kpi icon={UserCheck} label="Completos — lista" value={totals.page1.completos} tone="accent" />
          <Kpi icon={ShoppingCart} label="Completos — checkout" value={totals.checkout.completos} tone="success" />
          <Kpi icon={Moon} label="Completos — ressaca" value={totals.ressaca.completos} tone="warn" />
          <Kpi icon={BarChart3} label="Parciais (todas)" value={totalParciais} tone="warn" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {STAGES.map((s) => (
            <FunnelCard key={s.key} title={s.label} t={totals[s.key]} accent={s.accent} />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <BreakdownTable title="Completos por origem (utm_source)" groups={bySource} />
          <BreakdownTable title="Completos por campanha (utm_campaign)" groups={byCampaign} />
        </div>

        {leadsAuth === "ok" ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {STAGES.map((s) => (
              <LeadList
                key={s.key}
                title={s.label}
                leads={filteredLeads.filter((l) => l.stage === s.key)}
                accent={s.accent}
              />
            ))}
          </div>
        ) : (
          <section className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-black text-lg">Lista de leads (nome, e-mail, WhatsApp)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {leadsAuth === "denied"
                ? "Token inválido. Informe o token correto para ver os leads individuais."
                : "Informe o token de acesso para ver os leads individuais."}
            </p>
            <div className="flex gap-2 max-w-sm">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Token"
                className="flex-1 h-10 rounded-lg border px-3 bg-background"
              />
              <button
                onClick={() => {
                  const u = new URL(window.location.href);
                  u.searchParams.set("token", tokenInput);
                  window.history.replaceState({}, "", u.toString());
                  setToken(tokenInput);
                }}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold"
              >
                Ver leads
              </button>
            </div>
          </section>
        )}

        <p className="text-xs text-muted-foreground text-center pt-4">
          Parcial = deixou e-mail/WhatsApp sem finalizar. Completo = enviou o cadastro. Dados:
          Supabase (sistema-b7), atualiza a cada 30s.
        </p>
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {children}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="text-sm">
      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border px-3 bg-background min-w-[180px]"
      >
        <option value={ALL}>Todas</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  tone: "default" | "accent" | "success" | "warn";
}) {
  const toneClass =
    tone === "accent"
      ? "text-primary"
      : tone === "success"
        ? "text-green-600"
        : tone === "warn"
          ? "text-amber-600"
          : "text-foreground";
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-3xl md:text-4xl font-black tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function FunnelCard({
  title,
  t,
  accent,
}: {
  title: string;
  t: StageTotals;
  accent?: boolean;
}) {
  const max = Math.max(t.acessos, t.parciais, t.completos, 1);
  const convCompleto = pct(t.completos, t.acessos);
  return (
    <section className="bg-card border rounded-xl p-6">
      <h2 className="font-black text-lg mb-4">{title}</h2>
      <Bar label="Acessos" value={t.acessos} max={max} color="bg-slate-400" />
      <Bar label="Cadastros parciais" value={t.parciais} max={max} color="bg-amber-500" />
      <Bar label="Cadastros completos" value={t.completos} max={max} color={accent ? "bg-green-500" : "bg-primary"} />
      <p className="text-sm text-muted-foreground mt-3">
        {t.completos} completos de {t.acessos} acessos ({convCompleto}% de conversão).
      </p>
    </section>
  );
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{value}</span>
      </div>
      <div className="bg-secondary rounded-lg h-7 overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${pct(value, max)}%`, minWidth: value > 0 ? "2%" : "0" }}
        />
      </div>
    </div>
  );
}

function BreakdownTable({
  title,
  groups,
}: {
  title: string;
  groups: Array<{ key: string; total: number }>;
}) {
  return (
    <section className="bg-card border rounded-xl p-6">
      <h2 className="font-black text-lg mb-4">{title}</h2>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem dados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-2 font-semibold">Valor</th>
                <th className="py-2 pl-2 font-semibold text-right">Completos</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.key} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium truncate max-w-[220px]">{g.key}</td>
                  <td className="py-2 pl-2 text-right tabular-nums font-bold">{g.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LeadList({ title, leads, accent }: { title: string; leads: LeadRow[]; accent?: boolean }) {
  return (
    <section className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-lg">{title}</h2>
        <span
          className={`text-sm font-black tabular-nums px-2.5 py-0.5 rounded-full ${
            accent ? "bg-green-500/15 text-green-600" : "bg-primary/15 text-primary"
          }`}
        >
          {leads.length}
        </span>
      </div>
      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-2 font-semibold">Nome</th>
                <th className="py-2 px-2 font-semibold">E-mail</th>
                <th className="py-2 px-2 font-semibold">WhatsApp</th>
                <th className="py-2 pl-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b last:border-0 align-top">
                  <td className="py-2 pr-2 font-medium">{l.name || "—"}</td>
                  <td className="py-2 px-2 break-all">{l.email || "—"}</td>
                  <td className="py-2 px-2 tabular-nums whitespace-nowrap">{l.phone || "—"}</td>
                  <td className="py-2 pl-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        l.status === "completo"
                          ? "bg-green-500/15 text-green-600"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
