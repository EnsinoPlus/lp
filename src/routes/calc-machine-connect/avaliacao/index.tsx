import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { recordCmcAvaliacao, uploadCmcAvaliacaoMedia } from "@/lib/cmc-avaliacao-db";

// Página de avaliação do Calc Machine Connect: quem está no teste grátis deixa um
// depoimento (texto obrigatório, foto/vídeo opcional, nota 1–5) e ganha +1 dia.
// A liberação do dia é manual: a equipe vê no painel interno e libera na plataforma.

export const Route = createFileRoute("/calc-machine-connect/avaliacao/")({
  head: () => ({
    meta: [
      { title: "Avalie o Calc Machine Connect e ganhe +1 dia grátis" },
      {
        name: "description",
        content:
          "Deixe sua avaliação do Calc Machine Connect e ganhe mais 1 dia de teste grátis. Leva menos de 1 minuto.",
      },
    ],
  }),
  component: Avaliacao,
});

const MAX_MB = 50;

function Avaliacao() {
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [depoimento, setDepoimento] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);

  const onArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > MAX_MB * 1024 * 1024) {
      setErro(`A mídia tem mais de ${MAX_MB}MB. Escolha um arquivo menor.`);
      e.target.value = "";
      setArquivo(null);
      return;
    }
    setErro("");
    setArquivo(f);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (nota < 1) return setErro("Escolha de 1 a 5 estrelas.");
    if (depoimento.trim().length < 3) return setErro("Escreva seu depoimento (é obrigatório).");
    if (!email.trim()) return setErro("Informe o e-mail da sua conta (para liberarmos o dia).");
    setEnviando(true);
    try {
      let mediaUrl: string | null = null;
      let mediaTipo: string | null = null;
      if (arquivo) {
        const up = await uploadCmcAvaliacaoMedia(arquivo);
        mediaUrl = up.url;
        mediaTipo = up.tipo;
      }
      await recordCmcAvaliacao({
        nome: nome.trim(),
        email: email.trim(),
        nota,
        depoimento: depoimento.trim(),
        mediaUrl,
        mediaTipo,
      });
      setPronto(true);
    } catch (err) {
      setErro(
        err instanceof Error && /upload/i.test(err.message)
          ? "Não consegui enviar a foto/vídeo. Tente um arquivo menor ou envie só o texto."
          : "Não consegui enviar sua avaliação. Tente de novo em instantes.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#0F1F1A]">
      <div className="bg-[#E8552B] text-white text-center font-extrabold uppercase tracking-wide text-sm py-3 px-4">
        🎁 Avalie e ganhe +1 dia de teste grátis
      </div>

      <main className="max-w-xl mx-auto px-4 py-10">
        <header className="mb-8">
          <img
            src="/calc-machine-connect/logo.svg"
            alt="Calc Machine Connect"
            className="h-9 w-auto mb-6"
            onError={(ev) => {
              (ev.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <h1 className="text-3xl font-extrabold leading-tight">
            Como foi usar o <span className="text-[#E8552B]">Calc Machine Connect</span>?
          </h1>
          <p className="mt-3 text-[#5C6B64]">
            Deixe sua avaliação e <strong>ganhe +1 dia</strong> de teste grátis. Leva menos de 1
            minuto. Depois a gente libera o dia na sua conta.
          </p>
        </header>

        {pronto ? (
          <div className="rounded-2xl bg-white border border-[#d9d3c4] p-6">
            <strong className="text-[#1b7a46] text-lg">Avaliação recebida. Obrigado! 🎉</strong>
            <p className="mt-2 text-[#5C6B64]">
              Vamos liberar <strong>+1 dia</strong> de teste grátis na conta de{" "}
              <strong>{email}</strong> em breve. Fica de olho — e bom cálculo!
            </p>
            <a
              href="/calc-machine-connect"
              className="inline-block mt-5 rounded-xl bg-[#E8552B] text-white font-bold px-5 py-3"
            >
              Voltar para o Calc Machine Connect
            </a>
          </div>
        ) : (
          <form onSubmit={enviar} className="rounded-2xl bg-white border border-[#d9d3c4] p-6 space-y-5">
            <div>
              <label className="block font-semibold mb-2">Sua nota</label>
              <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                    onClick={() => setNota(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="text-4xl leading-none transition"
                    style={{ color: (hover || nota) >= n ? "#E8552B" : "#d9d3c4" }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="dep" className="block font-semibold mb-2">
                Seu depoimento <span className="text-[#E8552B]">*</span>
              </label>
              <textarea
                id="dep"
                required
                minLength={3}
                value={depoimento}
                onChange={(e) => setDepoimento(e.target.value)}
                placeholder="O que você achou? O que o Calc Machine Connect te ajudou a resolver?"
                className="w-full min-h-[120px] p-3 rounded-xl border border-[#d9d3c4] bg-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#E8552B]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block font-semibold mb-2">
                  Seu nome
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  className="w-full p-3 rounded-xl border border-[#d9d3c4] bg-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#E8552B]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block font-semibold mb-2">
                  E-mail da conta <span className="text-[#E8552B]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="o mesmo e-mail do teste"
                  className="w-full p-3 rounded-xl border border-[#d9d3c4] bg-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#E8552B]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="midia" className="block font-semibold mb-2">
                Foto ou vídeo <span className="text-[#5C6B64] font-normal">(opcional)</span>
              </label>
              <input
                id="midia"
                type="file"
                accept="image/*,video/*"
                onChange={onArquivo}
                className="w-full text-sm text-[#5C6B64] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F1F1A] file:text-white file:px-4 file:py-2 file:font-semibold file:cursor-pointer"
              />
              {arquivo && (
                <p className="mt-1 text-sm text-[#5C6B64]">
                  Selecionado: {arquivo.name} ({(arquivo.size / 1024 / 1024).toFixed(1)}MB)
                </p>
              )}
            </div>

            {erro && (
              <p role="alert" className="text-[#c0361a] font-medium">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-[#E8552B] text-white font-bold py-3.5 disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar avaliação e ganhar +1 dia"}
            </button>
            <p className="text-xs text-[#5C6B64] text-center">
              Use o mesmo e-mail da sua conta de teste para a gente liberar o dia certo.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
