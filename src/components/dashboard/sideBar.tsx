"use client";

import {
	useState,
	useContext,
	createContext,
	useEffect,
	ReactNode,
} from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

// Sidebar Context
interface SidebarContextType {
	isCollapsed: boolean;
	setIsCollapsed: (collapsed: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(
	undefined
);

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
};

export default function Sidebar() {
	const { toast } = useToast();
	const { isCollapsed, setIsCollapsed } = useSidebar();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isLogoutOpen, setIsLogoutOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	// 🧱 Persist collapse state
	useEffect(() => {
		const saved = localStorage.getItem("sidebar-collapsed");
		if (saved) setIsCollapsed(saved === "true");
	}, []);

	useEffect(() => {
		localStorage.setItem("sidebar-collapsed", String(isCollapsed));
	}, [isCollapsed]);

	// 🔒 Logout
	const confirmLogout = async () => {
		setIsLoggingOut(true);
		await supabase.auth.signOut();
		setIsLoggingOut(false);
		setIsLogoutOpen(false);
		toast({
			title: "تم تسجيل الخروج",
			description: "نراك قريبًا 👋",
		});
		router.replace("/login");
	};

	const toggleSidebar = () => setIsCollapsed(!isCollapsed);
	const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const DASHBOARD_NAV_ITEMS = [
        { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/dashboard/products", label: "المنتجات / الخدمات", icon: ShoppingCart },
        { href: "/dashboard/invoices", label: "الفواتير", icon: FileText },
        { href: "/dashboard/clients", label: "العملاء", icon: Users },
        { href: "/dashboard/analytics", label: "التحليلات", icon: BarChart3 },
    ];

	const bottomNavItems = [
		{ href: "/dashboard/profile", label: "الملف الشخصي", icon: UserCircle },
		{ href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
		{ href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
		{
			href: "/dashboard/invoices-settings",
			label: "إعدادات الفواتير",
			icon: FileText,
		},
		{ href: "/dashboard/help", label: "المساعدة", icon: HelpCircle },
	];

	return (
		<>
			{/* Mobile Toggle Button */}
			<button
				onClick={toggleMobileMenu}
				className="fixed top-4 right-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
			>
				<Menu size={24} />
			</button>

			<motion.aside
				initial={{ x: 0 }}
				animate={{
					width: isCollapsed ? 64 : 256,
					transition: { duration: 0.25, ease: "easeInOut" },
				}}
				className={`fixed top-0 right-0 h-screen bg-white border-l shadow-lg flex flex-col z-40
					${isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
					transition-all duration-300 ease-in-out`}
			>
				{/* Logo & Collapse */}
				<div className="p-4 border-b flex items-center justify-between">
					{!isCollapsed ? (
						<Image
							src="/logo-full.svg"
							alt="Bilfora"
							width={140}
							height={40}
							priority
						/>
					) : (
						<Image
							src="/logo-symbol.svg"
							alt="Bilfora"
							width={40}
							height={40}
							priority
						/>
					)}
					<button
						onClick={toggleSidebar}
						className="p-1 rounded-lg hover:bg-gray-100 hidden md:block"
						title={isCollapsed ? "توسيع" : "تصغير"}
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
					{DASHBOARD_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
						const active =
							pathname === href ||
							(href !== "/dashboard" &&
								pathname.startsWith(href + "/"));
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setIsMobileMenuOpen(false)} // ✅ auto close on mobile
								className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
									active
										? "bg-purple-100 text-purple-700 font-semibold"
										: "text-gray-700 hover:bg-gray-100"
								}`}
							>
								<div className="relative group">
									<Icon size={18} />
									{isCollapsed && (
										<span className="absolute right-9 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
											{label}
										</span>
									)}
								</div>
								{!isCollapsed && <span>{label}</span>}
							</Link>
						);
					})}
				</nav>

				{/* Bottom Navigation */}
				<div className="border-t px-2 py-4 space-y-1">
					{bottomNavItems.map(({ href, label, icon: Icon }) => {
						const active =
							pathname === href ||
							pathname.startsWith(href + "/");
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setIsMobileMenuOpen(false)} // ✅ auto close on mobile
								className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
									active
										? "bg-gray-100 text-gray-900 font-semibold"
										: "text-gray-700 hover:bg-gray-50"
								}`}
							>
								<div className="relative group">
									<Icon size={18} />
									{isCollapsed && (
										<span className="absolute right-9 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
											{label}
										</span>
									)}
								</div>
								{!isCollapsed && <span>{label}</span>}
							</Link>
						);
					})}

					{/* Logout */}
					<button
						onClick={() => setIsLogoutOpen(true)}
						className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-2"
						title={isCollapsed ? "تسجيل الخروج" : ""}
					>
						<LogOut size={18} />
						{!isCollapsed && <span>تسجيل الخروج</span>}
					</button>
				</div>
			</motion.aside>

			{/* Mobile Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 backdrop-blur-md bg-black/20 z-30 md:hidden"
					onClick={toggleMobileMenu}
				/>
			)}

			{/* Logout Modal */}
			<div
				className={`fixed inset-0 z-50 flex items-center justify-center ${
					isLogoutOpen ? "" : "pointer-events-none"
				}`}
			>
				<div
					className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${
						isLogoutOpen ? "opacity-100" : "opacity-0"
					}`}
					onClick={() => setIsLogoutOpen(false)}
				/>
				<div
					className={`relative bg-white w-[90%] max-w-sm rounded-2xl shadow-xl border p-5 transform transition-all duration-200 ease-out ${
						isLogoutOpen
							? "opacity-100 scale-100 translate-y-0"
							: "opacity-0 scale-95 translate-y-2"
					}`}
				>
					<h3 className="text-lg font-semibold text-gray-900 mb-1">
						تأكيد تسجيل الخروج
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
					</p>
					<div className="flex items-center justify-end gap-2">
						<button
							onClick={() => setIsLogoutOpen(false)}
							className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
						>
							إلغاء
						</button>
						<button
							onClick={confirmLogout}
							disabled={isLoggingOut}
							className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
						>
							{isLoggingOut ? "جاري الخروج…" : "تسجيل الخروج"}
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
