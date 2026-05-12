import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, ExternalLink, Mail, BookOpen } from "lucide-react";

export const Route = createFileRoute("/ebook-pjecalc-2026/obrigado")({
  head: () => ({
    meta: [
      { title: "Obrigado pela compra — Pje-Calc 2026" },
      {
        name: "description",
        content: "Sua compra foi confirmada. A Hotmart envia o acesso ao material no e-mail da compra.",
      },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <div className="min-h-screen bg-secondary">
      {/* Confirmation hero */}
      <section className="bg-gradient-hero text-dark-foreground py-14 md:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, oklch(0.65 0.18 145 / 0.6), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 text-center relative max-w-3xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success mb-6 shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-success-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Pagamento confirmado! 🎉</h1>
          <p className="text-xl text-white/80 mb-8">
            Bem-vindo, futuro especialista em Pje-Calc. Sua jornada começa agora.
          </p>
          <a
            href="#next-steps"
            className="inline-flex items-center gap-2 bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide rounded-xl px-8 py-4 shadow-cta hover:brightness-110 transition"
          >
            <ChevronDown className="w-5 h-5" /> Próximos passos
          </a>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
        {/* NEXT STEPS */}
        <section id="next-steps">
          <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">Próximos passos</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Mail,
                title: "Confira seu e-mail",
                desc: "A Hotmart envia a confirmação da compra e o link para acessar o material no endereço informado no checkout.",
              },
              {
                icon: ExternalLink,
                title: "Acesse na Hotmart",
                desc: "O link e o material são enviados pela Hotmart no e-mail da compra. Use o botão do e-mail ou acesse sua conta na plataforma.",
              },
              {
                icon: BookOpen,
                title: "Estude no seu ritmo",
                desc: "Reserve 30 min/dia. Em 2 semanas você domina o sistema.",
              },
            ].map((s, i) => (
              <div
                key={s.title}
                className="bg-card rounded-xl border border-border p-6 shadow-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-cta text-primary-foreground flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
