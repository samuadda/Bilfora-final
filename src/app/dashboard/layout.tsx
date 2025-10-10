"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar, { useSidebar } from "../../components/dashboard/sideBar";
import SidebarProvider from "../../components/dashboard/SidebarProvider";
import { Loader2 } from "lucide-react";

interface DashboardLayoutWrapperProps {
	children: ReactNode;
}

// Component that uses the sidebar context
function DashboardContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<main
			className={`flex-1 p-4 md:p-6 min-h-screen bg-gray-50 transition-all duration-300
				${isCollapsed ? "md:mr-16" : "md:mr-64"} 
				w-full max-w-[100vw] overflow-x-hidden`}
		>
			<div className="max-w-7xl mx-auto">{children}</div>
		</main>
	);
}

// Authentication wrapper component
function AuthWrapper({ children }: { children: ReactNode }) {
	const [authChecked, setAuthChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			setIsLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				// User is not authenticated, redirect to login
				router.push("/login");
				return;
			}

			// User is authenticated, allow access to dashboard
			setAuthChecked(true);
		} catch (error) {
			console.error("Error checking authentication:", error);
			// On error, redirect to login for safety
			router.push("/login");
		} finally {
			setIsLoading(false);
		}
	};

	// Show loading spinner while checking authentication
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

	// Only render dashboard if user is authenticated
	if (!authChecked) {
		return null;
	}

	return (
		<SidebarProvider>
			<div className="min-h-screen flex flex-col md:flex-row">
				<Sidebar />
				<DashboardContent>{children}</DashboardContent>
			</div>
		</SidebarProvider>
	);
}

export default function DashboardLayoutWrapper({
	children,
}: DashboardLayoutWrapperProps) {
	return <AuthWrapper>{children}</AuthWrapper>;
}
