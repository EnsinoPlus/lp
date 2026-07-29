import { useEffect, useMemo, useState } from "react";
import {
  captureSignupOriginFromSearch,
  getStoredSignupOrigin,
  installSignupOriginLinker,
  withSignupOrigin,
} from "@/lib/signup-origin";

/** Captura ?origem= na entrada e reescreve links SuitePlus / internos no clique. */
export function useSignupOriginTracker() {
  useEffect(() => {
    captureSignupOriginFromSearch();
    return installSignupOriginLinker();
  }, []);
}

/** URL com origem anexada (reativa ao código capturado). */
export function useTrackedUrl(baseUrl: string): string {
  const [originCode, setOriginCode] = useState(() =>
    typeof window === "undefined" ? "" : getStoredSignupOrigin(),
  );

  useEffect(() => {
    const code = captureSignupOriginFromSearch();
    setOriginCode(code);
  }, []);

  return useMemo(() => withSignupOrigin(baseUrl, originCode), [baseUrl, originCode]);
}
