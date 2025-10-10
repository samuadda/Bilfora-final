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
	CheckCircle,
	Clock,
	DollarSign,
	Loader2,
	AlertCircle,
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

export default function DashboardPage() {
	const router = useRouter();
	const [stats, setStats] = useState<DashboardStats>({
		totalOrders: 0,
		pendingOrders: 0,
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
	const [error, setError] = useState<string | null>(null);

	// Invoice modal state
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);

	// Load dashboard data on component mount
	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			// Load all dashboard data in parallel
			await Promise.all([
				loadStats(user.id),
				loadMonthlyData(user.id),
				loadOrderStatusData(user.id),
				loadCustomerData(user.id),
				loadRecentActivity(user.id),
			]);
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setLoading(false);
		}
	};

	const loadStats = async (userId: string) => {
		try {
			// Get orders stats
			const { data: ordersData, error: ordersError } = await supabase
				.from("orders")
				.select("status, total_amount")
				.eq("user_id", userId);

			if (ordersError) {
				console.error("Error loading orders stats:", ordersError);
				return;
			}

			// Get clients stats
			const { data: clientsData, error: clientsError } = await supabase
				.from("clients")
				.select("status")
				.eq("user_id", userId);

			if (clientsError) {
				console.error("Error loading clients stats:", clientsError);
				return;
			}

			const totalOrders = ordersData?.length || 0;
			const pendingOrders =
				ordersData?.filter((o) => o.status === "pending").length || 0;
			const totalRevenue =
				ordersData?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
			const activeCustomers =
				clientsData?.filter((c) => c.status === "active").length || 0;

			setStats({
				totalOrders,
				pendingOrders,
				totalRevenue,
				activeCustomers,
			});
		} catch (err) {
			console.error("Error loading stats:", err);
		}
	};

	const loadMonthlyData = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("orders")
				.select("created_at, total_amount")
				.eq("user_id", userId)
				.gte(
					"created_at",
					new Date(
						Date.now() - 6 * 30 * 24 * 60 * 60 * 1000
					).toISOString()
				)
				.order("created_at");

			if (error) {
				console.error("Error loading monthly data:", error);
				return;
			}

			// Group data by month
			const monthlyMap = new Map<
				string,
				{ orders: number; revenue: number }
			>();

			data?.forEach((order) => {
				const date = new Date(order.created_at);
				const monthKey = `${date.getFullYear()}-${String(
					date.getMonth() + 1
				).padStart(2, "0")}`;
				const monthName = date.toLocaleDateString("ar-SA", {
					month: "long",
				});

				if (!monthlyMap.has(monthKey)) {
					monthlyMap.set(monthKey, { orders: 0, revenue: 0 });
				}

				const monthData = monthlyMap.get(monthKey)!;
				monthData.orders += 1;
				monthData.revenue += order.total_amount;
			});

			// Convert to array format
			const monthlyArray = Array.from(monthlyMap.entries())
				.map(([key, data]) => {
					const [year, month] = key.split("-");
					const date = new Date(parseInt(year), parseInt(month) - 1);
					return {
						name: date.toLocaleDateString("ar-SA", {
							month: "long",
						}),
						orders: data.orders,
						revenue: data.revenue,
					};
				})
				.sort((a, b) => {
					const monthOrder = [
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
					return (
						monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name)
					);
				});

			setMonthlyData(monthlyArray);
		} catch (err) {
			console.error("Error loading monthly data:", err);
		}
	};

	const loadOrderStatusData = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("orders")
				.select("status")
				.eq("user_id", userId);

			if (error) {
				console.error("Error loading order status data:", error);
				return;
			}

			// Count orders by status
			const statusCounts =
				data?.reduce((acc, order) => {
					acc[order.status] = (acc[order.status] || 0) + 1;
					return acc;
				}, {} as Record<string, number>) || {};

			const statusData = [
				{
					name: "مكتمل",
					value: statusCounts.completed || 0,
					color: "#10B981",
				},
				{
					name: "معلق",
					value: statusCounts.pending || 0,
					color: "#F59E0B",
				},
				{
					name: "قيد المعالجة",
					value: statusCounts.processing || 0,
					color: "#3B82F6",
				},
				{
					name: "ملغي",
					value: statusCounts.cancelled || 0,
					color: "#EF4444",
				},
			].filter((item) => item.value > 0);

			setOrderStatusData(statusData);
		} catch (err) {
			console.error("Error loading order status data:", err);
		}
	};

	const loadCustomerData = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("clients")
				.select("status, created_at")
				.eq("user_id", userId);

			if (error) {
				console.error("Error loading customer data:", error);
				return;
			}

			const now = new Date();
			const thirtyDaysAgo = new Date(
				now.getTime() - 30 * 24 * 60 * 60 * 1000
			);
			const ninetyDaysAgo = new Date(
				now.getTime() - 90 * 24 * 60 * 60 * 1000
			);

			const newCustomers =
				data?.filter((c) => new Date(c.created_at) >= thirtyDaysAgo)
					.length || 0;
			const returningCustomers =
				data?.filter((c) => {
					const created = new Date(c.created_at);
					return created >= ninetyDaysAgo && created < thirtyDaysAgo;
				}).length || 0;
			const regularCustomers =
				data?.filter((c) => new Date(c.created_at) < ninetyDaysAgo)
					.length || 0;

			setCustomerData([
				{ name: "جدد", value: newCustomers },
				{ name: "عائدون", value: returningCustomers },
				{ name: "منتظمون", value: regularCustomers },
			]);
		} catch (err) {
			console.error("Error loading customer data:", err);
		}
	};

	const loadRecentActivity = async (userId: string) => {
		try {
			// Get recent orders
			const { data: ordersData, error: ordersError } = await supabase
				.from("orders")
				.select(
					`
					created_at,
					status,
					order_number,
					client:clients(name)
				`
				)
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(5);

			if (ordersError) {
				console.error("Error loading recent orders:", ordersError);
				return;
			}

			// Get recent clients
			const { data: clientsData, error: clientsError } = await supabase
				.from("clients")
				.select("created_at, name")
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(3);

			if (clientsError) {
				console.error("Error loading recent clients:", clientsError);
				return;
			}

			// Combine and format activity
			const activities = [
				...(ordersData?.map((order) => ({
					type: "order",
					title: `طلب جديد - ${order.order_number}`,
					subtitle: order.client?.name || "عميل غير محدد",
					time: order.created_at,
					icon: ShoppingCart,
					color: "purple",
				})) || []),
				...(clientsData?.map((client) => ({
					type: "client",
					title: "عميل جديد",
					subtitle: client.name,
					time: client.created_at,
					icon: Users,
					color: "blue",
				})) || []),
			]
				.sort(
					(a, b) =>
						new Date(b.time).getTime() - new Date(a.time).getTime()
				)
				.slice(0, 5);

			setRecentActivity(activities);
		} catch (err) {
			console.error("Error loading recent activity:", err);
		}
	};

	// Invoice modal handlers
	const openInvoiceModal = () => {
		setShowInvoiceModal(true);
	};

	const closeInvoiceModal = () => {
		setShowInvoiceModal(false);
	};

	const handleInvoiceSuccess = (id?: string) => {
		if (id) {
			router.push(`/dashboard/invoices/${id}`);
		} else {
			loadDashboardData();
		}
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60)
		);

		if (diffInMinutes < 60) {
			return `قبل ${diffInMinutes} دقيقة`;
		} else if (diffInMinutes < 1440) {
			const hours = Math.floor(diffInMinutes / 60);
			return `قبل ${hours} ساعة`;
		} else {
			const days = Math.floor(diffInMinutes / 1440);
			return `قبل ${days} يوم`;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
					<p className="text-gray-500">
						جاري تحميل بيانات لوحة التحكم...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600">{error}</p>
					<button
						onClick={loadDashboardData}
						className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
					>
						إعادة المحاولة
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						لوحة التحكم
					</h1>
					<p className="text-gray-500 mt-1">
						نظرة عامة على أداء عملك وإحصائيات المبيعات
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
						className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200 active:translate-y-[1px]"
					>
						<BarChart3 size={16} />
						<span>التقارير</span>
					</Link>
					<Link
						href="/dashboard/clients"
						className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200 active:translate-y-[1px]"
					>
						<Users size={16} />
						<span>العملاء</span>
					</Link>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي الطلبات
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.totalOrders}
							</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<ShoppingCart className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">طلبات معلقة</p>
							<p className="text-2xl font-bold text-yellow-600">
								{stats.pendingOrders}
							</p>
						</div>
						<div className="p-2 bg-yellow-100 rounded-lg">
							<Clock className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي المبيعات
							</p>
							<p className="text-2xl font-bold text-green-600">
								{formatCurrency(stats.totalRevenue)}
							</p>
						</div>
						<div className="p-2 bg-green-100 rounded-lg">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								العملاء النشطون
							</p>
							<p className="text-2xl font-bold text-purple-600">
								{stats.activeCustomers}
							</p>
						</div>
						<div className="p-2 bg-purple-100 rounded-lg">
							<Users className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Revenue Chart */}
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						تحليل الإيرادات
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={monthlyData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip
								formatter={(value, name) => [
									name === "revenue"
										? formatCurrency(Number(value))
										: value,
									name === "revenue"
										? "الإيرادات"
										: "الطلبات",
								]}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="#8B5CF6"
								fill="#8B5CF680"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Orders Chart */}
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						حالة الطلبات
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={orderStatusData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={80}
								paddingAngle={5}
								dataKey="value"
							>
								{orderStatusData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={entry.color}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Customer Distribution */}
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						توزيع العملاء
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={customerData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="value" fill="#EC4899" />
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Monthly Orders Trend */}
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						اتجاه الطلبات الشهرية
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={monthlyData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="orders"
								stroke="#60A5FA"
								fill="#60A5FA80"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h3 className="text-lg font-semibold mb-4 text-right">
					النشاطات الأخيرة
				</h3>
				<div className="space-y-3">
					{recentActivity.length > 0 ? (
						recentActivity.map((activity, index) => {
							const IconComponent = activity.icon;
							const colorClasses = {
								purple: "bg-purple-100 text-purple-600",
								blue: "bg-blue-100 text-blue-600",
								green: "bg-green-100 text-green-600",
							};

							return (
								<div
									key={index}
									className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
								>
									<div className="flex items-center gap-3">
										<div
											className={`p-2 rounded-lg ${
												colorClasses[
													activity.color as keyof typeof colorClasses
												]
											}`}
										>
											<IconComponent className="w-4 h-4" />
										</div>
										<div>
											<span className="text-gray-900 font-medium">
												{activity.title}
											</span>
											<p className="text-sm text-gray-500">
												{activity.subtitle}
											</p>
										</div>
									</div>
									<span className="text-gray-500 text-sm">
										{formatTimeAgo(activity.time)}
									</span>
								</div>
							);
						})
					) : (
						<div className="text-center py-8">
							<p className="text-gray-500">
								لا توجد نشاطات حديثة
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Invoice Creation Modal */}
			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={closeInvoiceModal}
				onSuccess={handleInvoiceSuccess}
			/>
		</div>
	);
}
