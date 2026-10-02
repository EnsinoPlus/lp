import { useEffect, useMemo, useState } from "react";
import {
  captureSignupOriginFromSearch,
  getStoredAttribution,
  getStoredSignupOrigin,
  installSignupOriginLinker,
  withSignupAttribution,
} from "@/lib/signup-origin";

/** Captura ?origem= + UTMs/gclid na entrada e reescreve links SuitePlus / internos no clique. */
export function useSignupOriginTracker() {
  useEffect(() => {
    captureSignupOriginFromSearch();
    registrarVisitaLp();
    return installSignupOriginLinker();
  }, []);
}

const VISITOR_KEY = "suiteplus_lp_visitor";

function registrarVisitaLp() {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY) ?? "";
    if (!/^[a-z0-9-]{8,64}$/i.test(visitorId)) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    const attr = getStoredAttribution();
    const url =
      import.meta.env.VITE_SUITEPLUS_VISITA_URL?.trim() ||
      "https://suiteplus.ensinoplus.com.br/api/lp/visita";
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_id: visitorId,
        utm_source: attr.utm_source || "",
        path: window.location.pathname,
      }),
      keepalive: true,
    });
  } catch {
    // visita é best-effort
  }
}

/** URL com atribuição anexada (reativa ao código capturado). */
export function useTrackedUrl(baseUrl: string): string {
  const [originCode, setOriginCode] = useState(() =>
    typeof window === "undefined" ? "" : getStoredSignupOrigin(),
  );
  const [attrVersion, setAttrVersion] = useState(0);

  useEffect(() => {
    const code = captureSignupOriginFromSearch();
    setOriginCode(code);
    setAttrVersion((v) => v + 1);
  }, []);

  return useMemo(
    () => withSignupAttribution(baseUrl, getStoredAttribution()),
    // originCode/attrVersion forçam refresh após captura no mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseUrl, originCode, attrVersion],
  );
}
