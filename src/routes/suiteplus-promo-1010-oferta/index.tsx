import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import catalogoCover from "@/assets/catalogo-capa-pjecalc-vicelmo.png";
import { CountdownTimer, PROMO_1010_END } from "@/components/CountdownTimer";
import { Promo1010Form } from "@/components/Promo1010Form";
import { getCreditsCheckoutUrl } from "@/lib/runtime-config";
import { trackPromo1010Visit } from "@/lib/promo1010-supabase";
import {
  AlarmClock,
  BadgeCheck,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck,
  Flame,
  Scale,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/suiteplus-promo-1010-oferta/")({
  head: () => ({
    meta: [
      {
        title: "É HOJE — 10 do 10 | 400 créditos + e-book por R$ 200 | Ensino Plus",
      },
      {
        name: "description",
        content:
          "A oferta 10 do 10 está no ar por 24 horas: 400 créditos PlusCoin + e-book do PJe-Calc por R$ 200. Garanta antes que o tempo acabe.",
      },
      { property: "og:title", content: "É HOJE — 10 do 10 | 400 créditos + e-book" },
      {
        property: "og:description",
        content: "400 créditos + e-book do PJe-Calc por R$ 200,00. Só nas próximas 24 horas.",
      },
    ],
  }),
  loader: async () => ({
    checkoutUrl: await getCreditsCheckoutUrl(),
  }),
  component: Landing,
});

const BENEFITS = [
  { icon: Coins, title: "400 créditos PlusCoin", desc: "Para usar em todas as ferramentas da Suite." },
  { icon: BookOpen, title: "E-book do PJe-Calc", desc: "Cálculos Trabalhistas Aplicados, edição 2026." },
  { icon: BadgeCheck, title: "Acesso imediato", desc: "Créditos liberados na plataforma após o pagamento." },
];

const EBOOK_TOPICS = [
  { icon: Calculator, title: "Sistema PJe-Calc", desc: "Parametrização, férias, faltas e verbas proporcionais." },
  { icon: Clock, title: "Jornada e horas extras", desc: "Hora sexagesimal/centesimal, adicional noturno e DSR." },
  { icon: Scale, title: "Atualização monetária", desc: "Lei 14.905/2024, juros de mora e Fazenda Pública." },
  { icon: FileCheck, title: "Liquidação e impugnação", desc: "Limites da sentença e o art. 884 da CLT." },
];

function Landing() {
  const { checkoutUrl } = Route.useLoaderData();
  useEffect(() => {
    void trackPromo1010Visit("checkout");
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de topo vermelha: últimas 24h */}
      <div className="bg-red-600 text-white py-2.5 px-4 text-center text-sm font-bold">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="uppercase tracking-wider">A oferta acaba em:</span>
          <CountdownTimer
            target={PROMO_1010_END}
            variant="bar"
            showDays={false}
            doneLabel="ENCERRADA"
          />
        </div>
      </div>

      {/* HERO — tema urgência (vermelho/âmbar), layout diferente da V1 */}
      <section className="relative overflow-hidden bg-[oklch(0.17_0.03_28)] text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, oklch(0.7 0.19 28 / 0.55), transparent 45%), radial-gradient(circle at 10% 90%, oklch(0.82 0.16 85 / 0.4), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-10 md:py-16 relative">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
            {/* Oferta */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-200 border border-red-400/50 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4">
                <AlarmClock className="w-4 h-4" /> É hoje · Últimas 24 horas
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-[1.03] mb-4">
                A oferta <span className="text-red-400">10 do 10</span> está no ar
              </h1>
              <p className="text-lg md:text-xl text-white/75 mb-6">
                <span className="font-black text-white">400 créditos</span> PlusCoin + o e-book do
                Prof. Vicelmo por <span className="font-black text-amber-300">R$ 200</span>. Depois
                que o relógio zerar, acabou.
              </p>

              <div className="rounded-2xl bg-black/30 border border-white/10 p-5 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
                  Tempo restante da oferta
                </p>
                <CountdownTimer
                  target={PROMO_1010_END}
                  showDays={false}
                  className="justify-center lg:justify-start"
                  doneLabel="Oferta encerrada"
                />
              </div>

              <ul className="space-y-3 text-left max-w-md mx-auto lg:mx-0">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                    <div>
                      <p className="font-bold leading-tight">{b.title}</p>
                      <p className="text-sm text-white/60">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formulário libera checkout */}
            <div className="bg-white/5 border-2 border-red-400/40 rounded-2xl p-6 md:p-8 shadow-card">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Sparkles className="w-3 h-3" /> Oferta liberada por R$ 200
                </div>
                <p className="text-5xl md:text-6xl font-black text-white">400</p>
                <p className="text-sm font-bold uppercase tracking-wider text-white/70">
                  créditos + e-book
                </p>
                <h2 className="text-lg md:text-xl font-black text-white mt-3">
                  Informe seus dados para liberar o checkout
                </h2>
              </div>
              <Promo1010Form mode="checkout" checkoutUrl={checkoutUrl} cta="Liberar e comprar créditos" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark text-dark-foreground py-10 border-y-4 border-red-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "400", l: "Créditos PlusCoin" },
              { n: "R$ 200", l: "Pacote completo" },
              { n: "E-book", l: "Bônus do PJe-Calc" },
              { n: "24h", l: "Só hoje, 10/10" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl md:text-5xl font-black text-red-400">{s.n}</div>
                <div className="text-sm text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* E-book */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-center bg-card border-2 border-border rounded-2xl p-6 md:p-10">
            <img
              src={catalogoCover}
              alt="Capa do e-book Cálculos Trabalhistas Aplicados ao PJe-Calc, edição 2026"
              className="w-40 md:w-full mx-auto drop-shadow-2xl"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-red-500 mb-3">
                Bônus incluso · Prof. Vicelmo Alencar
              </p>
              <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                Cálculos Trabalhistas Aplicados ao PJe-Calc
              </h3>
              <ul className="grid sm:grid-cols-2 gap-4">
                {EBOOK_TOPICS.map((topic) => (
                  <li key={topic.title} className="flex gap-3">
                    <topic.icon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">{topic.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{topic.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 md:py-20 bg-[oklch(0.17_0.03_28)] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 40%, oklch(0.7 0.19 28 / 0.45), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative text-center max-w-xl">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-red-200 bg-red-500/20 rounded-full px-4 py-1 mb-5">
            <AlarmClock className="w-4 h-4" /> O relógio não para
          </p>
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            Garanta antes de zerar
          </h2>
          <div className="mb-8">
            <CountdownTimer target={PROMO_1010_END} showDays={false} doneLabel="Oferta encerrada" />
          </div>
          <div className="bg-white/5 border-2 border-red-400/40 rounded-2xl p-6 md:p-8 shadow-card text-left">
            <Promo1010Form
              mode="checkout"
              checkoutUrl={checkoutUrl}
              cta="Liberar e comprar créditos"
            />
          </div>
          <p className="mt-6 text-sm text-white/50">
            <Link to="/suiteplus-promo-1010/" className="underline hover:text-white">
              Ainda não abriu para você? Entre na lista de espera
            </Link>
          </p>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · SuitePlus PlusCoin. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
