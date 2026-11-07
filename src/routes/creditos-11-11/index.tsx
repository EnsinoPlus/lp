import { createFileRoute } from "@tanstack/react-router";
import { PromoCreditos, type OfertaCreditos } from "@/components/PromoCreditos";

// Campanha 11.11 Mais Créditos: cada pacote leva ao checkout da Suite, que credita sozinho.
const CHECKOUT = "https://suiteplus.ensinoplus.com.br/creditos-11-11";
const OFERTAS: OfertaCreditos[] = [
  { id: "350 créditos", titulo: "350 créditos", creditos: 350, valor: 97, descricao: "Para quem está começando.", checkoutUrl: `${CHECKOUT}?pacote=350` },
  { id: "850 créditos", titulo: "850 créditos", creditos: 850, valor: 197, descricao: "Para quem utiliza as ferramentas com frequência.", checkoutUrl: `${CHECKOUT}?pacote=850` },
  { id: "1.300 créditos", titulo: "1.300 créditos", creditos: 1300, valor: 297, descricao: "Para profissionais com maior demanda.", checkoutUrl: `${CHECKOUT}?pacote=1300` },
];

export const Route = createFileRoute("/creditos-11-11/")({
  head: () => ({
    meta: [
      { title: "11.11 Mais Créditos | SuitePlus" },
      { name: "description", content: "Condições especiais do 11.11 da Ensino Plus: 350 créditos por R$ 97, 850 por R$ 197 e 1.300 por R$ 297." },
      { property: "og:title", content: "11.11 Mais Créditos | SuitePlus" },
      { property: "og:description", content: "350 créditos por R$ 97, 850 por R$ 197 e 1.300 por R$ 297." },
    ],
  }),
  component: () => (
    <PromoCreditos
      promo="11-11"
      selo="Campanha 11.11"
      titulo={<>11.11 <span className="text-amber-300">Mais Créditos</span></>}
      subtitulo="Condições especiais para reforçar seus créditos na Suíte Plus. Mais créditos para reduzir tarefas manuais e ganhar agilidade nos cálculos trabalhistas."
      beneficios={[
        { title: "A partir de R$ 97", desc: "350, 850 ou 1.300 créditos, conforme a sua rotina." },
        { title: "Use nas ferramentas da Suíte Plus", desc: "Como Calc Machine, Ponto Mágico e Contracheque Transparente." },
        { title: "Na conta do seu e-mail", desc: "Os créditos entram após a confirmação do pagamento." },
      ]}
      ofertas={OFERTAS}
      ofertaInicial="850 créditos"
      textoCta="Quero aproveitar o 11.11"
    />
  ),
});
