/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORMS_ENDPOINT?: string;
  readonly VITE_SITE_ORIGIN?: string;
  readonly VITE_NIWA_API_KEY?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_DATABASE_URL?: string;
  readonly VITE_CMS_DISABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Set only by Playwright prerender for the SEO dual-content layer. */
  __SEO_PRERENDER__?: boolean;
}
