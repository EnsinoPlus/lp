import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/supabase";
import { signupSuitePlus } from "@/lib/suiteplus-signup";
import { trackMetaCustomEvent, trackMetaLead } from "@/lib/meta-pixel";
import { sendMetaLead } from "@/lib/meta-conversions";

const QUALIFIED_PROFESSIONS = [
  "Advogado(a)",
  "Perito(a)",
  "Contador(a)",
  "Estudante",
  "Empresário(a)",
] as const;
const OTHER_PROFESSION = "Outro";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: (v: string) => void;
  disabled: boolean;
  dark?: boolean;
};

function PasswordField({ id, label, value, onChange, onBlur, disabled, dark }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={dark ? "text-white/90" : "text-foreground"}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          required
          disabled={disabled}
          minLength={6}
          placeholder="••••••••"
          autoComplete="new-password"
          className={`h-11 pr-10 ${dark ? "bg-white/95 border-white/20 text-slate-900" : "bg-background"}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
          aria-label={show ? "Ocultar senha" : "Exibir senha"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

type CctSignupFormProps = {
  /** Visual no hero escuro */
  variant?: "hero" | "card";
  className?: string;
};

export function CctSignupForm({ variant = "card", className = "" }: CctSignupFormProps) {
  const navigate = useNavigate();
  const dark = variant === "hero";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trackedFields = useRef(new Set<string>());

  const trackField = (eventName: string, value: string) => {
    if (!value.trim() || trackedFields.current.has(eventName)) return;
    trackedFields.current.add(eventName);
    trackMetaCustomEvent(eventName);
  };

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    isSupabaseConfigured() &&
    !isSubmitting &&
    password.length >= 6 &&
    passwordsMatch &&
    fullName.trim() &&
    email.trim() &&
    phone.trim() &&
    profession &&
    (profession !== OTHER_PROFESSION || otherProfession.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError("As senhas não coincidem");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Cadastro indisponível no momento. Tente novamente em instantes.");
      return;
    }

    setIsSubmitting(true);
    trackMetaCustomEvent("CriarConta");
    try {
      await signupSuitePlus({
        email,
        password,
        fullName,
        phone,
        profession: profession === OTHER_PROFESSION ? otherProfession : profession,
        defaultOrigin: "cct",
        emailRedirectTo: `${window.location.origin}/cct/obrigado`,
      });
      const metaLead = trackMetaLead();
      if (metaLead) {
        void sendMetaLead({ data: { email, ...metaLead } });
      }
      trackMetaCustomEvent(
        profession === OTHER_PROFESSION ? "LeadDesqualificado" : "LeadQualificado",
        { profissao: profession },
      );
      await navigate({ to: "/cct/obrigado" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha ao criar conta";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = dark
    ? "h-11 bg-white/95 border-white/20 text-slate-900 placeholder:text-slate-400"
    : "h-11 bg-background";

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 text-left ${className}`} noValidate>
      {!isSupabaseConfigured() && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${dark ? "bg-amber-500/20 text-amber-100" : "bg-amber-50 text-amber-800"}`}
        >
          Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o cadastro.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="cct-fullName" className={dark ? "text-white/90" : undefined}>
          Nome completo
        </Label>
        <Input
          id="cct-fullName"
          type="text"
          placeholder="Seu nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={(e) => trackField("NomePreenchido", e.target.value)}
          required
          disabled={isSubmitting}
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cct-email" className={dark ? "text-white/90" : undefined}>
          E-mail
        </Label>
        <Input
          id="cct-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cct-phone" className={dark ? "text-white/90" : undefined}>
          WhatsApp
        </Label>
        <Input
          id="cct-phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={(e) => trackField("WhatsAppPreenchido", e.target.value)}
          required
          disabled={isSubmitting}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cct-profession" className={dark ? "text-white/90" : undefined}>
          Profissão *
        </Label>
        <select
          id="cct-profession"
          value={profession}
          onChange={(e) => {
            setProfession(e.target.value);
            if (e.target.value !== OTHER_PROFESSION) setOtherProfession("");
          }}
          disabled={isSubmitting}
          required
          className={`${inputClass} w-full rounded-md border px-3 text-sm`}
        >
          <option value="">Selecione</option>
          {QUALIFIED_PROFESSIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value={OTHER_PROFESSION}>{OTHER_PROFESSION}</option>
        </select>
      </div>

      {profession === OTHER_PROFESSION && (
        <div className="space-y-2">
          <Label htmlFor="cct-other-profession" className={dark ? "text-white/90" : undefined}>
            Qual é a sua profissão? *
          </Label>
          <Input
            id="cct-other-profession"
            type="text"
            placeholder="Digite sua profissão"
            value={otherProfession}
            onChange={(e) => setOtherProfession(e.target.value)}
            onBlur={(e) => trackField("ProfissaoPreenchida", e.target.value)}
            disabled={isSubmitting}
            required
            autoComplete="organization-title"
            className={inputClass}
          />
        </div>
      )}

      <PasswordField
        id="cct-password"
        label="Senha"
        value={password}
        onChange={setPassword}
        onBlur={(value) => trackField("SenhaPreenchida", value)}
        disabled={isSubmitting}
        dark={dark}
      />

      <PasswordField
        id="cct-confirmPassword"
        label="Confirmar senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        disabled={isSubmitting}
        dark={dark}
      />

      {confirmPassword.length > 0 && (
        <p className={`text-xs font-medium ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
          {passwordsMatch ? "✓ As senhas coincidem" : "✗ As senhas não coincidem"}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className={`text-sm rounded-lg px-3 py-2 ${dark ? "bg-red-500/20 text-red-100" : "bg-red-50 text-red-700"}`}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-bold uppercase tracking-wide shadow-cta hover:brightness-110 transition-all disabled:opacity-60 disabled:pointer-events-none h-12 px-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            Criar minha conta
          </>
        )}
      </button>

      <p className={`text-center text-xs ${dark ? "text-white/50" : "text-muted-foreground"}`}>
        Ao criar a conta você receberá um e-mail para confirmar o cadastro.
      </p>
    </form>
  );
}
