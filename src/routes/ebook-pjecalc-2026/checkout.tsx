import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-2026/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — E-book Pje-Calc 2026" },
      { name: "description", content: "Finalize sua compra do E-book Pje-Calc 2026 com segurança." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const hotmartScript = `
	function importHotmart(){ 
 		var imported = document.createElement('script'); 
 		imported.src = 'https://static.hotmart.com/checkout/widget.min.js'; 
 		document.head.appendChild(imported); 
		var link = document.createElement('link'); 
		link.rel = 'stylesheet'; 
		link.type = 'text/css'; 
		link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css'; 
		document.head.appendChild(link);	
 	} 
 	importHotmart(); 
  `;

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

        <div className="flex items-center justify-center">
          <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8 w-full flex flex-col items-center gap-4">
            {/* Hotmart widget + botão de checkout */}
            <script type="text/javascript" dangerouslySetInnerHTML={{ __html: hotmartScript }} />

            <a
              onClick={(e) => e.preventDefault()}
              href="https://pay.hotmart.com/R105606128X?checkoutMode=2"
              className="hotmart-fb hotmart__button-checkout"
            >
              <img src="https://static.hotmart.com/img/btn-buy-green.png" alt="Comprar" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
