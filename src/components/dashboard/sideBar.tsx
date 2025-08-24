"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
	LayoutDashboard,
	FileText,
	Users,
	Settings,
	LogOut,
	UserCircle,
	Bell,
	HelpCircle,
	ShoppingCart,
	BarChart3,
	ChevronRight,
	ChevronLeft,
	Menu,
} from "lucide-react";
import Image from "next/image";

const navItems = [
	{ href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
	{ href: "/dashboard/orders", label: "الطلبات", icon: ShoppingCart },
	{ href: "/dashboard/invoices", label: "الفواتير", icon: FileText },
	{ href: "/dashboard/clients", label: "العملاء", icon: Users },
	{ href: "/dashboard/analytics", label: "التحليلات", icon: BarChart3 },
];

const bottomNavItems = [
	{ href: "/dashboard/profile", label: "الملف الشخصي", icon: UserCircle },
	{ href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
	{ href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
	{ href: "/dashboard/help", label: "المساعدة", icon: HelpCircle },
];

export default function Sidebar() {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	const onLogout = async () => {
		await supabase.auth.signOut();
		router.push("/login");
	};

	const toggleSidebar = () => {
		setIsCollapsed(!isCollapsed);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={toggleMobileMenu}
				className="fixed top-4 right-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
			>
				<Menu size={24} />
			</button>

			<aside
				className={`fixed top-0 right-0 h-screen bg-white border-l shadow-lg flex flex-col z-40
                    ${isCollapsed ? "w-16" : "w-64"}
                    ${
						isMobileMenuOpen
							? "translate-x-0"
							: "translate-x-full md:translate-x-0"
					}
                    transition-all duration-300 ease-in-out`}
			>
				{/* Logo Section */}
				<div className="p-4 border-b flex items-center justify-between">
					{!isCollapsed && (
						<Image
							src="/logo-ar-navy.svg"
							alt="Bilfora"
							width={120}
							height={40}
							priority
						/>
					)}
					<button
						onClick={toggleSidebar}
						className="p-1 rounded-lg hover:bg-gray-100 hidden md:block"
					>
						{isCollapsed ? (
							<ChevronLeft size={20} />
						) : (
							<ChevronRight size={20} />
						)}
					</button>
				</div>

				{/* Main Navigation */}
				<nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
					{navItems.map(({ href, label, icon: Icon }) => {
						const active =
							pathname === href ||
							pathname.startsWith(href + "/");
						return (
							<Link
								key={href}
								href={href}
								className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
									active
										? "bg-purple-100 text-purple-700 font-semibold"
										: "text-gray-700 hover:bg-gray-100"
								}`}
								title={isCollapsed ? label : ""}
							>
								<Icon size={18} />
								{!isCollapsed && <span>{label}</span>}
							</Link>
						);
					})}
				</nav>

				{/* Bottom Navigation */}
				<div className="border-t px-2 py-4 space-y-1">
					{bottomNavItems.map(({ href, label, icon: Icon }) => {
						const active = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
									active
										? "bg-gray-100 text-gray-900 font-semibold"
										: "text-gray-600 hover:bg-gray-50"
								}`}
								title={isCollapsed ? label : ""}
							>
								<Icon size={18} />
								{!isCollapsed && <span>{label}</span>}
							</Link>
						);
					})}

					{/* Logout Button */}
					<button
						onClick={onLogout}
						className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-2"
						title={isCollapsed ? "تسجيل الخروج" : ""}
					>
						<LogOut size={18} />
						{!isCollapsed && <span>تسجيل الخروج</span>}
					</button>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
					onClick={toggleMobileMenu}
				/>
			)}
		</>
	);
}
