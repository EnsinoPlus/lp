import { createFileRoute } from "@tanstack/react-router";
import { SuiteToolLanding } from "@/components/SuiteToolLanding";
import {
  CalendarX,
  CheckCircle2,
  FileSpreadsheet,
  FileUp,
  ShieldCheck,
  Timer,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/extrator-de-ausencias/")({
  head: () => ({
    meta: [
      {
        title: "Extrator de Ausências — Férias e faltas em CSV para o PJe-Calc | SuitePlus",
      },
      {
        name: "description",
        content:
          "Envie PDFs com férias e faltas, extraia períodos automaticamente e baixe CSV pronto para o PJe-Calc. Teste grátis com 20 créditos no SuitePlus.",
      },
      { property: "og:title", content: "Extrator de Ausências — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "De PDF de férias e faltas a planilha estruturada para o PJe-Calc em minutos.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_EXTRATOR_AUSENCIAS_APP_URL?.trim() || "https://ausencias.ensinoplus.com.br/";

function Landing() {
  return (
    <SuiteToolLanding
      brand="Extrator de Ausências"
      badge="SuitePlus · Extrator de Ausências"
      title={
        <>
          PDF de férias e faltas em <span className="text-primary">planilha do PJe-Calc</span>
        </>
      }
      subtitle="Extraia períodos e gere CSV automaticamente"
      description="Envie PDFs com registros de férias, faltas e ausências. O sistema identifica períodos justificados e não justificados e entrega planilha pronta para importação no PJe-Calc."
      signupUrl={SIGNUP_URL}
      appUrl={APP_URL}
      appLinkLabel="Acessar Extrator de Ausências"
      heroHighlights={[
        { icon: Upload, label: "Upload de PDF", sub: "Férias, faltas e ausências" },
        { icon: CalendarX, label: "Extração de períodos", sub: "Automática e organizada" },
        { icon: FileSpreadsheet, label: "CSV PJe-Calc", sub: "Pronto para importar" },
      ]}
      trustItems={[
        { icon: ShieldCheck, label: "Relatório auditável" },
        { icon: Timer, label: "Minutos, não horas" },
        { icon: CheckCircle2, label: "Pronto para PJe-Calc" },
      ]}
      stats={[
        { n: "PDF", l: "Entrada de registros" },
        { n: "20", l: "Créditos ao cadastrar" },
        { n: "IA", l: "Extração de períodos" },
        { n: "CSV", l: "Saída para PJe-Calc" },
      ]}
      painTitle="Mapear férias e faltas manualmente atrasa o cálculo"
      painText="Separar períodos, justificar ausências e montar planilha para o PJe-Calc é trabalho repetitivo e sujeito a erro. O Extrator de Ausências faz essa etapa em minutos."
      featuresTitle="Do PDF à planilha de ausências"
      features={[
        {
          icon: FileUp,
          title: "Upload rápido de PDF",
          desc: "Envie registros de férias, faltas e ausências. O sistema processa sem demora.",
        },
        {
          icon: CalendarX,
          title: "Extração de períodos",
          desc: "Identifica férias, faltas justificadas e não justificadas automaticamente.",
        },
        {
          icon: FileSpreadsheet,
          title: "Planilha estruturada",
          desc: "CSV pronto para importar no PJe-Calc, sem reorganização manual.",
        },
        {
          icon: Timer,
          title: "Relatório em minutos",
          desc: "Organize ausências e faltas com velocidade e rastreabilidade.",
        },
        {
          icon: ShieldCheck,
          title: "Base auditável",
          desc: "Saída clara para conferência antes de seguir no cálculo.",
        },
        {
          icon: CheckCircle2,
          title: "Menos digitação",
          desc: "Elimine a transcrição manual de períodos e datas.",
        },
      ]}
      steps={[
        {
          step: "01",
          title: "Enviar PDF",
          desc: "Faça upload do PDF com férias, faltas e ausências do reclamante.",
        },
        {
          step: "02",
          title: "Sistema processa",
          desc: "Algoritmo extrai períodos justificados e não justificados automaticamente.",
        },
        {
          step: "03",
          title: "Revise o extrato",
          desc: "Confira a organização dos períodos antes de exportar.",
        },
        {
          step: "04",
          title: "Baixar planilha",
          desc: "Receba CSV estruturado e pronto para importar no PJe-Calc.",
        },
      ]}
      differentialTitle="Ausências no fluxo do calculista"
      differentialText="Upload → extração → CSV. Controle de espelhos e ausências sem planilha manual."
      differentialPoints={[
        "Férias e faltas extraídas do PDF",
        "Períodos organizados automaticamente",
        "CSV alinhado ao PJe-Calc",
      ]}
      faqs={[
        {
          q: "Preciso pagar para testar?",
          a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos para experimentar as ferramentas.",
        },
        {
          q: "O que o Extrator identifica?",
          a: "Períodos de férias, faltas justificadas e não justificadas a partir do PDF enviado.",
        },
        {
          q: "Serve para o PJe-Calc?",
          a: "Sim. A saída é uma planilha CSV estruturada para importação no PJe-Calc.",
        },
        {
          q: "Faz parte do SuitePlus?",
          a: "Sim. Um login no SuitePlus acessa o Extrator de Ausências e as demais ferramentas.",
        },
      ]}
      finalTitle={
        <>
          Organize ausências <span className="text-primary">sem digitar períodos</span>
        </>
      }
      finalText="Crie sua conta, use os 20 créditos de boas-vindas e processe seu primeiro PDF de ausências hoje."
      footerLabel="Extrator de Ausências"
    />
  );
}
