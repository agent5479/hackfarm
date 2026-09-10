/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORMS_ENDPOINT?: string;
  readonly VITE_SITE_ORIGIN?: string;
  readonly VITE_NIWA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
