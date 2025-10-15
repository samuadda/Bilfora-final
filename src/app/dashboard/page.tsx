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
} from "recharts";
import {
    FileText,
    BarChart3,
    Users,
    ShoppingCart,
    Clock,
    DollarSign,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
	DashboardStats,
	MonthlyData,
	OrderStatusData,
	CustomerData,
} from "@/types/database";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

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
	const [recentActivity, setRecentActivity] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const [showInvoiceModal, setShowInvoiceModal] = useState(false);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast({
					title: "غير مصرح",
					description: "يجب تسجيل الدخول أولاً",
					variant: "destructive",
				});
				return;
			}

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
                    (i) => new Date(i.due_date) < now && i.status !== "paid" && i.status !== "cancelled"
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
			const month = d.toLocaleDateString("ar-SA", { month: "long" });
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
                { name: "مسودة", value: count.draft || 0, color: "#9CA3AF" },
                { name: "مرسلة", value: count.sent || 0, color: "#3B82F6" },
                { name: "مدفوعة", value: count.paid || 0, color: "#10B981" },
                { name: "متأخرة", value: count.overdue || 0, color: "#F59E0B" },
                { name: "ملغية", value: count.cancelled || 0, color: "#EF4444" },
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
            .select(`created_at, invoice_number, client:clients(name)`) 
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
                title: `فاتورة جديدة - ${o.invoice_number}`,
				subtitle: o.client?.name || "عميل غير معروف",
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
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);

	const formatTimeAgo = (dateString: string) => {
		const diff =
			(Date.now() - new Date(dateString).getTime()) / (1000 * 60);
		if (diff < 60) return `قبل ${Math.floor(diff)} دقيقة`;
		if (diff < 1440) return `قبل ${Math.floor(diff / 60)} ساعة`;
		return `قبل ${Math.floor(diff / 1440)} يوم`;
	};

	if (loading)
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-purple-600" />
			</div>
		);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						لوحة التحكم
					</h1>
					<p className="text-gray-500 mt-1">
						نظرة عامة على أداء عملك
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={openInvoiceModal}
						className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
					>
						<FileText size={16} />
						<span>إنشاء فاتورة</span>
					</button>
					<Link
						href="/dashboard/analytics"
						className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200"
					>
						<BarChart3 size={16} />
						<span>التقارير</span>
					</Link>
					<Link
						href="/dashboard/clients"
						className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200"
					>
						<Users size={16} />
						<span>العملاء</span>
					</Link>
				</div>
			</div>

			{/* Stats */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="grid grid-cols-1 md:grid-cols-4 gap-4"
			>
                {[
                    {
                        title: "إجمالي الفواتير",
                        value: stats.totalInvoices,
                        color: "blue",
                        icon: FileText,
                    },
                    {
                        title: "فواتير متأخرة",
                        value: stats.overdueInvoices,
                        color: "yellow",
                        icon: Clock,
                    },
                    {
                        title: "إجمالي المبيعات",
                        value: formatCurrency(stats.totalRevenue),
                        color: "green",
                        icon: DollarSign,
                    },
                    {
                        title: "العملاء النشطون",
                        value: stats.activeCustomers,
                        color: "purple",
                        icon: Users,
                    },
                ].map((item, i) => {
					const Icon = item.icon;
					return (
						<div
							key={i}
							className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center"
						>
							<div>
								<p className="text-sm text-gray-600">
									{item.title}
								</p>
								<p
									className={`text-2xl font-bold ${
										item.color === "blue"
											? "text-blue-600"
											: item.color === "yellow"
											? "text-yellow-600"
											: item.color === "green"
											? "text-green-600"
											: "text-purple-600"
									}`}
								>
									{item.value}
								</p>
							</div>
							<div
								className={`p-2 rounded-lg ${
									item.color === "blue"
										? "bg-blue-100"
										: item.color === "yellow"
										? "bg-yellow-100"
										: item.color === "green"
										? "bg-green-100"
										: "bg-purple-100"
								}`}
							>
								<Icon className={`w-6 h-6`} />
							</div>
						</div>
					);
				})}
			</motion.div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Revenue */}
				<ChartCard title="تحليل الإيرادات">
					{monthlyData.length ? (
						<AreaChartComponent
							data={monthlyData}
							dataKey="revenue"
							color="#8B5CF6"
						/>
					) : (
						<EmptyChart />
					)}
				</ChartCard>

				{/* Orders Status */}
				<ChartCard title="حالة الطلبات">
					{orderStatusData.length ? (
						<PieChartComponent data={orderStatusData} />
					) : (
						<EmptyChart />
					)}
				</ChartCard>

				{/* Customers */}
				<ChartCard title="توزيع العملاء">
					{customerData.length ? (
						<BarChartComponent data={customerData} />
					) : (
						<EmptyChart />
					)}
				</ChartCard>

				{/* Monthly Orders */}
				<ChartCard title="اتجاه الطلبات الشهرية">
					{monthlyData.length ? (
						<AreaChartComponent
							data={monthlyData}
							dataKey="orders"
							color="#60A5FA"
						/>
					) : (
						<EmptyChart />
					)}
				</ChartCard>
			</div>

			{/* Recent Activity */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold mb-4 text-right">
					النشاطات الأخيرة
				</h3>
				{recentActivity.length ? (
					<div className="space-y-3">
						{recentActivity.map((act, i) => {
							const Icon = act.icon;
							return (
								<div
									key={i}
									className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
								>
									<div className="flex items-center gap-3">
										<div
											className={`p-2 rounded-lg ${
												act.color === "purple"
													? "bg-purple-100 text-purple-600"
													: "bg-blue-100 text-blue-600"
											}`}
										>
											<Icon className="w-4 h-4" />
										</div>
										<div>
											<span className="text-gray-900 font-medium">
												{act.title}
											</span>
											<p className="text-sm text-gray-500">
												{act.subtitle}
											</p>
										</div>
									</div>
									<span className="text-gray-500 text-sm">
										{formatTimeAgo(act.time)}
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<EmptyChart message="لا توجد نشاطات حديثة" />
				)}
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

/* Helper Components */
const ChartCard = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<div className="bg-white p-6 rounded-xl border border-gray-200">
		<h3 className="text-lg font-semibold mb-4 text-right">{title}</h3>
		{children}
	</div>
);

const EmptyChart = ({
	message = "لا توجد بيانات بعد",
}: {
	message?: string;
}) => (
	<div className="flex items-center justify-center h-[300px] text-gray-400">
		{message}
	</div>
);

const AreaChartComponent = ({ data, dataKey, color }: any) => (
	<ResponsiveContainer width="100%" height={300}>
		<AreaChart data={data}>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="name" />
			<YAxis />
			<Tooltip />
			<Area
				type="monotone"
				dataKey={dataKey}
				stroke={color}
				fill={`${color}80`}
			/>
		</AreaChart>
	</ResponsiveContainer>
);

const PieChartComponent = ({ data }: any) => (
	<ResponsiveContainer width="100%" height={300}>
		<PieChart>
			<Pie
				data={data}
				cx="50%"
				cy="50%"
				innerRadius={60}
				outerRadius={80}
				paddingAngle={5}
				dataKey="value"
			>
				{data.map((entry: any, i: number) => (
					<Cell key={i} fill={entry.color} />
				))}
			</Pie>
			<Tooltip />
		</PieChart>
	</ResponsiveContainer>
);

const BarChartComponent = ({ data }: any) => (
	<ResponsiveContainer width="100%" height={300}>
		<BarChart data={data}>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="name" />
			<YAxis />
			<Tooltip />
			<Bar dataKey="value" fill="#EC4899" />
		</BarChart>
	</ResponsiveContainer>
);
