import { createFileRoute, Link } from "@tanstack/react-router";
import ebookCover from "@/assets/ebook-cover.png";
import { CheckCircle2, Download, Mail, Gift, MessageCircle, Star, BookOpen } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  head: () => ({
    meta: [
      { title: "Obrigado pela compra — Pje-Calc 2026" },
      { name: "description", content: "Sua compra foi confirmada. Acesse agora o E-book Pje-Calc 2026." },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <div className="min-h-screen bg-secondary">
      {/* Confirmation hero */}
      <section className="bg-gradient-hero text-dark-foreground py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, oklch(0.65 0.18 145 / 0.6), transparent 60%)" }} />
        <div className="container mx-auto px-4 text-center relative max-w-3xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success mb-6 shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-success-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Pagamento confirmado! 🎉</h1>
          <p className="text-xl text-white/80 mb-8">
            Bem-vindo, futuro especialista em Pje-Calc. Sua jornada começa agora.
          </p>
          <a
            href="#download"
            className="inline-flex items-center gap-2 bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide rounded-xl px-8 py-4 shadow-cta hover:brightness-110 transition"
          >
            <Download className="w-5 h-5" /> Acessar meu e-book
          </a>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
        {/* DOWNLOAD */}
        <section id="download" className="bg-card rounded-2xl shadow-card border-2 border-primary p-6 md:p-10">
          <div className="grid md:grid-cols-[180px_1fr] gap-6 items-center">
            <img src={ebookCover} alt="E-book" width={180} height={180} className="w-40 mx-auto" />
            <div>
              <span className="text-primary font-bold uppercase text-xs tracking-wider">Seu acesso</span>
              <h2 className="text-2xl md:text-3xl font-black mt-1 mb-3">E-book Pje-Calc 2026</h2>
              <p className="text-muted-foreground mb-5">Versão atualizada com a Lei 14.905/2024. Disponível em PDF.</p>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold rounded-lg px-5 py-3 hover:brightness-110 transition">
                  <Download className="w-4 h-4" /> Baixar PDF
                </a>
                <a href="#" className="inline-flex items-center gap-2 bg-secondary text-foreground font-bold rounded-lg px-5 py-3 hover:bg-accent transition">
                  <BookOpen className="w-4 h-4" /> Ler online
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* NEXT STEPS */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">Próximos passos</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Mail, title: "Confira seu e-mail", desc: "Enviamos os dados de acesso e o link de download para você." },
              { icon: Download, title: "Baixe o e-book", desc: "Faça o download e comece pela Unidade I — Sistema Pje-Calc." },
              { icon: BookOpen, title: "Estude no seu ritmo", desc: "Reserve 30 min/dia. Em 2 semanas você domina o sistema." },
            ].map((s, i) => (
              <div key={s.title} className="bg-card rounded-xl border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-cta text-primary-foreground flex items-center justify-center font-bold">{i + 1}</div>
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BONUS */}
        <section className="bg-gradient-hero text-dark-foreground rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 rounded-full px-3 py-1 text-xs font-bold uppercase mb-4">
              <Gift className="w-4 h-4" /> Bônus exclusivos
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6">Liberados com sua compra</h2>
            <ul className="space-y-3 text-white/90">
              {[
                "Planilha de modelos de cálculo (XLSX) pronta para uso",
                "Checklist de impugnação fundamentada — art. 884 da CLT",
                "Tabela atualizada de juros e correção monetária 2026",
                "Acesso ao grupo VIP de leitores no Telegram",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ENGAGEMENT */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <MessageCircle className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-bold text-lg mb-2">Entre no grupo VIP</h3>
            <p className="text-sm text-muted-foreground mb-4">Tire dúvidas direto com o Prof. Vicelmo e outros leitores.</p>
            <a href="#" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Entrar no Telegram →
            </a>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <Star className="w-10 h-10 text-primary mb-3 fill-primary" />
            <h3 className="font-bold text-lg mb-2">Avalie sua experiência</h3>
            <p className="text-sm text-muted-foreground mb-4">Sua opinião ajuda outros profissionais a evoluírem.</p>
            <a href="#" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Deixar avaliação →
            </a>
          </div>
        </section>

        <div className="text-center pt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition">← Voltar para a página inicial</Link>
        </div>
      </div>
    </div>
  );
}
