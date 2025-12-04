"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, FileText, Users, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MonthlyData, OrderStatusData } from "@/types/database";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import DashboardKpiCard from "@/components/dashboard/DashboardKpiCard";
import DashboardDonutChart from "@/components/dashboard/DashboardDonutChart";
import DashboardRevenueChart from "@/components/dashboard/DashboardRevenueChart";
import DashboardRecentActivity from "@/components/dashboard/DashboardRecentActivity";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

export default function DashboardPage() {
	const router = useRouter();
	const { toast } = useToast();

	const [stats, setStats] = useState({
		totalInvoices: 0,
		overdueInvoices: 0,
		totalRevenue: 0,
		activeCustomers: 0,
		paidInvoices: 0,
	});

	const [previousStats, setPreviousStats] = useState({
		totalInvoices: 0,
		overdueInvoices: 0,
		totalRevenue: 0,
		activeCustomers: 0,
		paidInvoices: 0,
	});

	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
	const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);
	const [recentActivity, setRecentActivity] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [userName, setUserName] = useState("");
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);

	useEffect(() => {
		loadDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

			// Get user profile for name
			const { data: profile } = await supabase
				.from("profiles")
				.select("full_name")
				.eq("id", user.id)
				.single();

			if (profile) setUserName(profile.full_name);

			await Promise.all([
				loadStats(user.id),
				loadMonthlyData(user.id),
				loadInvoiceStatusData(user.id),
				loadRecentActivity(user.id),
			]);
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

	const loadStats = async (userId: string) => {
		const now = new Date();
		const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

		// Current month invoices
		const { data: currentInvoices } = await supabase
			.from("invoices")
			.select("status, total_amount, due_date, created_at")
			.eq("user_id", userId)
			.gte("created_at", currentMonthStart.toISOString());

		// Previous month invoices
		const { data: previousInvoices } = await supabase
			.from("invoices")
			.select("status, total_amount, due_date, created_at")
			.eq("user_id", userId)
			.gte("created_at", previousMonthStart.toISOString())
			.lte("created_at", previousMonthEnd.toISOString());

		// Current month clients
		const { data: currentClients } = await supabase
			.from("clients")
			.select("status, created_at")
			.eq("user_id", userId)
			.is("deleted_at", null);

		// Previous month clients
		const { data: previousClients } = await supabase
			.from("clients")
			.select("status, created_at")
			.eq("user_id", userId)
			.is("deleted_at", null)
			.lte("created_at", previousMonthEnd.toISOString());

		// Calculate current stats
		const currentStats = {
			totalInvoices: currentInvoices?.length || 0,
			overdueInvoices:
				currentInvoices?.filter(
					(i) =>
						new Date(i.due_date) < now &&
						i.status !== "paid" &&
						i.status !== "cancelled"
				).length || 0,
			totalRevenue:
				currentInvoices?.reduce(
					(sum, i) => sum + Number(i.total_amount || 0),
					0
				) || 0,
			activeCustomers:
				currentClients?.filter((c) => c.status === "active").length || 0,
			paidInvoices:
				currentInvoices?.filter((i) => i.status === "paid").length || 0,
		};

		// Calculate previous stats
		const prevStats = {
			totalInvoices: previousInvoices?.length || 0,
			overdueInvoices:
				previousInvoices?.filter(
					(i) =>
						new Date(i.due_date) < previousMonthEnd &&
						i.status !== "paid" &&
						i.status !== "cancelled"
				).length || 0,
			totalRevenue:
				previousInvoices?.reduce(
					(sum, i) => sum + Number(i.total_amount || 0),
					0
				) || 0,
			activeCustomers:
				previousClients?.filter((c) => c.status === "active").length || 0,
			paidInvoices:
				previousInvoices?.filter((i) => i.status === "paid").length || 0,
		};

		setStats(currentStats);
		setPreviousStats(prevStats);
	};

	const loadMonthlyData = async (userId: string) => {
		const { data } = await supabase
			.from("invoices")
			.select("created_at, total_amount")
			.eq("user_id", userId)
			.order("created_at");

		if (!data) return;

		const monthlyMap = new Map<
			string,
			{ orders: number; revenue: number; name: string }
		>();

		data.forEach((inv) => {
			const d = new Date(inv.created_at);
			const month = d.toLocaleDateString("ar-SA-u-nu-latn", {
				month: "short",
			});
			if (!monthlyMap.has(month))
				monthlyMap.set(month, { orders: 0, revenue: 0, name: month });
			const entry = monthlyMap.get(month)!;
			entry.orders += 1;
			entry.revenue += Number(inv.total_amount);
		});

		setMonthlyData(Array.from(monthlyMap.values()));
	};

	const loadInvoiceStatusData = async (userId: string) => {
		const { data } = await supabase
			.from("invoices")
			.select("status")
			.eq("user_id", userId);

		if (!data) return;

		const count = data.reduce(
			(acc, cur) => ({
				...acc,
				[cur.status]: (acc[cur.status] || 0) + 1,
			}),
			{} as Record<string, number>
		);

		setOrderStatusData(
			[
				{ name: "مسودة", value: count.draft || 0, color: "#E5E7EB" },
				{ name: "مرسلة", value: count.sent || 0, color: "#60A5FA" },
				{ name: "مدفوعة", value: count.paid || 0, color: "#34D399" },
				{ name: "متأخرة", value: count.overdue || 0, color: "#FBBF24" },
				{
					name: "ملغية",
					value: count.cancelled || 0,
					color: "#F87171",
				},
			].filter((d) => d.value > 0)
		);
	};

	const loadRecentActivity = async (userId: string) => {
		const { data: invoices } = await supabase
			.from("invoices")
			.select(
				`id, created_at, invoice_number, total_amount, status, client:clients(name)`
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(5);

		const activity =
			invoices?.map((inv) => ({
				type: "invoice" as const,
				title: `فاتورة #${inv.invoice_number}`,
				subtitle: (inv.client as any)?.name || "عميل غير معروف",
				amount: inv.total_amount,
				time: inv.created_at,
				icon: FileText,
				color: "purple" as const,
				invoiceId: inv.id,
			})) || [];

		setRecentActivity(activity);
	};

	const openInvoiceModal = () => setShowInvoiceModal(true);
	const closeInvoiceModal = () => setShowInvoiceModal(false);

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(amount);

	const formatTimeAgo = (dateString: string) => {
		const diff =
			(Date.now() - new Date(dateString).getTime()) / (1000 * 60);
		if (diff < 60) return `منذ ${Math.floor(diff)} دقيقة`;
		if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
		return `منذ ${Math.floor(diff / 1440)} يوم`;
	};

	// Calculate period comparisons
	const revenueChange = useMemo(() => {
		if (previousStats.totalRevenue === 0) return 0;
		return ((stats.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) * 100;
	}, [stats.totalRevenue, previousStats.totalRevenue]);

	const invoicesChange = useMemo(() => {
		if (previousStats.totalInvoices === 0) return 0;
		return ((stats.totalInvoices - previousStats.totalInvoices) / previousStats.totalInvoices) * 100;
	}, [stats.totalInvoices, previousStats.totalInvoices]);

	const customersChange = useMemo(() => {
		if (previousStats.activeCustomers === 0) return 0;
		return ((stats.activeCustomers - previousStats.activeCustomers) / previousStats.activeCustomers) * 100;
	}, [stats.activeCustomers, previousStats.activeCustomers]);

	const overdueChange = useMemo(() => {
		if (previousStats.overdueInvoices === 0) return stats.overdueInvoices > 0 ? 100 : 0;
		return ((stats.overdueInvoices - previousStats.overdueInvoices) / previousStats.overdueInvoices) * 100;
	}, [stats.overdueInvoices, previousStats.overdueInvoices]);

	const paidInvoicesChange = useMemo(() => {
		if (previousStats.paidInvoices === 0) return stats.paidInvoices > 0 ? 100 : 0;
		return ((stats.paidInvoices - previousStats.paidInvoices) / previousStats.paidInvoices) * 100;
	}, [stats.paidInvoices, previousStats.paidInvoices]);

	// Calculate average invoice value
	const avgInvoiceValue = useMemo(() => {
		return stats.totalInvoices > 0 ? stats.totalRevenue / stats.totalInvoices : 0;
	}, [stats.totalRevenue, stats.totalInvoices]);

	// Total invoices for donut chart
	const totalInvoicesForChart = useMemo(() => {
		return orderStatusData.reduce((sum, item) => sum + item.value, 0);
	}, [orderStatusData]);

	if (loading) return <LoadingState message="جاري تحميل لوحة التحكم..." />;

	return (
		<div className="space-y-8 pb-10">
			{/* Welcome Header Section */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
			>
				<div>
					<h1 className="text-3xl font-bold text-[#012d46]">
						مرحباً، {userName || "شريك النجاح"} 👋
					</h1>
					<p className="text-gray-500 mt-2 text-lg">
						إليك نظرة عامة على أداء أعمالك هذا الشهر
					</p>
				</div>
				<DashboardQuickActions onCreateInvoice={openInvoiceModal} />
			</motion.div>

			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<DashboardKpiCard
					title="إجمالي الإيرادات"
					value={formatCurrency(stats.totalRevenue)}
					icon={DollarSign}
					color="green"
					trend={{
						value: revenueChange,
						label: "هذا الشهر",
					}}
					delay={0.1}
				/>
				<DashboardKpiCard
					title="إجمالي الفواتير"
					value={stats.totalInvoices}
					icon={FileText}
					color="purple"
					trend={{
						value: invoicesChange,
						label: "هذا الشهر",
					}}
					delay={0.2}
				/>
				<DashboardKpiCard
					title="الفواتير المدفوعة"
					value={stats.paidInvoices}
					icon={CheckCircle}
					color="indigo"
					trend={{
						value: paidInvoicesChange,
						label: "مقارنة بالشهر السابق",
					}}
					delay={0.3}
				/>
				<DashboardKpiCard
					title="متوسط قيمة الفاتورة"
					value={formatCurrency(avgInvoiceValue)}
					icon={TrendingUp}
					color="blue"
					delay={0.4}
				/>
				<DashboardKpiCard
					title="العملاء النشطون"
					value={stats.activeCustomers}
					icon={Users}
					color="blue"
					trend={{
						value: customersChange,
						label: "مقارنة بالشهر السابق",
					}}
					delay={0.5}
				/>
				<DashboardKpiCard
					title="فواتير متأخرة"
					value={stats.overdueInvoices}
					icon={Clock}
					color="orange"
					trend={{
						value: overdueChange,
						label: "مقارنة بالشهر السابق",
					}}
					delay={0.6}
				/>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Revenue Chart - Takes 2 columns */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm"
				>
					<div className="flex items-center justify-between mb-8">
						<div>
							<h3 className="text-xl font-bold text-[#012d46]">تحليل الإيرادات</h3>
							<p className="text-sm text-gray-500 mt-1">مقارنة الأداء الشهري</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-3 h-3 rounded-full bg-[#7f2dfb] inline-block"></span>
							<span className="text-sm text-gray-600 font-medium">الإيرادات</span>
						</div>
					</div>
					{monthlyData.length > 0 ? (
						<DashboardRevenueChart
							data={monthlyData.map((m) => ({
								name: m.name,
								revenue: m.revenue,
							}))}
						/>
					) : (
						<div className="h-[350px] flex items-center justify-center text-gray-400">
							<p>لا توجد بيانات كافية</p>
						</div>
					)}
				</motion.div>

				{/* Donut Chart & Recent Activity - Takes 1 column */}
				<div className="space-y-6">
					{/* Invoice Status Donut Chart */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
						className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm"
					>
						<h3 className="text-xl font-bold text-[#012d46] mb-2">حالة الفواتير</h3>
						<p className="text-sm text-gray-500 mb-6">توزيع الفواتير حسب الحالة</p>
						{orderStatusData.length > 0 ? (
							<DashboardDonutChart
								data={orderStatusData}
								total={totalInvoicesForChart}
							/>
						) : (
							<div className="h-[280px] flex items-center justify-center text-gray-400">
								<p className="text-sm">لا توجد فواتير</p>
							</div>
						)}
					</motion.div>

					{/* Recent Activity Panel */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className="lg:h-[400px]"
					>
						<DashboardRecentActivity
							activities={recentActivity}
							formatCurrency={formatCurrency}
							formatTimeAgo={formatTimeAgo}
						/>
					</motion.div>
				</div>
			</div>

			{/* Invoice Modal */}
			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={closeInvoiceModal}
				onSuccess={() => loadDashboardData()}
			/>
		</div>
	);
}
