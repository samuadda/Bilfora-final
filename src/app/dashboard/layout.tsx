import { ReactNode } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout ";
import Sidebar from "../../components/dashboard/sideBar";

interface DashboardLayoutWrapperProps {
	children: ReactNode;
}

export default function DashboardLayoutWrapper({
	children,
}: DashboardLayoutWrapperProps) {
	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			<Sidebar />
			<main
				className="flex-1 p-4 md:p-6 min-h-screen bg-gray-50 transition-all duration-300
                md:mr-16 lg:mr-64 
                w-full max-w-[100vw] overflow-x-hidden"
			>
				<div className="max-w-7xl mx-auto">{children}</div>
			</main>
		</div>
	);
}
