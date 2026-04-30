import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, ShieldCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-2026/obrigado-analise-credito")({
  head: () => ({
    meta: [
      { title: "Compra em análise de crédito — Pje-Calc 2026" },
      {
        name: "description",
        content: "Recebemos seu pedido e o pagamento está em análise de crédito. Você será avisado por e-mail em até 24 horas.",
      },
    ],
  }),
  component: ObrigadoAnaliseCreditoPage,
});

function ObrigadoAnaliseCreditoPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-gradient-hero text-dark-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, oklch(0.7 0.19 38 / 0.4), transparent 60%)" }} />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6 shadow-glow">
            <Clock3 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">Compra em análise de crédito</h1>
          <p className="text-lg md:text-xl text-white/85">
            Recebemos seu pedido com sucesso. Seu pagamento está em análise e pode levar até <strong>24 horas</strong>.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 mt-0.5 text-success" />
            <p className="text-sm md:text-base text-foreground/90">
              Assim que a análise for concluída e aprovada, você receberá o acesso automaticamente no e-mail informado na compra.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 mt-0.5 text-primary" />
            <p className="text-sm md:text-base text-foreground/90">
              Confira também a caixa de spam/promocional para garantir que você receba os próximos avisos.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

