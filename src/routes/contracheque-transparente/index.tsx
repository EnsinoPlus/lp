import { createFileRoute } from "@tanstack/react-router";
import { SuiteToolLanding } from "@/components/SuiteToolLanding";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  ShieldCheck,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/contracheque-transparente/")({
  head: () => ({
    meta: [
      {
        title: "ContraCheque Transparente — PDF em planilha para o PJe-Calc | SuitePlus",
      },
      {
        name: "description",
        content:
          "Envie PDFs de contracheques, separe por rubricas e baixe CSV pronto para o PJe-Calc. Teste grátis com 20 créditos no SuitePlus.",
      },
      { property: "og:title", content: "ContraCheque Transparente — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "De PDF de holerites a planilha estruturada para o PJe-Calc, com histórico salvo.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_CONTRACHEQUE_APP_URL?.trim() ||
  "https://contrachequetransparente.ensinoplus.com.br/";

function Landing() {
  return (
    <SuiteToolLanding
      brand="ContraCheque Transparente"
      badge="SuitePlus · ContraCheque Transparente"
      title={
        <>
          PDF de contracheques em <span className="text-primary">planilha do PJe-Calc</span>
        </>
      }
      subtitle="Upload, separação por rubricas e CSV pronto"
      description="Pare de digitar holerites. Envie os PDFs, deixe o sistema organizar por rubrica e período, e baixe a planilha pronta para importar no PJe-Calc — com histórico guardado."
      signupUrl={SIGNUP_URL}
      appUrl={APP_URL}
      appLinkLabel="Acessar ContraCheque Transparente"
      heroHighlights={[
        { icon: Upload, label: "Upload de PDF", sub: "Contracheques do reclamante" },
        { icon: Layers, label: "Por rubricas", sub: "Organização automática" },
        { icon: FileSpreadsheet, label: "CSV PJe-Calc", sub: "Importação direta" },
      ]}
      trustItems={[
        { icon: ShieldCheck, label: "Histórico de relatórios" },
        { icon: FileText, label: "Extração automática" },
        { icon: CheckCircle2, label: "Pronto para PJe-Calc" },
      ]}
      stats={[
        { n: "PDF", l: "Entrada de holerites" },
        { n: "20", l: "Créditos ao cadastrar" },
        { n: "IA", l: "Separação por rubrica" },
        { n: "CSV", l: "Saída para PJe-Calc" },
      ]}
      painTitle="Digitar contracheques é lento e sujeito a erro"
      painText="Listar rubricas, períodos e valores à mão atrasa a liquidação e aumenta o risco de inconsistência. O ContraCheque Transparente transforma PDFs em planilha estruturada em minutos."
      featuresTitle="Do holerite à planilha estruturada"
      features={[
        {
          icon: Upload,
          title: "Upload de PDF",
          desc: "Envie contracheques em PDF. O sistema extrai e organiza por período e rubrica.",
        },
        {
          icon: Layers,
          title: "Separação por rubricas",
          desc: "Cada rubrica é identificada e estruturada para importação no PJe-Calc.",
        },
        {
          icon: History,
          title: "Histórico e relatórios",
          desc: "Consulte, revise ou regenere a planilha sem reprocessar do zero.",
        },
        {
          icon: FileSpreadsheet,
          title: "CSV para PJe-Calc",
          desc: "Download pronto para o fluxo do calculista, sem digitação manual.",
        },
        {
          icon: FileText,
          title: "Clareza para o cliente",
          desc: "Organize verbas com transparência para anexar em peças ou apresentar ao cliente.",
        },
        {
          icon: CheckCircle2,
          title: "Menos retrabalho",
          desc: "Elimine cópia manual de valores e reduza inconsistências no cálculo.",
        },
      ]}
      steps={[
        {
          step: "01",
          title: "Envie os PDFs",
          desc: "Faça upload dos contracheques do reclamante.",
        },
        {
          step: "02",
          title: "Sistema processa",
          desc: "Extração automática e separação por rubricas e períodos.",
        },
        {
          step: "03",
          title: "Revise o resultado",
          desc: "Confira o relatório e o histórico salvo na plataforma.",
        },
        {
          step: "04",
          title: "Baixe o CSV",
          desc: "Importe a planilha no PJe-Calc e siga com a liquidação.",
        },
      ]}
      differentialTitle="Holerites no fluxo do PJe-Calc"
      differentialText="Upload → rubricas → CSV. Um caminho direto do documento do cliente à planilha do cálculo."
      differentialPoints={[
        "PDF de contracheques sem digitação manual",
        "Rubricas organizadas automaticamente",
        "Histórico salvo para consultas futuras",
      ]}
      faqs={[
        {
          q: "Preciso pagar para testar?",
          a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos para experimentar as ferramentas.",
        },
        {
          q: "O que eu envio?",
          a: "PDFs com contracheques do reclamante. O sistema extrai e organiza os dados automaticamente.",
        },
        {
          q: "Serve para o PJe-Calc?",
          a: "Sim. A saída é uma planilha CSV estruturada para importação no PJe-Calc.",
        },
        {
          q: "Faz parte do SuitePlus?",
          a: "Sim. Um login no SuitePlus acessa ContraCheque Transparente e as demais ferramentas.",
        },
      ]}
      finalTitle={
        <>
          Pare de digitar <span className="text-primary">contracheques</span>
        </>
      }
      finalText="Crie sua conta, use os 20 créditos de boas-vindas e processe seus primeiros holerites hoje."
      footerLabel="ContraCheque Transparente"
    />
  );
}
