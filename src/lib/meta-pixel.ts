declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaLeadData = {
  eventId: string;
  eventSourceUrl: string;
  fbp?: string;
  fbc?: string;
};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  const value = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : undefined;
}

export function buildMetaPixelHeadScript(pixelId: string) {
  const id = pixelId.trim();
  if (!id) return "";

  return `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init',${JSON.stringify(id)});fbq('track','PageView');`;
}

/** Dispara o mesmo event_id no navegador e na Conversions API para deduplicação. */
export function trackMetaLead(): MetaLeadData | undefined {
  if (typeof window === "undefined" || !window.fbq) return undefined;

  const eventId = crypto.randomUUID();
  window.fbq("track", "Lead", {}, { eventID: eventId });
  return {
    eventId,
    eventSourceUrl: window.location.href,
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc"),
  };
}

/** Eventos de interação usados para acompanhar as etapas do formulário CCT. */
export function trackMetaCustomEvent(eventName: string, parameters?: Record<string, string>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", eventName, parameters);
}
