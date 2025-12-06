"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, ArrowRight, FileText, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import QuickClientModal from "@/components/QuickClientModal";
import QuickProductModal from "@/components/QuickProductModal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import MonthlyStatsCards from "@/components/dashboard/MonthlyStatsCards";
import MonthlyRevenueChart from "@/components/dashboard/MonthlyRevenueChart";
import RecentInvoicesList from "@/components/dashboard/RecentInvoicesList";
import { useInvoiceStats, MonthlyStats, DailyRevenue } from "@/hooks/useInvoiceStats";
import { InvoiceWithClientAndItems } from "@/types/database";
import Link from "next/link";

export default function DashboardPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { getMonthlyStats, getDailyRevenue, getRecentInvoices } = useInvoiceStats();

	// Month/Year selector state
	const now = new Date();
	const [selectedYear, setSelectedYear] = useState(now.getFullYear());
	const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

	// Data state
	const [stats, setStats] = useState<MonthlyStats>({
		totalInvoiced: 0,
		collected: 0,
		outstanding: 0,
		overdueCount: 0,
		totalInvoices: 0,
		paidInvoices: 0,
	});
	const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
	const [recentInvoices, setRecentInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [loading, setLoading] = useState(true);
	const [userName, setUserName] = useState("");
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [showClientModal, setShowClientModal] = useState(false);
	const [showProductModal, setShowProductModal] = useState(false);
	const [accountCreatedYear, setAccountCreatedYear] = useState(now.getFullYear());

	// Format currency helper
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	// Load dashboard data when month/year changes
	useEffect(() => {
		loadDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedYear, selectedMonth]);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				router.push("/login");
				return;
			}

			// Get user profile for name and creation date
			const { data: profile } = await supabase
				.from("profiles")
				.select("full_name, created_at")
				.eq("id", user.id)
				.single();

			if (profile) {
				setUserName(profile.full_name);
				if (profile.created_at) {
					const createdYear = new Date(profile.created_at).getFullYear();
					setAccountCreatedYear(createdYear);
				}
			}

			// Load all data for selected month
			const [monthlyStats, dailyRev, recent] = await Promise.all([
				getMonthlyStats(user.id, selectedYear, selectedMonth),
				getDailyRevenue(user.id, selectedYear, selectedMonth),
				getRecentInvoices(user.id, selectedYear, selectedMonth, 8),
			]);

			setStats(monthlyStats);
			setDailyRevenue(dailyRev);
			setRecentInvoices(recent);
		} catch (err) {
			console.error(err);
			toast({
				title: "خطأ في التحميل",
				description: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Generate month options for selector
	const monthOptions = useMemo(() => {
		const months = [
			"يناير",
			"فبراير",
			"مارس",
			"أبريل",
			"مايو",
			"يونيو",
			"يوليو",
			"أغسطس",
			"سبتمبر",
			"أكتوبر",
			"نوفمبر",
			"ديسمبر",
		];
		return months.map((name, index) => ({
			value: index,
			label: `${name} ${selectedYear}`,
		}));
	}, [selectedYear]);

	// Generate year options (from account creation year to current year)
	const yearOptions = useMemo(() => {
		const currentYear = now.getFullYear();
		const yearsCount = currentYear - accountCreatedYear + 1;
		return Array.from({ length: yearsCount }, (_, i) => currentYear - i);
	}, [accountCreatedYear]);

	const monthName = useMemo(() => {
		const months = [
			"يناير",
			"فبراير",
			"مارس",
			"أبريل",
			"مايو",
			"يونيو",
			"يوليو",
			"أغسطس",
			"سبتمبر",
			"أكتوبر",
			"نوفمبر",
			"ديسمبر",
		];
		return months[selectedMonth];
	}, [selectedMonth]);

	const openInvoiceModal = () => setShowInvoiceModal(true);
	const closeInvoiceModal = () => setShowInvoiceModal(false);
	
	const openClientModal = () => setShowClientModal(true);
	const closeClientModal = () => setShowClientModal(false);
	
	const openProductModal = () => setShowProductModal(true);
	const closeProductModal = () => setShowProductModal(false);

	// Build analytics URL with month params
	const analyticsUrl = `/dashboard/analytics?from=${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01&to=${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${new Date(selectedYear, selectedMonth + 1, 0).getDate()}`;

	if (loading) return <LoadingState message="جاري تحميل لوحة التحكم..." />;

	return (
		<div className="space-y-6 pb-6">
			{/* Header with Month Selector */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
			>
				<div>
					<h1 className="text-3xl font-bold text-[#012d46]">
						مرحباً، {userName || "شريك النجاح"} 👋
					</h1>
					<p className="text-gray-500 mt-2 text-lg">
						إليك نظرة عامة على أداء أعمالك هذا الشهر
					</p>
				</div>
				<div className="flex items-center gap-3">
					{/* Month Selector */}
					<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
						<Calendar className="text-gray-400" size={18} />
						<select
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(Number(e.target.value))}
							className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
						>
							{monthOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<select
							value={selectedYear}
							onChange={(e) => setSelectedYear(Number(e.target.value))}
							className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer mr-2"
						>
							{yearOptions.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
					<DashboardQuickActions 
						onCreateInvoice={openInvoiceModal}
						onCreateClient={openClientModal}
						onCreateProduct={openProductModal}
					/>
				</div>
			</motion.div>

			{/* Monthly Stats Cards */}
			<MonthlyStatsCards stats={stats} formatCurrency={formatCurrency} />

			{/* Chart and Summary Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Revenue Chart */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm"
				>
					<div className="flex items-center justify-between mb-4">
						<div>
							<h3 className="text-lg font-bold text-[#012d46]">
								الإيرادات اليومية - {monthName} {selectedYear}
							</h3>
							<p className="text-xs text-gray-500 mt-1">توزيع الإيرادات على أيام الشهر</p>
						</div>
						<div className="flex items-center gap-3 text-xs">
							<div className="flex items-center gap-1.5">
								<div className="w-2 h-2 rounded-full bg-[#7f2dfb]"></div>
								<span className="text-gray-600">الإجمالي</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="w-2 h-2 rounded-full bg-green-500"></div>
								<span className="text-gray-600">المحصل</span>
							</div>
						</div>
					</div>
					{dailyRevenue.length > 0 ? (
						<MonthlyRevenueChart data={dailyRevenue} />
					) : (
						<div className="h-[280px] flex items-center justify-center text-gray-400">
							<p className="text-sm">لا توجد بيانات لهذا الشهر</p>
						</div>
					)}
				</motion.div>

				{/* Quick Summary */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300"
				>
					<h3 className="text-lg font-bold text-[#012d46] mb-5">ملخص سريع</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors group">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-100 rounded-lg group-hover:scale-105 transition-transform">
									<FileText className="text-[#7f2dfb]" size={18} strokeWidth={2.5} />
								</div>
								<span className="text-sm text-gray-700 font-medium">عدد الفواتير</span>
							</div>
							<span className="text-sm font-bold text-gray-900">{stats.totalInvoices}</span>
						</div>
						<div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors group">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 rounded-lg group-hover:scale-105 transition-transform">
									<TrendingUp className="text-green-600" size={18} strokeWidth={2.5} />
								</div>
								<span className="text-sm text-gray-700 font-medium">معدل التحصيل</span>
							</div>
							<span className="text-sm font-bold text-gray-900">
								{stats.totalInvoices > 0
									? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)
									: 0}%
							</span>
						</div>
						<div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 rounded-lg group-hover:scale-105 transition-transform">
									<DollarSign className="text-blue-600" size={18} strokeWidth={2.5} />
								</div>
								<span className="text-sm text-gray-700 font-medium">متوسط الفاتورة</span>
							</div>
							<span className="text-sm font-bold text-gray-900">
								{stats.totalInvoices > 0
									? formatCurrency(stats.totalInvoiced / stats.totalInvoices)
									: formatCurrency(0)}
							</span>
						</div>
					</div>
					{stats.overdueCount > 0 && (
						<div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2">
							<AlertCircle className="text-orange-600 flex-shrink-0" size={16} />
							<span className="text-xs font-medium text-orange-800">
								{stats.overdueCount} فاتورة متأخرة تحتاج متابعة
							</span>
						</div>
					)}
				</motion.div>
			</div>

			{/* Recent Invoices List */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.7 }}
			>
				<RecentInvoicesList invoices={recentInvoices} formatCurrency={formatCurrency} />
			</motion.div>

			{/* Link to Analytics */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8 }}
				className="flex justify-center pt-2"
			>
				<Link
					href={analyticsUrl}
					className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
				>
					<span>عرض التحليلات التفصيلية</span>
					<ArrowRight size={16} />
				</Link>
			</motion.div>

			{/* Modals */}
			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={closeInvoiceModal}
				onSuccess={() => loadDashboardData()}
			/>
			<QuickClientModal
				isOpen={showClientModal}
				onClose={closeClientModal}
				onSuccess={() => {
					loadDashboardData();
					closeClientModal();
				}}
			/>
			<QuickProductModal
				isOpen={showProductModal}
				onClose={closeProductModal}
				onSuccess={() => {
					loadDashboardData();
					closeProductModal();
				}}
			/>
		</div>
	);
}
