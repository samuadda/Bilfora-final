"use client";

import { useState, useEffect } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	BarChart,
	Bar,
	Legend,
	Label,
} from "recharts";
import {
	FileText,
	Users,
	Clock,
	DollarSign,
	Plus,
	Calendar,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MonthlyData, OrderStatusData, CustomerData } from "@/types/database";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EmptyChart } from "@/components/dashboard/EmptyChart";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";

export default function DashboardPage() {
	const router = useRouter();
	const { toast } = useToast();

	const [stats, setStats] = useState({
		totalInvoices: 0,
		overdueInvoices: 0,
		totalRevenue: 0,
		activeCustomers: 0,
	});
	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
	const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>(
		[]
	);
	const [customerData, setCustomerData] = useState<CustomerData[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				loadCustomerData(user.id),
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
		const { data: invoices } = await supabase
			.from("invoices")
			.select("status, total_amount, due_date")
			.eq("user_id", userId);

		const { data: clients } = await supabase
			.from("clients")
			.select("status")
			.eq("user_id", userId)
			.is("deleted_at", null);

		const now = new Date();
		setStats({
			totalInvoices: invoices?.length || 0,
			overdueInvoices:
				invoices?.filter(
					(i) =>
						new Date(i.due_date) < now &&
						i.status !== "paid" &&
						i.status !== "cancelled"
				).length || 0,
			totalRevenue:
				invoices?.reduce(
					(sum, i) => sum + Number(i.total_amount || 0),
					0
				) || 0,
			activeCustomers:
				clients?.filter((c) => c.status === "active").length || 0,
		});
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

	const loadCustomerData = async (userId: string) => {
		const { data } = await supabase
			.from("clients")
			.select("created_at")
			.eq("user_id", userId)
			.is("deleted_at", null);

		if (!data) return;

		const now = new Date();
		const days = (d: string) =>
			(now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24);

		const newC = data.filter((c) => days(c.created_at) <= 30).length;
		const returningC = data.filter(
			(c) => days(c.created_at) > 30 && days(c.created_at) <= 90
		).length;
		const regularC = data.filter((c) => days(c.created_at) > 90).length;

		setCustomerData([
			{ name: "جدد", value: newC },
			{ name: "عائدون", value: returningC },
			{ name: "منتظمون", value: regularC },
		]);
	};

	const loadRecentActivity = async (userId: string) => {
		const { data: invoices } = await supabase
			.from("invoices")
			.select(
				`created_at, invoice_number, total_amount, client:clients(name)`
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(5);

		const { data: clients } = await supabase
			.from("clients")
			.select("created_at, name")
			.eq("user_id", userId)
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(3);

		const activity = [
			...(invoices?.map((o) => ({
				type: "invoice",
				title: `فاتورة جديدة #${o.invoice_number}`,
				subtitle: (o.client as any)?.name || "عميل غير معروف",
				amount: o.total_amount,
				time: o.created_at,
				icon: FileText,
				color: "purple",
			})) || []),
			...(clients?.map((c) => ({
				type: "client",
				title: "عميل جديد",
				subtitle: c.name,
				time: c.created_at,
				icon: Users,
				color: "blue",
			})) || []),
		]
			.sort((a, b) => +new Date(b.time) - +new Date(a.time))
			.slice(0, 5);

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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const CustomTooltip = ({
		active,
		payload,
		label,
		type = "default",
	}: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-gray-800 text-sm">
					<p className="font-bold mb-1 opacity-50">{label}</p>
					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{payload.map((entry: any, index: number) => (
						<div key={index} className="flex items-center gap-2">
							<div
								className="w-2 h-2 rounded-full"
								style={{
									backgroundColor: entry.color || entry.fill,
								}}
							/>
							<span className="font-medium">
								{type === "currency"
									? formatCurrency(entry.value)
									: entry.value}
							</span>
							<span className="opacity-70 ml-1">
								{entry.name}
							</span>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	if (loading) return <LoadingState message="جاري تحميل لوحة التحكم..." />;

	return (
		<div className="space-y-8 pb-10">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
			>
				<div>
					<h1 className="text-3xl font-bold text-[#012d46]">
						مرحباً، {userName || "شريك النجاح"} 👋
					</h1>
					<p className="text-gray-500 mt-2 text-lg">
						إليك نظرة عامة على أداء أعمالك اليوم
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={openInvoiceModal}
						className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-6 py-3 text-base font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
					>
						<Plus size={20} strokeWidth={2.5} />
						<span>فاتورة جديدة</span>
					</motion.button>
				</div>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				<StatsCard
					title="إجمالي المبيعات"
					value={formatCurrency(stats.totalRevenue)}
					icon={DollarSign}
					trend="+12%"
					color="purple"
					delay={0.1}
				/>
				<StatsCard
					title="إجمالي الفواتير"
					value={stats.totalInvoices}
					icon={FileText}
					color="blue"
					delay={0.2}
				/>
				<StatsCard
					title="العملاء النشطون"
					value={stats.activeCustomers}
					icon={Users}
					color="green"
					delay={0.3}
				/>
				<StatsCard
					title="فواتير متأخرة"
					value={stats.overdueInvoices}
					icon={Clock}
					color="orange"
					delay={0.4}
					isWarning={stats.overdueInvoices > 0}
				/>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Revenue Chart */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm"
				>
					<div className="flex items-center justify-between mb-8">
						<div>
							<h3 className="text-xl font-bold text-[#012d46]">
								تحليل الإيرادات
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								مقارنة الأداء الشهري للسنة الحالية
							</p>
						</div>
						<div className="flex gap-2">
							<span className="w-3 h-3 rounded-full bg-[#7f2dfb] inline-block self-center"></span>
							<span className="text-sm text-gray-600 font-medium">
								الإيرادات
							</span>
						</div>
					</div>

					{monthlyData.length ? (
						<div className="h-[350px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={monthlyData}
									margin={{
										top: 10,
										right: 0,
										left: 0,
										bottom: 0,
									}}
								>
									<defs>
										<linearGradient
											id="colorRevenue"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="#7f2dfb"
												stopOpacity={0.3}
											/>
											<stop
												offset="95%"
												stopColor="#7f2dfb"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#f3f4f6"
									/>
									<XAxis
										dataKey="name"
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#9ca3af", fontSize: 12 }}
										dy={15}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#9ca3af", fontSize: 12 }}
										dx={-15}
										tickFormatter={(value) =>
											`${value / 1000}k`
										}
									/>
									<Tooltip
										content={
											<CustomTooltip type="currency" />
										}
										cursor={{
											stroke: "#7f2dfb",
											strokeWidth: 1,
											strokeDasharray: "5 5",
										}}
									/>
									<Area
										type="natural"
										dataKey="revenue"
										name="الإيرادات"
										stroke="#7f2dfb"
										strokeWidth={4}
										fillOpacity={1}
										fill="url(#colorRevenue)"
										animationDuration={1500}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					) : (
						<EmptyChart />
					)}
				</motion.div>

				{/* Order Status & Activity Column */}
				<div className="space-y-6">
					{/* Order Status */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col"
					>
						<h3 className="text-xl font-bold text-[#012d46] mb-2">
							حالة الفواتير
						</h3>
						<p className="text-sm text-gray-500 mb-6">
							توزيع الفواتير حسب الحالة
						</p>

						{orderStatusData.length ? (
							<div className="flex-1 min-h-[250px] relative">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={orderStatusData}
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={85}
											paddingAngle={4}
											dataKey="value"
											cornerRadius={6}
										>
											{orderStatusData.map(
												(entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={entry.color}
														strokeWidth={0}
													/>
												)
											)}
											<Label
												value={orderStatusData.reduce(
													(sum, item) =>
														sum + item.value,
													0
												)}
												position="center"
												className="text-3xl font-bold fill-gray-900"
											/>
										</Pie>
										<Tooltip content={<CustomTooltip />} />
										<Legend
											verticalAlign="bottom"
											height={36}
											formatter={(value) => (
												<span className="text-sm font-medium text-gray-600 ml-2">
													{value}
												</span>
											)}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						) : (
							<EmptyChart message="لا توجد فواتير" />
						)}
					</motion.div>

					{/* Customers Distribution - Renamed to match actual data usage */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
						className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm"
					>
						<h3 className="text-xl font-bold text-[#012d46] mb-2">
							تحليل العملاء
						</h3>
						<p className="text-sm text-gray-500 mb-6">
							العملاء الجدد مقابل العائدين
						</p>

						{customerData.length ? (
							<div className="h-[200px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={customerData} barSize={32}>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="#f3f4f6"
										/>
										<XAxis
											dataKey="name"
											axisLine={false}
											tickLine={false}
											tick={{
												fill: "#6b7280",
												fontSize: 12,
											}}
											dy={10}
										/>
										<Tooltip
											content={<CustomTooltip />}
											cursor={{
												fill: "#f3f4f6",
												radius: 8,
											}}
										/>
										<Bar
											dataKey="value"
											name="عدد العملاء"
											fill="#10B981"
											radius={[8, 8, 8, 8]}
											animationDuration={1500}
										>
											{customerData.map(
												(entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={
															index === 0
																? "#10B981"
																: index === 1
																? "#3B82F6"
																: "#8B5CF6"
														}
													/>
												)
											)}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						) : (
							<EmptyChart message="لا يوجد عملاء" />
						)}
					</motion.div>
				</div>
			</div>

			{/* Recent Activity */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8 }}
				className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
			>
				<div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between">
					<div>
						<h3 className="text-xl font-bold text-[#012d46]">
							النشاطات الأخيرة
						</h3>
						<p className="text-sm text-gray-500 mt-1">
							آخر التحديثات على حسابك
						</p>
					</div>
					<Link
						href="/dashboard/notifications"
						className="px-4 py-2 bg-gray-50 text-[#7f2dfb] rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
					>
						عرض السجل الكامل
					</Link>
				</div>

				{recentActivity.length ? (
					<div className="divide-y divide-gray-50">
						{recentActivity.map((act, i) => {
							const Icon = act.icon;
							return (
								<div
									key={i}
									className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors group"
								>
									<div className="flex items-center gap-5">
										<div
											className={cn(
												"w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
												act.color === "purple"
													? "bg-purple-50 text-[#7f2dfb]"
													: "bg-blue-50 text-blue-600"
											)}
										>
											<Icon
												className="w-7 h-7"
												strokeWidth={2}
											/>
										</div>
										<div>
											<h4 className="text-gray-900 font-bold text-base mb-1">
												{act.title}
											</h4>
											<p className="text-sm text-gray-500 flex items-center gap-2">
												{act.subtitle}
												{act.amount && (
													<span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-green-100">
														{formatCurrency(
															act.amount
														)}
													</span>
												)}
											</p>
										</div>
									</div>
									<div className="flex flex-col items-end gap-2">
										<span className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-lg">
											{formatTimeAgo(act.time)}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="p-16 text-center">
						<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
							<Calendar className="text-gray-400 w-10 h-10" />
						</div>
						<h3 className="text-gray-900 font-bold text-lg">
							لا توجد نشاطات حديثة
						</h3>
						<p className="text-gray-500 mt-2 max-w-xs mx-auto">
							ابدأ بإنشاء فاتورة جديدة أو إضافة عميل لتظهر نشاطاتك
							هنا
						</p>
					</div>
				)}
			</motion.div>

			{/* Invoice Modal */}
			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={closeInvoiceModal}
				onSuccess={() => loadDashboardData()}
			/>
		</div>
	);
}
