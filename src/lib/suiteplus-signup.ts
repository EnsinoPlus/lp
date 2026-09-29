import { getSupabase } from "@/lib/supabase";
import { buildAttributionPayload, getStoredSignupOrigin } from "@/lib/signup-origin";
import { addCctContactToBrevo } from "@/lib/brevo";

const DEFAULT_CREATE_USER_URL =
  "https://suiteplus.ensinoplus.com.br/api/credits/create-user";
const DEFAULT_EMAIL_REDIRECT =
  "https://suiteplus.ensinoplus.com.br/confirm-email";

export type SuitePlusSignupInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  profession?: string;
  /** Fallback when URL/sessionStorage has no origem (ex.: "cct") */
  defaultOrigin?: string;
};

export type SuitePlusSignupResult = {
  email: string;
  originCode: string | null;
};

function resolveOrigin(defaultOrigin?: string): string | null {
  const fromStorage = getStoredSignupOrigin();
  if (fromStorage) return fromStorage;
  const fallback = (defaultOrigin ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return fallback || null;
}

function mapAuthError(message: string): string {
  const map: Record<string, string> = {
    "User already registered": "Este e-mail já está cadastrado",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
    "Unable to validate email address: invalid format": "E-mail inválido",
    "Signup requires a valid password": "Informe uma senha válida",
  };
  return map[message] || message || "Falha ao criar conta";
}

/**
 * Cadastro SuitePlus: Auth (Supabase) + créditos (create-user) + Brevo lista 46.
 * Lista 46: pedida pela LP via brevo_extra_list_ids no create-user (mesma key do login)
 * e também via server fn local (fallback).
 */
const CCT_FUNNEL_LIST_ID = 46;

export async function signupSuitePlus(
  input: SuitePlusSignupInput,
): Promise<SuitePlusSignupResult> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const password = input.password;
  const phone = input.phone?.trim();
  const profession = input.profession?.trim();
  const originCode = resolveOrigin(input.defaultOrigin);
  const attribution = buildAttributionPayload(
    originCode ? { origem: originCode } : undefined,
  );

  if (!fullName) throw new Error("Informe seu nome completo");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Informe um e-mail válido");
  }
  if (password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres");

  const emailRedirectTo =
    import.meta.env.VITE_SUITEPLUS_CONFIRM_EMAIL_URL?.trim() || DEFAULT_EMAIL_REDIRECT;

  const supabase = getSupabase();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        profession,
        signup_origin_code: originCode,
        signup_attribution: attribution,
      },
      emailRedirectTo,
    },
  });

  if (error) throw new Error(mapAuthError(error.message));

  const createUserUrl =
    import.meta.env.VITE_SUITEPLUS_CREATE_USER_URL?.trim() || DEFAULT_CREATE_USER_URL;

  let creditCreated = false;
  for (let attempt = 1; attempt <= 3 && !creditCreated; attempt++) {
    try {
      const resp = await fetch(createUserUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: fullName,
          phone,
          profession,
          signup_origin_code: originCode || undefined,
          signup_attribution: attribution || undefined,
          // LP decide a 46; create-user do login só adiciona se vier no body
          brevo_extra_list_ids: [CCT_FUNNEL_LIST_ID],
        }),
      });
      if (resp.ok) creditCreated = true;
      else if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
    } catch {
      if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  if (!creditCreated) {
    console.error("[suiteplus-signup] Falha ao criar créditos para:", email);
  }

  try {
    const brevo = await addCctContactToBrevo({ data: { email, name: fullName } });
    if (!brevo?.ok) {
      console.error("[suiteplus-signup] Brevo lista 46 (LP) não adicionada:", brevo);
    }
  } catch (err) {
    console.error("[suiteplus-signup] Falha ao adicionar à Brevo lista 46:", err);
  }

  return { email, originCode };
}
