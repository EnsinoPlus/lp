/**
 * Origem da visita no funil do Calc Machine Connect (anúncio do Meta, UTMs etc.).
 * Quem clica no anúncio e volta depois sem os parâmetros na URL continua com a origem certa.
 * A URL atual, quando traz algum parâmetro, substitui a anterior inteira: origens não se misturam.
 */

const STORAGE_KEY = "cmc_atribuicao";
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;

const ehParametroDeOrigem = (k: string) => /^(utm_.+|fbclid|gclid|placement|ad)$/i.test(k);

export function cmcAtribuicao(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const daUrl: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (v && ehParametroDeOrigem(k)) daUrl[k.toLowerCase()] = v.slice(0, 500);
  });
  try {
    if (Object.keys(daUrl).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ em: Date.now(), dados: daUrl }));
      return daUrl;
    }
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as {
      em?: number;
      dados?: Record<string, string>;
    } | null;
    if (salvo?.dados && Date.now() - (salvo.em || 0) < VALIDADE_MS) return salvo.dados;
  } catch {
    // sem localStorage: fica só com a URL
  }
  return daUrl;
}
