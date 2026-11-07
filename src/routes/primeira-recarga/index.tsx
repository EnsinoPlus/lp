import { createFileRoute } from "@tanstack/react-router";
import { PromoCreditos, type OfertaCreditos } from "@/components/PromoCreditos";

// Campanha Primeira Recarga: o botão leva ao checkout de R$ 29 na Suite, que credita sozinho.
const OFERTAS: OfertaCreditos[] = [{ id: "Primeira Recarga", titulo: "100 créditos", creditos: 100, valor: 29, descricao: "Ideal para primeira recarga.", checkoutUrl: "https://suiteplus.ensinoplus.com.br/primeira-recarga" }];

export const Route = createFileRoute("/primeira-recarga/")({
  head: () => ({
    meta: [
      { title: "Primeira Recarga por R$ 29 | SuitePlus" },
      { name: "description", content: "Oferta 11.11: 100 créditos por R$ 29 na sua primeira recarga da Suite Plus." },
      { property: "og:title", content: "Primeira Recarga: 100 créditos por R$ 29" },
      { property: "og:description", content: "Comece com créditos na Suite Plus em uma condição especial." },
    ],
  }),
  component: () => (
    <PromoCreditos
      promo="primeira-recarga"
      selo="Oferta 11.11"
      titulo={<>Primeira Recarga: <span className="text-amber-300">100 créditos por R$ 29</span></>}
      subtitulo="Comece com créditos na Suite Plus e aproveite uma condição especial para entrar na plataforma."
      beneficios={[
        { title: "100 créditos por R$ 29", desc: "Ideal para primeira recarga." },
        { title: "Ferramentas incluídas nos créditos", desc: "Calc Machine, Ponto Mágico e Contracheque Transparente." },
        { title: "Na conta do seu e-mail", desc: "Os créditos entram após a confirmação do pagamento." },
      ]}
      ofertas={OFERTAS}
      textoCta="Quero minha primeira recarga"
    />
  ),
});
