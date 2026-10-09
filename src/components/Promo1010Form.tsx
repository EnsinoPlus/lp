import { useRef, useState } from "react";
import { Loader2, Lock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPromo1010Lead } from "@/lib/promo1010-lead";
import { upsertPromo1010Lead } from "@/lib/promo1010-supabase";
import { trackMetaCustomEvent, trackMetaLead } from "@/lib/meta-pixel";
import { sendMetaLead } from "@/lib/meta-conversions";
import { getStoredAttribution, withSignupAttribution } from "@/lib/signup-origin";

/** Captura TODOS os parâmetros presentes na URL (não só os de marketing). */
function readAllUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    const sp = new URLSearchParams(window.location.search);
    for (const [k, v] of sp.entries()) {
      if (!k) continue;
      out[k.slice(0, 100)] = String(v).slice(0, 500);
    }
  } catch {
    // ignore
  }
  return out;
}

type Mode = "lead" | "checkout";

type Promo1010FormProps = {
  /** "lead" (página 1): coleta nome+email+whatsapp e mostra agradecimento.
   *  "checkout" (V2): coleta email+whatsapp, libera e redireciona ao checkout com ?email=. */
  mode: Mode;
  /** Obrigatório no modo checkout. */
  checkoutUrl?: string;
  cta?: string;
  className?: string;
};

export function Promo1010Form({ mode, checkoutUrl, cta, className = "" }: Promo1010FormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firedPartial = useRef(false);

  const isLead = mode === "lead";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const nameOk = !isLead || name.trim().length >= 2;
  const canSubmit = !submitting && emailOk && phoneOk && nameOk;

  const stage = isLead ? "page1" : "checkout";
  const meta = () => {
    const attribution = getStoredAttribution();
    const urlParams = readAllUrlParams();
    return {
      attribution: Object.keys(attribution).length ? attribution : undefined,
      params: Object.keys(urlParams).length ? urlParams : undefined,
      landingPage:
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`.slice(0, 300)
          : undefined,
    };
  };

  /** Salva parcial o que já tiver (email e/ou WhatsApp). Best-effort, não bloqueia. */
  const savePartial = () => {
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const hasPhone = phone.replace(/\D/g, "").length >= 10;
    if (!hasEmail && !hasPhone) return;
    void upsertPromo1010Lead({
      stage,
      status: "parcial",
      name: name.trim() || undefined,
      email: hasEmail ? email.trim().toLowerCase() : undefined,
      phone: hasPhone ? phone.trim() : undefined,
      ...meta(),
    });
    // Pixel Ensino Plus: cadastro parcial (uma vez por sessão do form).
    if (!firedPartial.current) {
      firedPartial.current = true;
      trackMetaCustomEvent("CadastroParcial", { etapa: stage });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Preencha nome, e-mail e WhatsApp corretamente.");
      return;
    }
    setSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const attribution = getStoredAttribution();
    const m = meta();

    // 1) Grava COMPLETO no banco direto do navegador (caminho confiável).
    const savedToDb = await upsertPromo1010Lead({
      stage,
      status: "completo",
      name: name.trim() || undefined,
      email: cleanEmail,
      phone: phone.trim() || undefined,
      ...m,
    });

    // 2) Dispara Brevo + n8n via server fn (best-effort; não bloqueia).
    void registerPromo1010Lead({
      data: {
        stage,
        name: name.trim() || undefined,
        email: cleanEmail,
        phone: phone.trim() || undefined,
        attribution: m.attribution,
        params: m.params,
        landingPage: m.landingPage,
      },
    }).catch(() => undefined);

    // No modo lead, se nem o banco salvou, avisa; no checkout, segue pro checkout.
    if (isLead && !savedToDb) {
      setError("Não foi possível enviar agora. Tente novamente em instantes.");
      setSubmitting(false);
      return;
    }

    // Pixel Ensino Plus: cadastro completo + Lead padrão da Meta (browser + Conversions API).
    trackMetaCustomEvent("CadastroCompleto", { etapa: stage });
    const metaLead = trackMetaLead();
    if (metaLead) {
      void sendMetaLead({ data: { email: cleanEmail, ...metaLead } }).catch(() => undefined);
    }

    if (!isLead && checkoutUrl) {
      const sep = checkoutUrl.includes("?") ? "&" : "?";
      const base = `${checkoutUrl}${sep}email=${encodeURIComponent(cleanEmail)}`;
      window.location.href = withSignupAttribution(base, attribution);
      return;
    }

    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div
        className={`rounded-2xl bg-white/10 border-2 border-success/50 p-6 text-center ${className}`}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success">
          <Zap className="h-6 w-6" />
        </div>
        <p className="text-lg font-black text-white">Cadastro confirmado! 🎉</p>
        <p className="mt-2 text-sm text-white/70">
          Você vai receber no e-mail e no WhatsApp o aviso assim que a oferta 10 do 10 abrir — às 6h
          do dia 10/10.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 text-left ${className}`} noValidate>
      {isLead && (
        <div className="space-y-2">
          <Label htmlFor="p1010-name" className="text-white/90">
            Nome completo
          </Label>
          <Input
            id="p1010-name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
            autoComplete="name"
            className="h-11 bg-white/95 border-white/20 text-slate-900 placeholder:text-slate-400"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="p1010-email" className="text-white/90">
          E-mail
        </Label>
        <Input
          id="p1010-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={savePartial}
          required
          disabled={submitting}
          autoComplete="email"
          className="h-11 bg-white/95 border-white/20 text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="p1010-phone" className="text-white/90">
          WhatsApp
        </Label>
        <Input
          id="p1010-phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={savePartial}
          required
          disabled={submitting}
          autoComplete="tel"
          className="h-11 bg-white/95 border-white/20 text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm rounded-lg px-3 py-2 bg-red-500/20 text-red-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all animate-pulse-cta disabled:opacity-60 disabled:pointer-events-none h-12 px-6"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {isLead ? "Enviando..." : "Liberando..."}
          </>
        ) : (
          <>
            {isLead ? <Zap className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            {cta ?? (isLead ? "Quero ser avisado no 10/10" : "Liberar oferta — R$ 200")}
          </>
        )}
      </button>

      <p className="text-center text-xs text-white/50">
        {isLead
          ? "Avisamos por e-mail e WhatsApp quando a oferta abrir. Sem spam."
          : "Seus dados liberam o acesso à oferta e agilizam o checkout."}
      </p>
    </form>
  );
}
