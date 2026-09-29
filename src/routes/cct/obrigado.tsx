import { createFileRoute } from "@tanstack/react-router";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CheckCircle2, Inbox, Mail, ShieldCheck } from "lucide-react";
import { buildMetaPixelHeadScript, trackMetaCustomEvent } from "@/lib/meta-pixel";

const metaPixelId = import.meta.env.VITE_META_PIXEL_ID?.trim() || undefined;
const metaPixelScript = metaPixelId ? buildMetaPixelHeadScript(metaPixelId) : null;

export const Route = createFileRoute("/cct/obrigado")({
  head: () => ({
    meta: [
      { title: "Confirme seu e-mail — CCT 2026" },
      {
        name: "description",
        content: "Cadastro iniciado. Confirme seu e-mail para liberar o acesso ao Clube do Cálculo Trabalhista.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "/cct/" }],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <>
      {metaPixelScript ? <script dangerouslySetInnerHTML={{ __html: metaPixelScript }} /> : null}
      <div className="min-h-screen bg-background">
      <section className="bg-gradient-hero text-dark-foreground py-16 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, oklch(0.65 0.18 145 / 0.55), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 text-center relative max-w-3xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success mb-6 shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-success-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Cadastro quase concluído!</h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            Enviamos um e-mail de confirmação. Valide sua conta para liberar o acesso ao Clube do Cálculo
            Trabalhista.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border-2 border-border rounded-2xl p-8 md:p-10 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-cta text-primary-foreground flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Valide seu e-mail</h2>
                <p className="text-sm text-muted-foreground">Passo obrigatório para ativar sua conta</p>
              </div>
            </div>

            <ol className="space-y-5">
              {[
                {
                  icon: Inbox,
                  title: "Abra sua caixa de entrada",
                  desc: "Procure a mensagem de confirmação do cadastro no e-mail que você usou.",
                },
                {
                  icon: ShieldCheck,
                  title: "Clique no link de validação",
                  desc: "O link confirma que o e-mail é seu e libera o acesso à plataforma.",
                },
                {
                  icon: CheckCircle2,
                  title: "Pronto para estudar",
                  desc: "Depois de validar, entre na plataforma e comece pelos cursos e trilhas.",
                },
              ].map((item, i) => (
                <li key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-dark text-primary font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-primary" />
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-xl bg-secondary border border-border p-5 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Não encontrou o e-mail?</strong> Confira a pasta de spam ou
              promoções. Se precisar de ajuda, fale conosco pelo WhatsApp — o botão fica no canto da tela.
            </div>

            <a
              href="https://suiteplus.ensinoplus.com.br/"
              onClick={() => trackMetaCustomEvent("AcessarPlataforma")}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-cta px-6 py-4 font-bold uppercase tracking-wide text-primary-foreground shadow-cta transition hover:brightness-110"
            >
              Acessar a plataforma
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus · Clube do Cálculo Trabalhista. Todos os direitos reservados.
        </div>
      </footer>

      <WhatsAppFloat />
      </div>
    </>
  );
}
