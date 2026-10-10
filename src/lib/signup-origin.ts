/** Atribuição de cadastro (Google Ads / UTMs) — first-touch em localStorage + cookie. */

export const ATTRIBUTION_STORAGE_KEY = "suiteplus_signup_attribution";
export const ATTRIBUTION_COOKIE_NAME = "suiteplus_signup_attribution";
const ORIGIN_STORAGE_KEY = "suiteplus_signup_origem";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 dias
const MAX_VALUE_LEN = 200;

export const ATTRIBUTION_PARAM_KEYS = [
  "origem",
  "gclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_adgroup_id",
  "utm_creative_id",
  "utm_keyword",
  "utm_matchtype",
  "utm_network",
  "utm_device",
] as const;

export type AttributionParamKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];

export type SignupAttribution = Partial<Record<AttributionParamKey, string>> & {
  landing_page?: string;
  first_seen_at?: string;
  signup_at?: string;
};

const PARAM_ALIASES: Record<string, AttributionParamKey> = {
  src: "origem",
  utm_term: "utm_keyword",
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function normalizeOriginCode(raw: string | null | undefined): string {
  return (raw ?? "").toString().trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
}

function isAdsPlaceholder(value: string): boolean {
  return /^\{[a-z0-9_]+\}$/i.test(value.trim());
}

export function sanitizeAttributionValue(
  key: AttributionParamKey | "landing_page" | "first_seen_at" | "signup_at",
  raw: string | null | undefined,
): string {
  let value = (raw ?? "").toString().trim();
  if (!value || isAdsPlaceholder(value)) return "";

  if (key === "origem") return normalizeOriginCode(value);

  value = value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, MAX_VALUE_LEN);
  return value;
}

export function parseAttributionFromSearch(
  search: string = isBrowser() ? window.location.search : "",
): SignupAttribution {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: SignupAttribution = {};

  for (const [rawKey, rawVal] of params.entries()) {
    const key = (PARAM_ALIASES[rawKey] || rawKey) as AttributionParamKey;
    if (!(ATTRIBUTION_PARAM_KEYS as readonly string[]).includes(key)) continue;
    const cleaned = sanitizeAttributionValue(key, rawVal);
    if (cleaned) out[key] = cleaned;
  }

  return out;
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const host = window.location.hostname;
  const domain =
    host === "ensinoplus.com.br" || host.endsWith(".ensinoplus.com.br")
      ? "; Domain=.ensinoplus.com.br"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}${domain}`;
}

function parseStoredJson(raw: string | null | undefined): SignupAttribution {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as SignupAttribution;
    if (!parsed || typeof parsed !== "object") return {};
    return sanitizeAttributionObject(parsed);
  } catch {
    return {};
  }
}

export function sanitizeAttributionObject(input: unknown): SignupAttribution {
  if (!input || typeof input !== "object") return {};
  const src = input as Record<string, unknown>;
  const out: SignupAttribution = {};

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const cleaned = sanitizeAttributionValue(key, src[key] == null ? "" : String(src[key]));
    if (cleaned) out[key] = cleaned;
  }

  for (const meta of ["landing_page", "first_seen_at", "signup_at"] as const) {
    const cleaned = sanitizeAttributionValue(meta, src[meta] == null ? "" : String(src[meta]));
    if (cleaned) out[meta] = cleaned;
  }

  return out;
}

/** First-touch: preenche só campos vazios. */
export function mergeAttribution(
  existing: SignupAttribution,
  incoming: SignupAttribution,
): SignupAttribution {
  const out: SignupAttribution = { ...existing };
  for (const [k, v] of Object.entries(incoming) as Array<[keyof SignupAttribution, string]>) {
    if (!v) continue;
    if (!out[k]) out[k] = v;
  }
  return out;
}

export function getStoredAttribution(): SignupAttribution {
  if (!isBrowser()) return {};

  const fromLocal = parseStoredJson(localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
  if (Object.keys(fromLocal).length) return fromLocal;

  const fromCookie = parseStoredJson(readCookie(ATTRIBUTION_COOKIE_NAME));
  if (Object.keys(fromCookie).length) return fromCookie;

  const legacyOrigin = normalizeOriginCode(sessionStorage.getItem(ORIGIN_STORAGE_KEY));
  return legacyOrigin ? { origem: legacyOrigin } : {};
}

export function persistAttribution(data: SignupAttribution): SignupAttribution {
  const cleaned = sanitizeAttributionObject(data);
  if (!isBrowser() || !Object.keys(cleaned).length) return cleaned;

  const json = JSON.stringify(cleaned);
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, json);
  } catch {
    // quota / private mode
  }
  writeCookie(ATTRIBUTION_COOKIE_NAME, json);

  if (cleaned.origem) {
    try {
      sessionStorage.setItem(ORIGIN_STORAGE_KEY, cleaned.origem);
    } catch {
      // ignore
    }
  }

  return cleaned;
}

export function captureAttributionFromSearch(
  search: string = isBrowser() ? window.location.search : "",
): SignupAttribution {
  const fromUrl = parseAttributionFromSearch(search);
  const existing = getStoredAttribution();

  let merged = mergeAttribution(existing, fromUrl);

  if (fromUrl.origem) merged = { ...merged, origem: fromUrl.origem };

  if (!merged.first_seen_at && Object.keys(fromUrl).length > 0) {
    merged.first_seen_at = new Date().toISOString();
  }

  if (!merged.landing_page && isBrowser() && Object.keys(fromUrl).length > 0) {
    merged.landing_page = `${window.location.pathname}${window.location.search}`.slice(0, MAX_VALUE_LEN);
  }

  if (Object.keys(merged).length) return persistAttribution(merged);
  return existing;
}

export function getStoredSignupOrigin(): string {
  const attr = getStoredAttribution();
  if (attr.origem) return attr.origem;
  if (!isBrowser()) return "";
  return normalizeOriginCode(sessionStorage.getItem(ORIGIN_STORAGE_KEY));
}

export function setStoredSignupOrigin(code: string): string {
  const normalized = normalizeOriginCode(code);
  if (!normalized) return "";
  const merged = mergeAttribution(getStoredAttribution(), { origem: normalized });
  if (!merged.first_seen_at) merged.first_seen_at = new Date().toISOString();
  persistAttribution(merged);
  return normalized;
}

/**
 * Anexa parâmetros de atribuição à URL (sem sobrescrever query já presente).
 */
export function withSignupAttribution(url: string, attribution?: SignupAttribution): string {
  const data = sanitizeAttributionObject(attribution || getStoredAttribution());
  if (!url || !Object.keys(data).length) return url;

  try {
    const base = isBrowser() ? window.location.origin : "https://suiteplus.ensinoplus.com.br";
    const u = new URL(url, base);

    for (const key of ATTRIBUTION_PARAM_KEYS) {
      const value = data[key];
      if (!value) continue;
      if (key === "origem" && u.searchParams.get("src")) continue;
      if (!u.searchParams.get(key)) u.searchParams.set(key, value);
    }

    if (/^https?:\/\//i.test(url)) return u.toString();
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

/** @deprecated use withSignupAttribution */
export function withSignupOrigin(url: string, originCode?: string): string {
  if (originCode) setStoredSignupOrigin(originCode);
  return withSignupAttribution(url);
}

export function buildAttributionPayload(extra?: SignupAttribution): SignupAttribution | null {
  const data = sanitizeAttributionObject({
    ...getStoredAttribution(),
    ...extra,
    signup_at: new Date().toISOString(),
  });
  return Object.keys(data).length ? data : null;
}

function isSuitePlusHost(hostname: string): boolean {
  return (
    hostname === "suiteplus.ensinoplus.com.br" ||
    hostname.endsWith(".suiteplus.ensinoplus.com.br")
  );
}

export function installSignupAttributionLinker(): () => void {
  if (!isBrowser()) return () => undefined;

  captureAttributionFromSearch();

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target as Element | null;
    const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
    if (!anchor || !anchor.href) return;
    if (anchor.hasAttribute("download")) return;
    if (anchor.hasAttribute("data-url-params-only")) return;

    const data = getStoredAttribution();
    if (!Object.keys(data).length) return;

    try {
      const url = new URL(anchor.href);
      const sameOrigin = url.origin === window.location.origin;
      const toSuitePlus = isSuitePlusHost(url.hostname);
      if (!sameOrigin && !toSuitePlus) return;

      for (const key of ATTRIBUTION_PARAM_KEYS) {
        const value = data[key];
        if (!value) continue;
        if (key === "origem" && url.searchParams.get("src")) continue;
        if (!url.searchParams.get(key)) url.searchParams.set(key, value);
      }
      anchor.href = url.toString();
    } catch {
      // ignore
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

/** Alias legado */
export function installSignupOriginLinker(): () => void {
  return installSignupAttributionLinker();
}

export function captureSignupOriginFromSearch(
  search: string = isBrowser() ? window.location.search : "",
): string {
  const attr = captureAttributionFromSearch(search);
  return attr.origem || getStoredSignupOrigin();
}
