import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase URL or Anon Key");
}

/**
 * Persistent client → uses localStorage (default)
 * Sessions persist across browser restarts
 */
export const supabasePersistent = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
});

/**
 * Session client → uses sessionStorage
 * Sessions only last for the browser session
 */
export const supabaseSession = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage: typeof window === "undefined" ? undefined : window.sessionStorage,
	},
});

