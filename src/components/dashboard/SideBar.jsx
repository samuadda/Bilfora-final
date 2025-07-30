"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export const DashboardLayout = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			const { data } = await supabase.auth.getUser();
			if (!data.user) {
				router.push("/login");
			} else {
				setAuthorized(true);
				setLoading(false);
			}
		};
		checkSession();
	}, [router]);

	if (loading) {
		return (
			<div className="w-full h-screen flex items-center justify-center text-sm text-gray-500">
				جاري التحقق من الجلسة...
			</div>
		);
	}

	if (!authorized) return null;

	return (
		<div className="flex bg-indigo-50">
			<Sidebar />
			<div className="w-full">{children}</div>
		</div>
	);
};
