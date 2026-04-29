import { useEffect, useState } from "react";

function pad(n: number) { return n.toString().padStart(2, "0"); }

export function UrgencyBar() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 47; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-gradient-urgency text-urgency-foreground py-2.5 px-4 text-center text-sm font-semibold">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>OFERTA DE LANÇAMENTO TERMINA EM:</span>
        <span className="font-mono tabular-nums tracking-wider bg-black/20 rounded px-2 py-0.5">
          {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
        </span>
      </div>
    </div>
  );
}
