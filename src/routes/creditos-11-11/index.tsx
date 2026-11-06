import { createFileRoute } from "@tanstack/react-router";
import { PromoCreditos, type OfertaCreditos } from "@/components/PromoCreditos";

// Campanha 11.11 Mais Créditos. Quando definirem os preços e a Suite criar os checkouts,
// preencher valor e checkoutUrl de cada pacote.
const OFERTAS: OfertaCreditos[] = [
  { id: "350 créditos", titulo: "350 créditos", creditos: 350, valor: null },
  { id: "850 créditos", titulo: "850 créditos", creditos: 850, valor: null },
  { id: "1.300 créditos", titulo: "1.300 créditos", creditos: 1300, valor: null },
];

export const Route = createFileRoute("/creditos-11-11/")({
  head: () => ({
    meta: [
      { title: "11.11 Mais Créditos | SuitePlus" },
      { name: "description", content: "Campanha 11.11 da SuitePlus: pacotes de 350, 850 e 1.300 créditos." },
      { property: "og:title", content: "11.11 Mais Créditos | SuitePlus" },
      { property: "og:description", content: "Pacotes de 350, 850 e 1.300 créditos." },
    ],
  }),
  component: () => (
    <PromoCreditos
      promo="11-11"
      selo="Campanha 11.11"
      titulo={<>11.11 <span className="text-amber-300">Mais Créditos</span></>}
      subtitulo="Escolha entre os pacotes de 350, 850 e 1.300 créditos para usar nas ferramentas da SuitePlus."
      beneficios={[
        { title: "3 pacotes para escolher", desc: "350, 850 ou 1.300 créditos." },
        { title: "Créditos para todas as ferramentas", desc: "Use nas soluções de IA da Suite." },
        { title: "Na conta do seu e-mail", desc: "Os créditos entram após a confirmação do pagamento." },
      ]}
      ofertas={OFERTAS}
      ofertaInicial="850 créditos"
      textoCta="Quero aproveitar o 11.11"
    />
  ),
});
