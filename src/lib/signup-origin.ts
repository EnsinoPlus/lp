const STORAGE_KEY = "suiteplus_signup_origem";

function normalizeOriginCode(raw: string | null | undefined): string {
  return (raw ?? "").toString().trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

export function getStoredSignupOrigin(): string {
  if (typeof sessionStorage === "undefined") return "";
  return normalizeOriginCode(sessionStorage.getItem(STORAGE_KEY));
}

export function setStoredSignupOrigin(code: string): string {
  const normalized = normalizeOriginCode(code);
  if (!normalized || typeof sessionStorage === "undefined") return "";
  sessionStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function captureSignupOriginFromSearch(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fromUrl = normalizeOriginCode(params.get("origem") || params.get("src"));
  if (fromUrl) return setStoredSignupOrigin(fromUrl);
  return getStoredSignupOrigin();
}

/**
 * Anexa ?origem=CODIGO a uma URL (absoluta ou relativa), sem sobrescrever se já existir.
 */
export function withSignupOrigin(url: string, originCode?: string): string {
  const code = normalizeOriginCode(originCode || getStoredSignupOrigin());
  if (!code || !url) return url;

  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://suiteplus.ensinoplus.com.br";
    const u = new URL(url, base);
    if (!u.searchParams.get("origem") && !u.searchParams.get("src")) {
      u.searchParams.set("origem", code);
    }

    if (/^https?:\/\//i.test(url)) return u.toString();
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    if (/[?&]origem=/i.test(url) || /[?&]src=/i.test(url)) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}origem=${encodeURIComponent(code)}`;
  }
}

function isSuitePlusHost(hostname: string): boolean {
  return hostname === "suiteplus.ensinoplus.com.br" || hostname.endsWith(".suiteplus.ensinoplus.com.br");
}

/**
 * Intercepta cliques em <a> para propagar origem em:
 * - links para suiteplus.ensinoplus.com.br
 * - navegação interna do próprio site
 */
export function installSignupOriginLinker(): () => void {
  if (typeof document === "undefined") return () => undefined;

  captureSignupOriginFromSearch();

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target as Element | null;
    const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
    if (!anchor || !anchor.href) return;
    if (anchor.hasAttribute("download")) return;
    if ((anchor.getAttribute("target") || "").toLowerCase() === "" && anchor.getAttribute("href")?.startsWith("#")) {
      return;
    }

    const code = getStoredSignupOrigin();
    if (!code) return;

    try {
      const url = new URL(anchor.href);
      const alreadyHas =
        Boolean(url.searchParams.get("origem")) || Boolean(url.searchParams.get("src"));
      if (alreadyHas) return;

      const sameOrigin = url.origin === window.location.origin;
      const toSuitePlus = isSuitePlusHost(url.hostname);
      if (!sameOrigin && !toSuitePlus) return;

      url.searchParams.set("origem", code);
      anchor.href = url.toString();
    } catch {
      // ignore invalid hrefs
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
