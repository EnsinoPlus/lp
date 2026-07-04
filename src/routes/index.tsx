import { createFileRoute, Link } from "@tanstack/react-router";
import catalogoCover from "@/assets/catalogo-capa-pjecalc-vicelmo.png";
import { BookOpen, Clock, Coins, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ensino Plus — Produtos Digitais" },
      { name: "description", content: "Produtos digitais educacionais para profissionais do Direito do Trabalho." },
    ],
  }),
  component: Home,
});

const products = [
  {
    slug: "suiteplus-promo-0707",
    title: "SuitePlus — Promo 07/07",
    subtitle: "PlusCoin · Recarga",
    description:
      "1.000 créditos por R$ 200,00. Bônus exclusivo 07/07 — somente 1 dia. Calc Machine, Ponto Mágico e mais.",
    price: "R$ 200",
    oldPrice: null as string | null,
    cover: null as string | null,
    icon: Coins,
    href: "/suiteplus-promo-0707/" as const,
  },
  {
    slug: "ponto-magico",
    title: "Ponto Mágico",
    subtitle: "SuitePlus · IA",
    description:
      "Converta PDFs de cartão de ponto em CSV para o PJe-Calc. Teste grátis com 20 créditos ao criar conta.",
    price: "20 créditos grátis",
    oldPrice: null as string | null,
    cover: null as string | null,
    icon: Clock,
    href: "/ponto-magico/" as const,
  },
  {
    slug: "ebook-pjecalc-2026",
    title: "E-book Pje-Calc 2026",
    subtitle: "Guia prático e definitivo",
    description: "Domine o Pje-Calc e a Lei 14.905/2024. Do cálculo de horas extras à liquidação completa de sentença.",
    price: "R$ 57",
    oldPrice: "R$ 97",
    cover: catalogoCover,
    icon: null,
    href: "/ebook-pjecalc-2026/" as const,
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark text-dark-foreground py-6 border-b-4 border-primary">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-black text-white">
            Ensino <span className="text-primary">Plus</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">Produtos digitais para profissionais do Direito</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-primary font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Nossos produtos
          </span>
          <h2 className="text-3xl md:text-5xl font-black mt-2">Escolha seu material</h2>
          <p className="text-muted-foreground mt-3 text-lg">Conhecimento prático para alavancar sua carreira jurídica.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.slug} className="group bg-card border-2 border-border rounded-2xl overflow-hidden hover:border-primary hover:shadow-card transition-all flex flex-col">
              <div className="bg-dark flex items-center justify-center py-8 px-6 min-h-[12rem]">
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform"
                  />
                ) : p.icon ? (
                  <p.icon className="w-24 h-24 text-primary drop-shadow-2xl group-hover:scale-105 transition-transform" />
                ) : null}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-bold uppercase text-primary tracking-wider mb-1">{p.subtitle}</span>
                <h3 className="text-xl font-black mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                <div className="mt-5 flex items-baseline gap-3 flex-wrap">
                  {p.oldPrice ? (
                    <span className="text-muted-foreground line-through text-sm">{p.oldPrice}</span>
                  ) : null}
                  <span className="text-2xl md:text-3xl font-black text-primary">{p.price}</span>
                </div>
                <Link
                  to={p.href}
                  className="mt-4 inline-flex items-center justify-center gap-2 bg-gradient-cta text-primary-foreground font-bold rounded-xl px-5 py-3 hover:brightness-110 transition"
                >
                  <ShoppingCart className="w-4 h-4" /> Ver produto
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-dark text-white/60 py-8 text-center text-sm mt-16">
        <div className="container mx-auto px-4">
          © 2026 Ensino Plus. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

