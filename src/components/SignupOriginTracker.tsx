import { useSignupOriginTracker } from "@/hooks/useSignupOrigin";

/** Monta o rastreador de origem no shell do app (client-side). */
export function SignupOriginTracker() {
  useSignupOriginTracker();
  return null;
}
