import { createFileRoute } from "@tanstack/react-router";
import { SuiteToolLanding } from "@/components/SuiteToolLanding";
import {
  Bot,
  CheckCircle2,
  FileSearch,
  FileText,
  History,
  Scale,
  ShieldCheck,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/impugnador/")({
  head: () => ({
    meta: [
      {
        title: "Impugnador — Valide sentença contra cálculos com IA | SuitePlus",
      },
      {
        name: "description",
        content:
          "Envie sentença e cálculos. Agentes de IA validam conformidade, apontam divergências e geram relatório persistente. Teste grátis com 20 créditos no SuitePlus.",
      },
      { property: "og:title", content: "Impugnador — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "Orquestração de agentes de IA para confrontar sentença e cálculos com relatório auditável.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_IMPUGNADOR_APP_URL?.trim() || "https://impugnador.ensinoplus.com.br/";

function Landing() {
  return (
    <SuiteToolLanding
      brand="Impugnador"
      badge="SuitePlus · Impugnador"
      title={
        <>
          Sentença analisada contra cálculos com{" "}
          <span className="text-primary">agentes de IA</span>
        </>
      }
      subtitle="Validação automática, divergências e relatório persistente"
      description="Faça upload da sentença e dos cálculos. Múltiplos agentes de IA conferem valores, períodos e bases — e entregam um relatório detalhado salvo para auditoria e consulta futura."
      signupUrl={SIGNUP_URL}
      appUrl={APP_URL}
      appLinkLabel="Acessar Impugnador"
      heroHighlights={[
        { icon: Upload, label: "Sentença + cálculos", sub: "PDF ou planilha" },
        { icon: Bot, label: "Agentes de IA", sub: "Análise orquestrada" },
        { icon: FileSearch, label: "Relatório", sub: "Divergências e confirmações" },
      ]}
      trustItems={[
        { icon: ShieldCheck, label: "Relatórios persistentes" },
        { icon: Scale, label: "Conformidade com a sentença" },
        { icon: CheckCircle2, label: "Validação automática" },
      ]}
      stats={[
        { n: "IA", l: "Agentes orquestrados" },
        { n: "20", l: "Créditos ao cadastrar" },
        { n: "PDF", l: "Sentença e cálculos" },
        { n: "100%", l: "Históricos salvos" },
      ]}
      painTitle="Conferir sentença e cálculo à mão é lento e arriscado"
      painText="Cruzar disposições sentenciadas com valores, períodos e bases exige atenção extrema. O Impugnador acelera essa conferência com orquestração de agentes de IA e relatório auditável."
      featuresTitle="Da juntada ao relatório de conformidade"
      features={[
        {
          icon: Bot,
          title: "Análise de IA orquestrada",
          desc: "Múltiplos agentes analisam conformidade entre sentença e cálculos em conjunto.",
        },
        {
          icon: FileSearch,
          title: "Validação automática",
          desc: "Confere valores, períodos, rubricas e bases contra as disposições da sentença.",
        },
        {
          icon: History,
          title: "Relatórios persistentes",
          desc: "Achados salvos para consultas, comparações e auditorias sem reprocessar.",
        },
        {
          icon: FileText,
          title: "Upload flexível",
          desc: "Envie sentença e cálculos em PDF ou planilha para análise comparativa.",
        },
        {
          icon: Scale,
          title: "Apoio à impugnação",
          desc: "Organize divergências e confirmações para acelerar o trabalho jurídico.",
        },
        {
          icon: CheckCircle2,
          title: "Menos retrabalho",
          desc: "Reduza conferência manual e ganhe clareza antes de protocolar.",
        },
      ]}
      steps={[
        {
          step: "01",
          title: "Upload da sentença e cálculos",
          desc: "Envie o documento da sentença e os cálculos para análise comparativa.",
        },
        {
          step: "02",
          title: "Orquestração de agentes",
          desc: "Agentes analisam valores, períodos, bases e conformidade com a sentença.",
        },
        {
          step: "03",
          title: "Relatório detalhado",
          desc: "Receba achados, divergências e confirmações organizados.",
        },
        {
          step: "04",
          title: "Histórico salvo",
          desc: "O relatório fica persistente para auditoria e consulta futura.",
        },
      ]}
      differentialTitle="Conferência com profundidade de IA"
      differentialText="Não é só um resumo: é validação orquestrada de sentença contra cálculo, com documentação persistente para o processo."
      differentialPoints={[
        "Agentes de IA em orquestração",
        "Divergências e confirmações claras",
        "Relatório auditável e reutilizável",
      ]}
      faqs={[
        {
          q: "Preciso pagar para testar?",
          a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos para experimentar as ferramentas.",
        },
        {
          q: "O que eu preciso enviar?",
          a: "A sentença judicial e os cálculos (PDF ou planilha) para análise comparativa de conformidade.",
        },
        {
          q: "O que o relatório entrega?",
          a: "Achados com divergências e confirmações, salvos no histórico para consultas futuras.",
        },
        {
          q: "Faz parte do SuitePlus?",
          a: "Sim. Um login no SuitePlus acessa o Impugnador e as demais ferramentas do ecossistema.",
        },
      ]}
      finalTitle={
        <>
          Valide sentença e cálculos <span className="text-primary">com mais velocidade</span>
        </>
      }
      finalText="Crie sua conta, use os 20 créditos de boas-vindas e rode sua primeira análise hoje."
      footerLabel="Impugnador"
    />
  );
}
