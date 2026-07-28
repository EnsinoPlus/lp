import { createFileRoute } from "@tanstack/react-router";
import { SuiteToolLanding } from "@/components/SuiteToolLanding";
import {
  CheckCircle2,
  FileSpreadsheet,
  History,
  Search,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/fgts-facil/")({
  head: () => ({
    meta: [
      {
        title: "FGTS Fácil — Extrato de FGTS em planilha para o PJe-Calc | SuitePlus",
      },
      {
        name: "description",
        content:
          "Envie o extrato de FGTS, identifique meses sem depósito e bases por período, e baixe CSV pronto para o PJe-Calc. Teste grátis com 20 créditos no SuitePlus.",
      },
      { property: "og:title", content: "FGTS Fácil — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "De extrato de FGTS a planilha estruturada para o PJe-Calc, com análise de recolhimentos.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_FGTS_FACIL_APP_URL?.trim() || "https://fgtsfacil.ensinoplus.com.br/";

function Landing() {
  return (
    <SuiteToolLanding
      brand="FGTS Fácil"
      badge="SuitePlus · FGTS Fácil"
      title={
        <>
          Extrato de FGTS em <span className="text-primary">planilha do PJe-Calc</span>
        </>
      }
      subtitle="Identifique depósitos, bases e meses sem recolhimento"
      description="Faça upload do extrato de FGTS. O sistema mostra meses com e sem depósito, a base utilizada em cada período e gera planilha pronta para importação no PJe-Calc."
      signupUrl={SIGNUP_URL}
      appUrl={APP_URL}
      appLinkLabel="Acessar FGTS Fácil"
      heroHighlights={[
        { icon: Upload, label: "Upload do extrato", sub: "PDF do FGTS" },
        { icon: Search, label: "Análise de meses", sub: "Com e sem depósito" },
        { icon: FileSpreadsheet, label: "CSV PJe-Calc", sub: "Pronto para importar" },
      ]}
      trustItems={[
        { icon: ShieldCheck, label: "Histórico guardado" },
        { icon: Wallet, label: "Bases por período" },
        { icon: CheckCircle2, label: "Pronto para PJe-Calc" },
      ]}
      stats={[
        { n: "PDF", l: "Extrato de FGTS" },
        { n: "20", l: "Créditos ao cadastrar" },
        { n: "IA", l: "Análise de recolhimentos" },
        { n: "CSV", l: "Saída para PJe-Calc" },
      ]}
      painTitle="Ler extrato de FGTS à mão gera atraso e falha"
      painText="Identificar meses sem depósito e bases de cálculo período a período é trabalhoso. O FGTS Fácil automatiza a leitura e entrega planilha estruturada para o fluxo do PJe-Calc."
      featuresTitle="Do extrato à planilha estruturada"
      features={[
        {
          icon: Upload,
          title: "Upload do extrato",
          desc: "Envie o extrato de FGTS em PDF. O sistema processa e identifica os períodos.",
        },
        {
          icon: Search,
          title: "Análise de meses",
          desc: "Mostra meses com depósito, sem recolhimento e a base usada em cada período.",
        },
        {
          icon: FileSpreadsheet,
          title: "Planilha estruturada",
          desc: "CSV pronto para importar no PJe-Calc, sem reorganização manual.",
        },
        {
          icon: Wallet,
          title: "Meses sem depósito",
          desc: "Destaque automático dos períodos sem recolhimento para análise.",
        },
        {
          icon: History,
          title: "Histórico guardado",
          desc: "Extratos processados ficam salvos para consulta sem reprocessar.",
        },
        {
          icon: CheckCircle2,
          title: "Menos digitação",
          desc: "Elimine a digitação manual de bases e competências do FGTS.",
        },
      ]}
      steps={[
        {
          step: "01",
          title: "Envie o extrato",
          desc: "Faça upload do PDF do extrato de FGTS.",
        },
        {
          step: "02",
          title: "Sistema analisa",
          desc: "Identifica recolhimentos, bases e meses sem depósito.",
        },
        {
          step: "03",
          title: "Revise o resultado",
          desc: "Confira a análise por período antes de exportar.",
        },
        {
          step: "04",
          title: "Baixe o CSV",
          desc: "Importe a planilha no PJe-Calc e siga com o cálculo.",
        },
      ]}
      differentialTitle="FGTS no fluxo do calculista"
      differentialText="Upload → análise de competências → CSV. Clareza sobre depósitos e bases sem planilha manual."
      differentialPoints={[
        "Extrato de FGTS sem digitação manual",
        "Meses sem depósito destacados",
        "CSV alinhado ao PJe-Calc",
      ]}
      faqs={[
        {
          q: "Preciso pagar para testar?",
          a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos para experimentar as ferramentas.",
        },
        {
          q: "O que o FGTS Fácil analisa?",
          a: "Meses com e sem depósito, base utilizada por período e organização para planilha do PJe-Calc.",
        },
        {
          q: "Serve para o PJe-Calc?",
          a: "Sim. A saída é uma planilha CSV estruturada para importação no PJe-Calc.",
        },
        {
          q: "Faz parte do SuitePlus?",
          a: "Sim. Um login no SuitePlus acessa FGTS Fácil e as demais ferramentas.",
        },
      ]}
      finalTitle={
        <>
          Analise o FGTS <span className="text-primary">sem digitar competências</span>
        </>
      }
      finalText="Crie sua conta, use os 20 créditos de boas-vindas e processe seu primeiro extrato hoje."
      footerLabel="FGTS Fácil"
    />
  );
}
