import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `null` when the project has no credentials configured, so the UI can fall
 * back to its local demo state instead of throwing on import.
 */
/**
 * Validate the shape of the URL rather than just checking it is non-empty.
 *
 * A mis-pasted project key in the URL slot (or vice versa) makes every string
 * truthy while `createClient` throws `Invalid supabaseUrl` at module load, which
 * takes the whole app down. Validating here means a bad `.env` degrades to demo
 * state instead of a blank screen.
 */
function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * `false` when the project has no usable credentials, so the UI can fall back to
 * its local demo state instead of throwing on import. Set `VITE_FORCE_DEMO=1` to
 * ignore Supabase entirely when previewing offline.
 */
export const isSupabaseConfigured: boolean =
  isValidSupabaseUrl(url) && Boolean(anonKey) && import.meta.env.VITE_FORCE_DEMO !== "1";

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;

/** Narrowing helper for call sites that require a live client. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local",
    );
  }
  return supabase;
}

/** Human-readable reason the live feed is unavailable, for UI messaging. */
export function supabaseConfigProblem(): string | null {
  if (import.meta.env.VITE_FORCE_DEMO === "1") return "Demo mode forced by VITE_FORCE_DEMO=1.";
  if (!url && !anonKey) return "No Supabase credentials found in .env.local.";
  if (!isValidSupabaseUrl(url)) {
    return "VITE_SUPABASE_URL is not a valid https:// URL. Check that the URL and key are not swapped.";
  }
  if (!anonKey) return "VITE_SUPABASE_ANON_KEY is missing.";
  return null;
}
