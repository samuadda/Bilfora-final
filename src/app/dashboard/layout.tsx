"use client";

import { ReactNode } from "react";
import Sidebar, { useSidebar } from "../../components/dashboard/sideBar";
import SidebarProvider from "../../components/dashboard/SidebarProvider";

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

export default function DashboardLayoutWrapper({
	children,
}: DashboardLayoutWrapperProps) {
	return (
		<SidebarProvider>
			<div className="min-h-screen flex flex-col md:flex-row">
				<Sidebar />
				<DashboardContent>{children}</DashboardContent>
			</div>
		</SidebarProvider>
	);
}
