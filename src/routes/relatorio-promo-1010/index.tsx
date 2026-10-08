import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Loader2, Lock, RefreshCw, Users, ShoppingCart, Percent } from "lucide-react";
import { getPromo1010Stats, type FunnelRow } from "@/lib/promo1010-stats";

export const Route = createFileRoute("/relatorio-promo-1010/")({
  head: () => ({ meta: [{ title: "Funil 10 do 10 — Relatório" }] }),
  component: Dashboard,
});

const ALL = "__all__";

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

type Group = { key: string; page1: number; checkout: number };

function groupBy(rows: FunnelRow[], field: keyof FunnelRow): Group[] {
  const map = new Map<string, Group>();
  for (const r of rows) {
    const key = String(r[field]);
    const g = map.get(key) ?? { key, page1: 0, checkout: 0 };
    if (r.stage === "page1") g.page1 += r.total;
    else g.checkout += r.total;
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.page1 + b.checkout - (a.page1 + a.checkout));
}

function Dashboard() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [rows, setRows] = useState<FunnelRow[] | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "unauthorized" | "not_configured" | "error">(
    "loading",
  );
  const [fSource, setFSource] = useState(ALL);
  const [fCampaign, setFCampaign] = useState(ALL);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
    setTokenInput(t);
  }, []);

  useEffect(() => {
    let cancel = false;
    setState("loading");
    getPromo1010Stats({ data: { token: token || undefined } })
      .then((res) => {
        if (cancel) return;
        if (res.ok) {
          setRows(res.rows);
          setState("ok");
        } else {
          setState(res.reason === "unauthorized" ? "unauthorized" : res.reason === "not_configured" ? "not_configured" : "error");
        }
      })
      .catch(() => !cancel && setState("error"));
    return () => {
      cancel = true;
    };
  }, [token, reloadKey]);

  const sources = useMemo(
    () => [...new Set((rows ?? []).map((r) => r.utm_source))].sort(),
    [rows],
  );
  const campaigns = useMemo(
    () => [...new Set((rows ?? []).map((r) => r.utm_campaign))].sort(),
    [rows],
  );

  const filtered = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (fSource === ALL || r.utm_source === fSource) &&
          (fCampaign === ALL || r.utm_campaign === fCampaign),
      ),
    [rows, fSource, fCampaign],
  );

  const totalPage1 = filtered.filter((r) => r.stage === "page1").reduce((s, r) => s + r.total, 0);
  const totalCheckout = filtered
    .filter((r) => r.stage === "checkout")
    .reduce((s, r) => s + r.total, 0);
  const conv = pct(totalCheckout, totalPage1);

  const bySource = useMemo(() => groupBy(filtered, "utm_source"), [filtered]);
  const byCampaign = useMemo(() => groupBy(filtered, "utm_campaign"), [filtered]);
  const byDay = useMemo(
    () => groupBy(filtered, "dia").sort((a, b) => a.key.localeCompare(b.key)),
    [filtered],
  );

  if (state === "unauthorized") {
    return (
      <Centered>
        <Lock className="w-10 h-10 text-primary mb-4" />
        <h1 className="text-2xl font-black mb-2">Acesso restrito</h1>
        <p className="text-muted-foreground mb-5 text-center">
          Informe o token de acesso ao relatório.
        </p>
        <div className="flex gap-2 w-full max-w-sm">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Token"
            className="flex-1 h-11 rounded-lg border px-3 bg-background"
          />
          <button
            onClick={() => {
              const u = new URL(window.location.href);
              u.searchParams.set("token", tokenInput);
              window.history.replaceState({}, "", u.toString());
              setToken(tokenInput);
            }}
            className="h-11 px-4 rounded-lg bg-primary text-primary-foreground font-bold"
          >
            Entrar
          </button>
        </div>
      </Centered>
    );
  }

  if (state === "not_configured") {
    return (
      <Centered>
        <BarChart3 className="w-10 h-10 text-primary mb-4" />
        <h1 className="text-2xl font-black mb-2">Relatório não configurado</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Defina <code>SUPABASE_LEADS_URL</code> e <code>SUPABASE_LEADS_KEY</code> no Easypanel e
          reinicie o serviço.
        </p>
      </Centered>
    );
  }

  if (state === "loading") {
    return (
      <Centered>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Centered>
    );
  }

  if (state === "error") {
    return (
      <Centered>
        <p className="text-red-600 font-bold">Erro ao carregar o relatório.</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-4 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Tentar de novo
        </button>
      </Centered>
    );
  }

  const hasData = (rows ?? []).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Ensino Plus</p>
            <h1 className="text-2xl md:text-3xl font-black">Funil 10 do 10</h1>
          </div>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="h-10 px-4 rounded-lg border font-semibold inline-flex items-center gap-2 hover:bg-secondary"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <Filter label="Origem (utm_source)" value={fSource} onChange={setFSource} options={sources} />
          <Filter label="Campanha (utm_campaign)" value={fCampaign} onChange={setFCampaign} options={campaigns} />
        </div>

        {!hasData && (
          <div className="rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">
            Ainda não há leads registrados. Assim que alguém se cadastrar, os números aparecem aqui.
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={Users} label="Leads página 1" value={totalPage1} tone="default" />
          <Kpi icon={ShoppingCart} label="Foram ao checkout" value={totalCheckout} tone="accent" />
          <Kpi icon={Percent} label="Conversão p/ checkout" value={`${conv}%`} tone="success" />
          <Kpi icon={BarChart3} label="Total de cadastros" value={totalPage1 + totalCheckout} tone="default" />
        </div>

        {/* Funil */}
        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-black text-lg mb-4">Funil</h2>
          <FunnelBar label="Página 1 (lista de espera)" value={totalPage1} max={Math.max(totalPage1, 1)} />
          <FunnelBar label="Checkout" value={totalCheckout} max={Math.max(totalPage1, 1)} accent />
          <p className="text-sm text-muted-foreground mt-3">
            {totalCheckout} de {totalPage1} leads da página 1 avançaram ao checkout ({conv}%).
          </p>
        </section>

        {/* Breakdown por origem e campanha */}
        <div className="grid lg:grid-cols-2 gap-6">
          <BreakdownTable title="Por origem (utm_source)" groups={bySource} />
          <BreakdownTable title="Por campanha (utm_campaign)" groups={byCampaign} />
        </div>

        {/* Série por dia */}
        {byDay.length > 0 && (
          <section className="bg-card border rounded-xl p-6">
            <h2 className="font-black text-lg mb-4">Cadastros por dia</h2>
            <div className="space-y-2">
              {byDay.map((d) => {
                const total = d.page1 + d.checkout;
                const max = Math.max(...byDay.map((x) => x.page1 + x.checkout), 1);
                return (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="w-24 text-sm tabular-nums text-muted-foreground">{d.key}</span>
                    <div className="flex-1 bg-secondary rounded h-6 overflow-hidden flex">
                      <div
                        className="bg-primary/70 h-full"
                        style={{ width: `${pct(d.page1, max)}%` }}
                        title={`Página 1: ${d.page1}`}
                      />
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${pct(d.checkout, max)}%` }}
                        title={`Checkout: ${d.checkout}`}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-bold tabular-nums">{total}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-sm bg-primary/70 inline-block" /> Página 1</span>
              <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Checkout</span>
            </div>
          </section>
        )}

        <p className="text-xs text-muted-foreground text-center pt-4">
          Dados: Supabase · view <code>promo1010_funnel</code> (agregados, sem dados pessoais).
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
  icon: typeof Users;
  label: string;
  value: string | number;
  tone: "default" | "accent" | "success";
}) {
  const toneClass =
    tone === "accent"
      ? "text-primary"
      : tone === "success"
        ? "text-green-600"
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

function FunnelBar({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number;
  max: number;
  accent?: boolean;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{value}</span>
      </div>
      <div className="bg-secondary rounded-lg h-8 overflow-hidden">
        <div
          className={`h-full ${accent ? "bg-green-500" : "bg-primary"}`}
          style={{ width: `${pct(value, max)}%`, minWidth: value > 0 ? "2%" : "0" }}
        />
      </div>
    </div>
  );
}

function BreakdownTable({ title, groups }: { title: string; groups: Group[] }) {
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
                <th className="py-2 px-2 font-semibold text-right">Página 1</th>
                <th className="py-2 px-2 font-semibold text-right">Checkout</th>
                <th className="py-2 pl-2 font-semibold text-right">Conv.</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.key} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium truncate max-w-[180px]">{g.key}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{g.page1}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{g.checkout}</td>
                  <td className="py-2 pl-2 text-right tabular-nums font-bold">
                    {pct(g.checkout, g.page1)}%
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
