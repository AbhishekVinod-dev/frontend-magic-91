/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Set to "1" to ignore Supabase entirely and preview on demo state. */
  readonly VITE_FORCE_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
