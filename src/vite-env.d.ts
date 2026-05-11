/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do checkout Hotmart (pagamento não é hospedado neste projeto). */
  readonly VITE_CHECKOUT_URL?: string;
  /** ID do Google Tag Manager, ex.: GTM-ABC1234 */
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
