/**
 * Default Supabase client (persistent)
 *
 * This is the default client used throughout the app for data fetching.
 * It uses localStorage, so sessions persist across browser restarts.
 *
 * For login, use supabasePersistent or supabaseSession from supabase-clients.ts
 * based on the "Remember me" checkbox.
 */
export { supabasePersistent as supabase } from "./supabase-clients";
