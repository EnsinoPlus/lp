import { createFileRoute, Link } from "@tanstack/react-router";
import { ReceiptText, Landmark, CircleHelp } from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-2026/obrigado-aguardando-pagamento")({
  head: () => ({
    meta: [
      { title: "Compra aguardando pagamento — Pje-Calc 2026" },
      {
        name: "description",
        content: "Seu pedido foi criado e está aguardando a confirmação de pagamento. Assim que confirmar, liberamos seu acesso.",
      },
    ],
  }),
  component: ObrigadoAguardandoPagamentoPage,
});

function ObrigadoAguardandoPagamentoPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-gradient-hero text-dark-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, oklch(0.75 0.17 80 / 0.35), transparent 60%)" }} />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6 shadow-glow">
            <ReceiptText className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">Compra aguardando pagamento</h1>
          <p className="text-lg md:text-xl text-white/85">
            Seu pedido foi registrado com sucesso e está aguardando a confirmação do pagamento.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <Landmark className="w-5 h-5 mt-0.5 text-primary" />
            <p className="text-sm md:text-base text-foreground/90">
              Em pagamentos por boleto, a compensação pode levar até alguns dias úteis. Após confirmação, seu acesso é liberado automaticamente.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CircleHelp className="w-5 h-5 mt-0.5 text-success" />
            <p className="text-sm md:text-base text-foreground/90">
              Se você já pagou e o status ainda não mudou, aguarde a atualização do sistema e consulte seu e-mail.
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

