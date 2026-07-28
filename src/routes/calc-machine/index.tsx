import { createFileRoute } from "@tanstack/react-router";
import { SuiteToolLanding } from "@/components/SuiteToolLanding";
import {
  Brain,
  CheckCircle2,
  FileCode2,
  FileJson,
  History,
  Pencil,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/calc-machine/")({
  head: () => ({
    meta: [
      {
        title: "CalcMachine — Sentença em .PJC e JSON para o PJe-Calc | SuitePlus",
      },
      {
        name: "description",
        content:
          "Cole a sentença trabalhista e receba arquivos .PJC e JSON prontos para o PJe-Calc. IA especializada em cálculos. Teste grátis com 20 créditos no SuitePlus.",
      },
      { property: "og:title", content: "CalcMachine — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "De sentença a arquivos prontos para o PJe-Calc em minutos, com IA e histórico rastreável.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_CALC_MACHINE_APP_URL?.trim() || "https://calcmachine.ensinoplus.com.br/home";

function Landing() {
  return (
    <SuiteToolLanding
      brand="CalcMachine"
      badge="SuitePlus · CalcMachine"
      title={
        <>
          Sentenças em arquivos <span className="text-primary">prontos para o PJe-Calc</span>
        </>
      }
      subtitle="Cole o texto, deixe a IA processar e baixe .PJC + JSON"
      description="Pare de montar cálculos do zero. Cole a sentença trabalhista, deixe a IA extrair verbas, índices e datas — e receba arquivos prontos para importação no PJe-Calc, com histórico e edição."
      signupUrl={SIGNUP_URL}
      appUrl={APP_URL}
      appLinkLabel="Acessar CalcMachine"
      heroHighlights={[
        { icon: Scale, label: "Cole a sentença", sub: "Texto completo ou CND" },
        { icon: Brain, label: "IA processa", sub: "Verbas, índices e datas" },
        { icon: FileCode2, label: ".PJC + JSON", sub: "Pronto para o PJe-Calc" },
      ]}
      trustItems={[
        { icon: ShieldCheck, label: "Histórico de cálculos" },
        { icon: Pencil, label: "Edição e regeneração" },
        { icon: Sparkles, label: "IA trabalhista" },
      ]}
      stats={[
        { n: ".PJC", l: "Importação PJe-Calc" },
        { n: "20", l: "Créditos ao cadastrar" },
        { n: "IA", l: "Extração automática" },
        { n: "JSON", l: "Ajustes estruturados" },
      ]}
      painTitle="Montar cálculo a partir da sentença consome horas"
      painText="Calculistas e advogados perdem tempo relendo sentenças, mapeando verbas e digitando dados no PJe-Calc. Um erro de período ou índice compromete o resultado. O CalcMachine automatiza a extração e entrega arquivos editáveis e importáveis."
      featuresTitle="Do texto jurídico ao arquivo importável"
      features={[
        {
          icon: Brain,
          title: "Processamento com IA",
          desc: "Cole a sentença e deixe a IA extrair automaticamente os dados relevantes para o cálculo.",
        },
        {
          icon: FileCode2,
          title: "Geração de .PJC",
          desc: "Arquivo pronto para importação no PJe-Calc, alinhado ao fluxo do calculista.",
        },
        {
          icon: FileJson,
          title: "JSON editável",
          desc: "Dados estruturados para ajustes e regeneração sem recomeçar do zero.",
        },
        {
          icon: History,
          title: "Armazenamento seguro",
          desc: "Cálculos guardados com histórico completo e rastreabilidade.",
        },
        {
          icon: Pencil,
          title: "Edição rápida",
          desc: "Ajuste o JSON, corrija valores e regenere os arquivos quando precisar.",
        },
        {
          icon: CheckCircle2,
          title: "Precisão trabalhista",
          desc: "IA treinada no contexto de cálculos trabalhistas brasileiros.",
        },
      ]}
      steps={[
        {
          step: "01",
          title: "Cole a sentença",
          desc: "Copie o texto completo da sentença trabalhista ou CND na plataforma.",
        },
        {
          step: "02",
          title: "IA processa",
          desc: "A IA analisa o texto e extrai verbas, índices e datas relevantes.",
        },
        {
          step: "03",
          title: "Gera arquivos",
          desc: "Sistema cria .PJC para o PJe-Calc e JSON para ajustes futuros.",
        },
        {
          step: "04",
          title: "Revise e armazene",
          desc: "Edite se necessário e mantenha o histórico completo na plataforma.",
        },
      ]}
      differentialTitle="Integração real com o fluxo do calculista"
      differentialText="Saída dupla (.PJC + JSON), edição renovável e histórico rastreável — para acelerar a liquidação sem abrir mão do controle."
      differentialPoints={[
        "Sentença → .PJC importável no PJe-Calc",
        "JSON estruturado para ajustes e regeneração",
        "Público: calculistas, advogados e peritos",
      ]}
      faqs={[
        {
          q: "Preciso pagar para testar?",
          a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos para experimentar as ferramentas.",
        },
        {
          q: "O que o CalcMachine gera?",
          a: "Arquivo .PJC pronto para importação no PJe-Calc e JSON editável para ajustes e regeneração.",
        },
        {
          q: "Posso editar depois?",
          a: "Sim. Ajuste os dados no JSON e regenere os arquivos quantas vezes precisar, com histórico na plataforma.",
        },
        {
          q: "Faz parte do SuitePlus?",
          a: "Sim. Um login no SuitePlus acessa CalcMachine e as demais ferramentas de IA do ecossistema.",
        },
      ]}
      finalTitle={
        <>
          Transforme sentenças em <span className="text-primary">arquivos prontos</span>
        </>
      }
      finalText="Crie sua conta, use os 20 créditos de boas-vindas e processe sua primeira sentença hoje."
      footerLabel="CalcMachine"
    />
  );
}
