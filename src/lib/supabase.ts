import { cookieStorage, isEnsinoPlusDomain } from "@/lib/supabase-cookie-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Remove aspas acidentais do .env (`"https://..."`). */
function cleanEnv(value: string | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).trim() || undefined;
  }
  return v;
}

function readSupabaseUrl(): string | undefined {
  return (
    cleanEnv(import.meta.env.VITE_SUPABASE_URL) ||
    cleanEnv(typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined)
  );
}

function readSupabaseAnonKey(): string | undefined {
  return (
    cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    cleanEnv(typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined)
  );
}

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(readSupabaseUrl() && readSupabaseAnonKey());
}

export function getSupabase(): SupabaseClient {
  const url = readSupabaseUrl();
  const anonKey = readSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      "Configuração incompleta: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (e no build Docker/Easypanel)",
    );
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        storage: isEnsinoPlusDomain ? cookieStorage : undefined,
      },
    });
  }

  return client;
}
