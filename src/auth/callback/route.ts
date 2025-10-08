import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const supabase = createClient();

	// تبادل الكود بجلسة تسجيل دخول
	const { error } = await supabase.auth.exchangeCodeForSession(
		url.searchParams.get("code") ?? undefined
	);

	if (error) {
		console.error("Auth callback error:", error.message);
		return NextResponse.redirect(new URL("/login?error=auth", request.url));
	}

	// ✅ نجاح — نحوله للداشبورد
	return NextResponse.redirect(new URL("/dashboard", request.url));
}
