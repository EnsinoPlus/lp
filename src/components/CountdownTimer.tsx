import { useEffect, useMemo, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

type Remaining = { d: number; h: number; m: number; s: number; done: boolean };

function computeRemaining(targetMs: number): Remaining {
  let ms = targetMs - Date.now();
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const d = Math.floor(ms / 86_400_000);
  ms -= d * 86_400_000;
  const h = Math.floor(ms / 3_600_000);
  ms -= h * 3_600_000;
  const m = Math.floor(ms / 60_000);
  ms -= m * 60_000;
  const s = Math.floor(ms / 1000);
  return { d, h, m, s, done: false };
}

type CountdownTimerProps = {
  /** Data-alvo em ISO com fuso (ex.: "2026-10-10T06:00:00-03:00"). */
  target: string;
  /** "block" = caixas grandes; "bar" = linha compacta para barra de topo. */
  variant?: "block" | "bar";
  /** Mostra o campo de dias (padrão: só quando >= 1 dia). */
  showDays?: boolean;
  /** Texto exibido quando o contador zera. */
  doneLabel?: string;
  className?: string;
};

export function CountdownTimer({
  target,
  variant = "block",
  showDays,
  doneLabel = "A oferta começou!",
  className = "",
}: CountdownTimerProps) {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [rem, setRem] = useState<Remaining>(() => computeRemaining(targetMs));

  useEffect(() => {
    setRem(computeRemaining(targetMs));
    const id = setInterval(() => setRem(computeRemaining(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const withDays = showDays ?? rem.d > 0;

  if (rem.done) {
    return (
      <span className={`font-bold uppercase tracking-wider ${className}`}>{doneLabel}</span>
    );
  }

  const units: Array<{ value: number; label: string }> = [
    ...(withDays ? [{ value: rem.d, label: "dias" }] : []),
    { value: rem.h, label: "horas" },
    { value: rem.m, label: "min" },
    { value: rem.s, label: "seg" },
  ];

  if (variant === "bar") {
    return (
      <span className={`font-mono tabular-nums tracking-wider bg-black/20 rounded px-2 py-0.5 ${className}`}>
        {withDays ? `${pad(rem.d)}:` : ""}
        {pad(rem.h)}:{pad(rem.m)}:{pad(rem.s)}
      </span>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center bg-white/10 border border-white/20 rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[80px]"
        >
          <span className="text-2xl sm:text-4xl font-black tabular-nums text-white leading-none">
            {pad(u.value)}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/60 mt-1">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Alvos oficiais da campanha 10 do 10 (horário de Brasília, UTC-3). */
export const PROMO_1010_START = "2026-10-10T06:00:00-03:00";
export const PROMO_1010_END = "2026-10-10T23:59:59-03:00";
