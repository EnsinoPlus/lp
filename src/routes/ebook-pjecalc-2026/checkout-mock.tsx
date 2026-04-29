import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ebookCover from "@/assets/ebook-cover.png";
import { ShieldCheck, Lock, CreditCard, QrCode, FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-2026/checkout-mock")({
  head: () => ({
    meta: [
      { title: "Checkout (mock) — E-book Pje-Calc 2026" },
      { name: "description", content: "Checkout de teste com dados mockados para comparação." },
    ],
  }),
  component: CheckoutMock,
});

type Method = "card" | "pix" | "boleto";

function CheckoutMock() {
  const [method, setMethod] = useState<Method>("pix");

  useEffect(() => {
    // Hotmart checkout inject: load widget + stylesheet once (client-side only).
    const widgetSrc = "https://static.hotmart.com/checkout/widget.min.js";
    const cssHref = "https://static.hotmart.com/css/hotmart-fb.min.css";

    if (typeof document === "undefined") return;

    const existingScript = document.querySelector(`script[src="${widgetSrc}"]`);
    if (!existingScript) {
      const imported = document.createElement("script");
      imported.src = widgetSrc;
      imported.async = true;
      document.head.appendChild(imported);
    }

    const existingLink = document.querySelector(`link[href="${cssHref}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = cssHref;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-dark text-dark-foreground py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/ebook-pjecalc-2026/" className="flex items-center gap-2 text-sm hover:text-primary transition">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Lock className="w-4 h-4 text-success" /> Pagamento 100% seguro
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Finalize seu pedido</h1>
        <p className="text-muted-foreground mb-8">Você está a um passo de dominar o Pje-Calc 2026.</p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* FORM */}
          <form onSubmit={(e) => e.preventDefault()} className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                Seus dados
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Nome completo" name="name" required />
                <Field label="E-mail" name="email" type="email" required />
                <Field label="CPF" name="cpf" required placeholder="000.000.000-00" />
                <Field label="Telefone" name="phone" required placeholder="(00) 00000-0000" />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                Forma de pagamento
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <PayMethod active={method === "pix"} onClick={() => setMethod("pix")} icon={QrCode} label="Pix" badge="-5%" />
                <PayMethod active={method === "card"} onClick={() => setMethod("card")} icon={CreditCard} label="Cartão" />
                <PayMethod active={method === "boleto"} onClick={() => setMethod("boleto")} icon={FileText} label="Boleto" />
              </div>

              {method === "card" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field label="Número do cartão" name="card" required placeholder="0000 0000 0000 0000" />
                  </div>
                  <Field label="Validade" name="exp" required placeholder="MM/AA" />
                  <Field label="CVV" name="cvv" required placeholder="000" />
                  <div className="md:col-span-2">
                    <Field label="Nome no cartão" name="cname" required />
                  </div>
                </div>
              )}
              {method === "pix" && (
                <div className="bg-accent rounded-xl p-5 text-sm">
                  Após confirmar, você receberá um <strong>QR Code Pix</strong> com 5% de desconto e acesso liberado em segundos.
                </div>
              )}
              {method === "boleto" && (
                <div className="bg-accent rounded-xl p-5 text-sm">
                  O boleto será gerado e enviado para seu e-mail. Compensação em até 2 dias úteis.
                </div>
              )}
            </section>

            <div className="flex justify-center">
              <a
                onClick={(e) => e.preventDefault()}
                href="https://pay.hotmart.com/R105606128X?checkoutMode=2"
                className="hotmart-fb hotmart__button-checkout"
              >
                <img src="https://static.hotmart.com/img/btn-buy-green.png" alt="Comprar" />
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Seus dados estão protegidos com criptografia SSL.
            </p>
          </form>

          {/* SUMMARY */}
          <aside className="space-y-4">
            <div className="bg-card rounded-2xl shadow-card border border-border p-6 sticky top-4">
              <h3 className="font-bold mb-4 text-lg">Resumo do pedido</h3>
              <div className="flex gap-4 mb-5 pb-5 border-b border-border">
                <img src={ebookCover} alt="" width={80} height={80} className="w-20 h-20 object-contain bg-dark rounded-lg p-1" />
                <div className="flex-1">
                  <div className="font-semibold">E-book Pje-Calc 2026</div>
                  <div className="text-xs text-muted-foreground mt-1">Edição atualizada — Lei 14.905/2024</div>
                  <div className="text-xs text-success font-semibold mt-1">+ Bônus inclusos</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value="R$ 97,00" />
                <Row label="Desconto de lançamento" value="- R$ 40,00" highlight />
                {method === "pix" && <Row label="Desconto Pix (5%)" value="- R$ 2,85" highlight />}
                <div className="border-t border-border pt-3 mt-3 flex justify-between items-baseline">
                  <span className="font-bold">Total</span>
                  <span className="text-3xl font-black text-primary">
                    R$ {method === "pix" ? "54,15" : "57,00"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success" /> Garantia incondicional de 7 dias
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-success" /> Compra 100% segura
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">
        {label}
        {required && <span className="text-urgency"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}

function PayMethod({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
        active ? "border-primary bg-accent shadow-card" : "border-border bg-background hover:border-primary/50"
      }`}
    >
      {badge && <span className="absolute -top-2 -right-2 bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
      <Icon className={`w-6 h-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-success font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

