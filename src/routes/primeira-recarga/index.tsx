import { createFileRoute } from "@tanstack/react-router";
import { PromoCreditos, type OfertaCreditos } from "@/components/PromoCreditos";

// Campanha Primeira Recarga. Quando a Suite criar o checkout de R$ 29, preencher checkoutUrl.
const OFERTAS: OfertaCreditos[] = [{ id: "Primeira Recarga", titulo: "Primeira Recarga", creditos: null, valor: 29 }];

export const Route = createFileRoute("/primeira-recarga/")({
  head: () => ({
    meta: [
      { title: "Primeira Recarga por R$ 29 | SuitePlus" },
      { name: "description", content: "Oferta para novos usuários: faça sua primeira recarga de créditos da SuitePlus por R$ 29." },
      { property: "og:title", content: "Primeira Recarga por R$ 29 | SuitePlus" },
      { property: "og:description", content: "Oferta para novos usuários da SuitePlus." },
    ],
  }),
  component: () => (
    <PromoCreditos
      promo="primeira-recarga"
      selo="Oferta para novos usuários"
      titulo={<>Sua primeira recarga por <span className="text-amber-300">R$ 29</span></>}
      subtitulo="Comece a usar as ferramentas de cálculo trabalhista da SuitePlus com créditos na sua conta."
      beneficios={[
        { title: "Exclusivo para novos usuários", desc: "Válido uma vez, na sua primeira recarga." },
        { title: "Créditos para todas as ferramentas", desc: "Use nas soluções de IA da Suite." },
        { title: "Na conta do seu e-mail", desc: "Os créditos entram após a confirmação do pagamento." },
      ]}
      ofertas={OFERTAS}
      textoCta="Quero minha primeira recarga"
    />
  ),
});
