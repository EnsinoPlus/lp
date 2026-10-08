import { useState } from "react";
import { Loader2, Lock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPromo1010Lead } from "@/lib/promo1010-lead";
import { getStoredAttribution, withSignupAttribution } from "@/lib/signup-origin";

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

  const isLead = mode === "lead";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const nameOk = !isLead || name.trim().length >= 2;
  const canSubmit = !submitting && emailOk && phoneOk && nameOk;

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

    try {
      await registerPromo1010Lead({
        data: {
          stage: isLead ? "page1" : "checkout",
          name: name.trim() || undefined,
          email: cleanEmail,
          phone: phone.trim() || undefined,
          attribution: Object.keys(attribution).length ? attribution : undefined,
        },
      });
    } catch (err) {
      // Best-effort: no checkout, não bloqueia a venda; no lead, mostra erro.
      if (isLead) {
        setError(err instanceof Error ? err.message : "Não foi possível enviar. Tente novamente.");
        setSubmitting(false);
        return;
      }
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
