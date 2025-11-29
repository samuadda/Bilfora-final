import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Expected Supabase URL
const EXPECTED_URL = "https://pjiwbmrmqnpppwyfmiev.supabase.co";

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		"Missing Supabase environment variables. Please check your .env.local file."
	);
}

// Verify URL matches expected value (server-side only logs to console)
if (supabaseUrl !== EXPECTED_URL) {
	console.warn(
		`⚠️ Supabase URL mismatch!\n` +
			`Expected: ${EXPECTED_URL}\n` +
			`Found: ${supabaseUrl}\n` +
			`Please update your .env.local file.`
	);
}

export const createClient = async () => {
	const cookieStore = await cookies();
	return createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					try {
						cookieStore.set(name, value, options);
						console.log(`Set cookie: ${name}`);
					} catch (error) {
						console.error(`Failed to set cookie ${name}:`, error);
					}
				});
			},
		},
	});
};
