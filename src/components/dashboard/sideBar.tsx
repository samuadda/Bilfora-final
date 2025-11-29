"use client";

import {
	useState,
	useContext,
	createContext,
	useEffect,
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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

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
    const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);
    const [mounted, setMounted] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	// 🧱 Persist collapse state
	useEffect(() => {
		const saved = localStorage.getItem("sidebar-collapsed");
		if (saved) setIsCollapsed(saved === "true");
        setMounted(true);
	}, []);

	useEffect(() => {
		localStorage.setItem("sidebar-collapsed", String(isCollapsed));
        if (!isCollapsed) setHoveredItem(null);
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

    const handleHover = (e: React.MouseEvent<HTMLElement>, label: string) => {
		if (isCollapsed) {
			const rect = e.currentTarget.getBoundingClientRect();
			setHoveredItem({ label, top: rect.top + rect.height / 2 });
		}
	};

	const handleLeave = () => {
		setHoveredItem(null);
	};

	const DASHBOARD_NAV_ITEMS = [
		{ href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
		{
			href: "/dashboard/products",
			label: "المنتجات / الخدمات",
			icon: ShoppingCart,
		},
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
				className="fixed top-4 right-4 z-50 md:hidden bg-white/80 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
			>
				<Menu size={24} />
			</button>

			<motion.aside
				initial={{ x: 0 }}
				animate={{
					width: isCollapsed ? 80 : 280,
					transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
				}}
				className={cn(
					"fixed top-0 right-0 h-screen bg-white/90 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl flex flex-col z-40",
					isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
					"transition-transform duration-300 ease-in-out"
				)}
			>
				{/* Logo & Collapse */}
				<div className={cn("p-6 border-b border-gray-100 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
					<div className={cn("transition-all duration-300 flex justify-center", isCollapsed ? "w-full" : "w-auto")}>
						{isCollapsed ? (
                            <button 
                                onClick={toggleSidebar}
                                className="flex flex-col items-center gap-1 group w-full"
                                title="توسيع القائمة"
                            >
                                <Image
                                    src="/symbol-shadowNoBg.png"
                                    alt="Bilfora"
                                    width={40}
                                    height={40}
                                    priority
                                    className="w-10 h-10 object-contain drop-shadow-md"
                                />
                                <ChevronLeft size={14} className="text-gray-400 group-hover:text-[#7f2dfb] transition-colors animate-pulse" />
                            </button>
						) : (
                            <Link href="/dashboard">
                                <Image
                                    src="/logoPNG.png"
                                    alt="Bilfora"
                                    width={140}
                                    height={45}
                                    priority
                                    className="w-32 h-auto object-contain"
                                />
                            </Link>
						)}
					</div>
					{!isCollapsed && (
						<button
							onClick={toggleSidebar}
							className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-[#7f2dfb] transition-all duration-200 hidden md:block"
                            title="تصغير القائمة"
						>
							<ChevronRight size={20} />
						</button>
					)}
				</div>

				{/* Main Navigation */}
				<nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                    {!isCollapsed && (
                        <div className="px-4 mb-2 mt-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">القائمة الرئيسية</p>
                        </div>
                    )}

					{DASHBOARD_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
						const active =
							pathname === href ||
							(href !== "/dashboard" &&
								pathname.startsWith(href + "/"));
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setIsMobileMenuOpen(false)}
                                onMouseEnter={(e) => handleHover(e, label)}
                                onMouseLeave={handleLeave}
								className={cn(
									"group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
									active
										? "bg-gradient-to-l from-[#7f2dfb]/10 to-transparent text-[#7f2dfb]"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
								)}
							>
								{active && (
									<motion.div
										layoutId="activeTab"
										className="absolute right-0 top-0 bottom-0 w-1 bg-[#7f2dfb] rounded-l-full"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
									/>
								)}
								<div className={cn("relative z-10 transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>
									<Icon size={isCollapsed ? 24 : 20} strokeWidth={active ? 2.5 : 2} />
								</div>
								
								{!isCollapsed && (
									<span className="z-10">{label}</span>
								)}
							</Link>
						);
					})}

                    <div className={cn("my-4 border-t border-gray-100", isCollapsed ? "mx-2" : "mx-4")} />

                    {!isCollapsed && (
                        <div className="px-4 mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">الإعدادات والدعم</p>
                        </div>
                    )}

                    {bottomNavItems.map(({ href, label, icon: Icon }) => {
						const active =
							pathname === href ||
							pathname.startsWith(href + "/");
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setIsMobileMenuOpen(false)}
                                onMouseEnter={(e) => handleHover(e, label)}
                                onMouseLeave={handleLeave}
								className={cn(
									"group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
									active
										? "bg-gradient-to-l from-[#7f2dfb]/10 to-transparent text-[#7f2dfb]"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
								)}
							>
                                {active && (
									<motion.div
										layoutId="activeTabBottom"
										className="absolute right-0 top-0 bottom-0 w-1 bg-[#7f2dfb] rounded-l-full"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
									/>
								)}
								<div className={cn("relative z-10 transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>
									<Icon size={isCollapsed ? 22 : 18} strokeWidth={active ? 2.5 : 2} />
								</div>
								
								{!isCollapsed && (
									<span className="z-10">{label}</span>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Footer Actions */}
				<div className="border-t border-gray-100 px-4 py-4 bg-gray-50/30 mt-auto">
					{/* Logout */}
					<button
						onClick={() => setIsLogoutOpen(true)}
                        onMouseEnter={(e) => handleHover(e, "تسجيل الخروج")}
                        onMouseLeave={handleLeave}
						className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
					>
						<div className="relative z-10 group-hover:scale-110 transition-transform duration-200">
							<LogOut size={isCollapsed ? 22 : 18} />
						</div>
						{!isCollapsed && <span>تسجيل الخروج</span>}
					</button>
				</div>
			</motion.aside>

			{/* Mobile Overlay */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 backdrop-blur-sm bg-black/40 z-30 md:hidden"
						onClick={toggleMobileMenu}
					/>
				)}
			</AnimatePresence>

            {/* Floating Tooltip Portal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isCollapsed && hoveredItem && (
                        <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 5, scale: 0.9 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                top: hoveredItem.top,
                                position: "fixed",
                                right: "96px", // Sidebar (80) + Gap (16)
                                transform: "translateY(-50%)",
                                zIndex: 9999,
                            }}
                            className="pointer-events-none flex items-center"
                        >
                            <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg shadow-xl whitespace-nowrap relative">
                                {hoveredItem.label}
                                {/* Right pointing triangle (points to sidebar) */}
                                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900/95"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

			{/* Logout Modal */}
			<AnimatePresence>
				{isLogoutOpen && (
					<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/40 backdrop-blur-sm"
							onClick={() => setIsLogoutOpen(false)}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 overflow-hidden"
						>
							<div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-red-500 to-orange-500" />
							
							<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
								<LogOut className="text-red-500 w-8 h-8 ml-1" />
							</div>

							<h3 className="text-xl font-bold text-gray-900 text-center mb-2">
								هل تود المغادرة؟
							</h3>
							<p className="text-gray-500 text-center mb-8 leading-relaxed">
								سيتم تسجيل خروجك من حسابك في بيلفورا. يمكنك دائمًا العودة لاحقًا.
							</p>

							<div className="flex items-center gap-3">
								<button
									onClick={() => setIsLogoutOpen(false)}
									className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
								>
									البقاء
								</button>
								<button
									onClick={confirmLogout}
									disabled={isLoggingOut}
									className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
								>
									{isLoggingOut ? (
										<div className="flex items-center justify-center gap-2">
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											<span>جاري الخروج...</span>
										</div>
									) : (
										"تسجيل الخروج"
									)}
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
