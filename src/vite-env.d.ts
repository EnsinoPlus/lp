/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do checkout Hotmart (pagamento não é hospedado neste projeto). */
  readonly VITE_CHECKOUT_URL?: string;
  /** SuitePlus — cadastro único (créditos de boas-vindas) */
  readonly VITE_SUITEPLUS_SIGNUP_URL?: string;
  /** Ponto Mágico (SuitePlus) — cadastro e app */
  readonly VITE_PONTO_MAGICO_SIGNUP_URL?: string;
  readonly VITE_PONTO_MAGICO_APP_URL?: string;
  /** Apps das ferramentas SuitePlus */
  readonly VITE_CALC_MACHINE_APP_URL?: string;
  readonly VITE_CHAT_CCT_APP_URL?: string;
  readonly VITE_CONTRACHEQUE_APP_URL?: string;
  readonly VITE_EXTRATOR_AUSENCIAS_APP_URL?: string;
  readonly VITE_FGTS_FACIL_APP_URL?: string;
  readonly VITE_IMPUGNADOR_APP_URL?: string;
  /** Promo SuitePlus — preferir leitura runtime via getCreditsCheckoutUrl(); VITE_ só para docs/dev */
  readonly VITE_SUITEPLUS_CREDITS_CHECKOUT_URL?: string;
  /** Livro físico — preferir getBookCheckoutUrl() em runtime */
  readonly VITE_SUITEPLUS_BOOK_CHECKOUT_URL?: string;
  /** ID do Google Tag Manager, ex.: GTM-ABC1234 */
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
