"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar, { useSidebar } from "@/components/dashboard/sideBar";
import SidebarProvider from "@/components/dashboard/SidebarProvider";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner"; 
import { motion } from "framer-motion"; 
import { cn } from "@/lib/utils";

interface DashboardLayoutWrapperProps {
	children: ReactNode;
}

// 🧩 Main dashboard content (responsive, RTL-aware)
function DashboardContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<main
			className={cn(
				"flex-1 min-h-screen bg-[#f8f9fc] transition-all duration-300 w-full max-w-[100vw] overflow-x-hidden",
				isCollapsed ? "md:mr-[80px]" : "md:mr-[280px]"
			)}
		>
            <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-[1600px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </div>
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
				router.replace("/login");
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
			<div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
                <div className="flex flex-col items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mb-4"
                    >
                        <Loader2 className="h-10 w-10 text-[#7f2dfb]" />
                    </motion.div>
					<p className="text-gray-500 font-medium animate-pulse">جاري التحقق من الهوية...</p>
				</div>
			</div>
		);
	}

	// 🧱 Render dashboard if authenticated
	if (!authChecked) return null;

	return (
		<SidebarProvider>
			<div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fc]">
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
			<Toaster />
		</>
	);
}
