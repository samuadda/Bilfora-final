// components/dashboard/DashboardLayout.tsx
"use client";

import Sidebar from "@/components/dashboard/sideBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode,
}) {
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);
	const router = useRouter();

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (!data.user) router.push("/login");
			else {
				setAuthorized(true);
				setLoading(false);
			}
		})();
	}, [router]);

	if (loading)
		return (
			<div className="w-full h-screen flex items-center justify-center">
				جاري التحقق…
			</div>
		);
	if (!authorized) return null;

	return (
		<div className="flex min-h-screen bg-indigo-50">
			<Sidebar />
			<main className="w-full p-6">{children}</main>
		</div>
	);
}
