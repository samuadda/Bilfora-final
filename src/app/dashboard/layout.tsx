"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar, { useSidebar } from "@/components/dashboard/sideBar";
import SidebarProvider from "@/components/dashboard/SidebarProvider";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner"; // ✅ Add global toast provider
import { motion } from "framer-motion"; // optional, for smooth fade-in

interface DashboardLayoutWrapperProps {
	children: ReactNode;
}

// 🧩 Main dashboard content (responsive, RTL-aware)
function DashboardContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<main
			className={`flex-1 p-4 md:p-6 min-h-screen bg-gray-50 transition-all duration-300
				${isCollapsed ? "md:mr-16" : "md:mr-64"} 
				w-full max-w-[100vw] overflow-x-hidden`}
		>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
				className="max-w-7xl mx-auto"
			>
				{children}
			</motion.div>
		</main>
	);
}

// 🔒 Authentication wrapper
function AuthWrapper({ children }: { children: ReactNode }) {
	const [authChecked, setAuthChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// ✅ Check authentication once on mount
	const checkAuth = useCallback(async () => {
		try {
			setIsLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.replace("/login"); // safer than push()
				return;
			}
			setAuthChecked(true);
		} catch (error) {
			console.error("Error checking authentication:", error);
			router.replace("/login");
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		checkAuth();

		// ✅ Real-time auth listener
		const { data: subscription } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (!session) router.replace("/login");
			}
		);

		return () => {
			subscription.subscription.unsubscribe();
		};
	}, [checkAuth, router]);

	// ⏳ Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600" />
					<p className="text-gray-600">جاري التحقق من الهوية...</p>
				</div>
			</div>
		);
	}

	// 🧱 Render dashboard if authenticated
	if (!authChecked) return null;

	return (
		<SidebarProvider>
			<div className="min-h-screen flex flex-col md:flex-row">
				<Sidebar />
				<DashboardContent>{children}</DashboardContent>
			</div>
		</SidebarProvider>
	);
}

// 🌟 Main layout wrapper
export default function DashboardLayoutWrapper({
	children,
}: DashboardLayoutWrapperProps) {
	return (
		<>
			<AuthWrapper>{children}</AuthWrapper>
			<Toaster /> {/* ✅ Global toast support for all dashboard pages */}
		</>
	);
}
