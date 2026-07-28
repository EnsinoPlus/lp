import { createFileRoute } from "@tanstack/react-router";
import { SuiteToolLanding } from "@/components/SuiteToolLanding";
import {
  BookOpen,
  CheckCircle2,
  Database,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/chat-cct/")({
  head: () => ({
    meta: [
      {
        title: "Chat CCT — Tire dúvidas de cálculos trabalhistas com IA | SuitePlus",
      },
      {
        name: "description",
        content:
          "IA conversacional que responde com fontes exclusivas e rastreáveis. Sem alucinações genéricas. Teste grátis com 20 créditos no SuitePlus.",
      },
      { property: "og:title", content: "Chat CCT — Ensino Plus SuitePlus" },
      {
        property: "og:description",
        content:
          "Assistente de cálculos trabalhistas com bases verificadas e respostas citáveis.",
      },
    ],
  }),
  component: Landing,
});

const SIGNUP_URL =
  import.meta.env.VITE_SUITEPLUS_SIGNUP_URL?.trim() || "https://suiteplus.ensinoplus.com.br/";
const APP_URL =
  import.meta.env.VITE_CHAT_CCT_APP_URL?.trim() || "https://chat.ensinoplus.com.br/";

function Landing() {
  return (
    <SuiteToolLanding
      brand="Chat CCT"
      badge="SuitePlus · Chat CCT"
      title={
        <>
          Tire dúvidas sobre <span className="text-primary">cálculos trabalhistas</span>
        </>
      }
      subtitle="IA conversacional com fontes exclusivas e rastreáveis"
      description="Converse como com um especialista. O Chat CCT pesquisa em bases verificadas — sem inventar respostas — e entrega respostas contextualizadas para o dia a dia do calculista."
      signupUrl={SIGNUP_URL}
      appUrl={APP_URL}
      appLinkLabel="Acessar Chat CCT"
      heroHighlights={[
        { icon: MessageSquare, label: "Conversa natural", sub: "Pergunte em linguagem clara" },
        { icon: Database, label: "Fontes exclusivas", sub: "Bases verificadas" },
        { icon: Search, label: "Respostas citáveis", sub: "Rastreáveis até a origem" },
      ]}
      trustItems={[
        { icon: ShieldCheck, label: "Sem alucinações genéricas" },
        { icon: BookOpen, label: "Fontes rastreáveis" },
        { icon: Sparkles, label: "Foco trabalhista" },
      ]}
      stats={[
        { n: "IA", l: "Assistente dedicado" },
        { n: "20", l: "Créditos ao cadastrar" },
        { n: "100%", l: "Fontes rastreáveis" },
        { n: "CCT", l: "Contexto de cálculos" },
      ]}
      painTitle="Dúvidas técnicas atrasam o cálculo e o laudo"
      painText="Buscar doutrina genérica ou confiar em IAs abertas pode gerar respostas imprecisas. O Chat CCT é um assistente independente, focado em cálculos trabalhistas, com pesquisa em fontes exclusivas."
      featuresTitle="Um assistente que não inventa resposta"
      features={[
        {
          icon: Database,
          title: "Pesquisa em fontes exclusivas",
          desc: "Responde com bases verificadas. Cada resposta é rastreável até a origem.",
        },
        {
          icon: MessageSquare,
          title: "Tira dúvidas em tempo real",
          desc: "Descreva cenários, envie contexto e faça perguntas específicas do seu caso.",
        },
        {
          icon: Search,
          title: "Respostas com confiança",
          desc: "Sem inventar dados. Ideal para apoiar laudos e decisões técnicas.",
        },
        {
          icon: ShieldCheck,
          title: "Segurança",
          desc: "Tráfego protegido e histórico com controle por usuário no SuitePlus.",
        },
        {
          icon: BookOpen,
          title: "Contexto trabalhista",
          desc: "Pensado para rotinas de cálculo, liquidação e rotinas do CCT.",
        },
        {
          icon: CheckCircle2,
          title: "Independente",
          desc: "Assistente conversacional dedicado — sem amarrar ao fluxo de outras ferramentas.",
        },
      ]}
      steps={[
        {
          step: "01",
          title: "Faça a pergunta",
          desc: "Descreva a dúvida sobre cálculos trabalhistas e inclua o contexto necessário.",
        },
        {
          step: "02",
          title: "Receba resposta confiável",
          desc: "O Chat CCT pesquisa nas fontes exclusivas e retorna a resposta com rastreabilidade.",
        },
        {
          step: "03",
          title: "Aprofunde o cenário",
          desc: "Refine a pergunta, peça exemplos e valide o entendimento antes de aplicar no caso.",
        },
        {
          step: "04",
          title: "Use com segurança",
          desc: "Leve o raciocínio para o laudo ou para a próxima etapa do cálculo com mais clareza.",
        },
      ]}
      differentialTitle="IA conversacional feita para o calculista"
      differentialText="Não é um chatbot genérico. É um assistente do ecossistema Ensino Plus, com foco em precisão e fontes confiáveis."
      differentialPoints={[
        "Fontes exclusivas e rastreáveis",
        "Linguagem natural para dúvidas técnicas",
        "Integrado ao login único do SuitePlus",
      ]}
      faqs={[
        {
          q: "Preciso pagar para testar?",
          a: "Não para começar. Ao criar conta no SuitePlus você recebe 20 créditos para experimentar as ferramentas.",
        },
        {
          q: "O Chat CCT inventa respostas?",
          a: "Ele é orientado a pesquisar em bases exclusivas e rastreáveis, reduzindo respostas genéricas sem fundamento.",
        },
        {
          q: "Substitui o CCT 2026?",
          a: "Não. Chat CCT é a ferramenta de IA para tirar dúvidas. CCT 2026 é a plataforma de cursos em vídeo e trilhas.",
        },
        {
          q: "Faz parte do SuitePlus?",
          a: "Sim. Um login no SuitePlus acessa Chat CCT e as demais ferramentas do ecossistema.",
        },
      ]}
      finalTitle={
        <>
          Tire dúvidas com <span className="text-primary">fontes confiáveis</span>
        </>
      }
      finalText="Crie sua conta, use os 20 créditos de boas-vindas e faça sua primeira pergunta hoje."
      footerLabel="Chat CCT"
    />
  );
}
