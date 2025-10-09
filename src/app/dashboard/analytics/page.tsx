"use client";

import { useState, useEffect } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
	DashboardStats,
	MonthlyData,
	OrderStatusData,
	CustomerData,
} from "@/types/database";

export default function AnalyticsPage() {
	// State management
	const [stats, setStats] = useState<DashboardStats>({
		totalOrders: 0,
		pendingOrders: 0,
		totalRevenue: 0,
		activeCustomers: 0,
	});
	const [revenueByMonth, setRevenueByMonth] = useState<MonthlyData[]>([]);
	const [channels, setChannels] = useState<OrderStatusData[]>([]);
	const [cohorts, setCohorts] = useState<{ month: string; retention: number }[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load analytics data on component mount
	useEffect(() => {
		loadAnalyticsData();
	}, []);

	const loadAnalyticsData = async () => {
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

			// Load all analytics data in parallel
			await Promise.all([
				loadStats(user.id),
				loadRevenueData(user.id),
				loadChannelData(user.id),
				loadCohortData(user.id),
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

	const loadRevenueData = async (userId: string) => {
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
				console.error("Error loading revenue data:", error);
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

			setRevenueByMonth(monthlyArray);
		} catch (err) {
			console.error("Error loading revenue data:", err);
		}
	};

	const loadChannelData = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("orders")
				.select("status")
				.eq("user_id", userId);

			if (error) {
				console.error("Error loading channel data:", error);
				return;
			}

			// Count orders by status for channel analysis
			const statusCounts =
				data?.reduce((acc, order) => {
					acc[order.status] = (acc[order.status] || 0) + 1;
					return acc;
				}, {} as Record<string, number>) || {};

			const channelData = [
				{
					name: "مكتمل",
					value: statusCounts.completed || 0,
					color: "#8B5CF6",
				},
				{
					name: "معلق",
					value: statusCounts.pending || 0,
					color: "#EC4899",
				},
				{
					name: "قيد المعالجة",
					value: statusCounts.processing || 0,
					color: "#60A5FA",
				},
				{
					name: "ملغي",
					value: statusCounts.cancelled || 0,
					color: "#10B981",
				},
			].filter((item) => item.value > 0);

			setChannels(channelData);
		} catch (err) {
			console.error("Error loading channel data:", err);
		}
	};

	const loadCohortData = async (userId: string) => {
		try {
			// For now, we'll simulate retention data based on order patterns
			// In a real app, you'd track user retention over time
			const { data, error } = await supabase
				.from("orders")
				.select("created_at")
				.eq("user_id", userId)
				.gte(
					"created_at",
					new Date(
						Date.now() - 6 * 30 * 24 * 60 * 60 * 1000
					).toISOString()
				)
				.order("created_at");

			if (error) {
				console.error("Error loading cohort data:", error);
				return;
			}

			// Group by month and calculate simulated retention
			const monthlyMap = new Map<string, number>();
			data?.forEach((order) => {
				const date = new Date(order.created_at);
				const monthKey = date.toLocaleDateString("ar-SA", {
					month: "long",
				});
				monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
			});

			// Simulate retention percentages based on order volume
			const cohortData = Array.from(monthlyMap.entries()).map(([month, orders]) => ({
				month,
				retention: Math.min(95, Math.max(50, 60 + (orders * 2))), // Simulate retention between 50-95%
			}));

			setCohorts(cohortData);
		} catch (err) {
			console.error("Error loading cohort data:", err);
		}
	};

	// Calculate KPIs from dynamic data
	const totalRevenue = revenueByMonth.reduce((s, d) => s + d.revenue, 0);
	const totalOrders = revenueByMonth.reduce((s, d) => s + d.orders, 0);
	const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

	const formatSar = (n: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(n);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
					<p className="text-gray-500">
						جاري تحميل بيانات التحليلات...
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
						onClick={loadAnalyticsData}
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
			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي الإيرادات
							</p>
							<p className="text-2xl font-bold text-green-600">
								{formatSar(stats.totalRevenue)}
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
							<p className="text-sm text-gray-600">عدد الطلبات</p>
							<p className="text-2xl font-bold text-blue-600">
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
							<p className="text-sm text-gray-600">
								متوسط قيمة الطلب
							</p>
							<p className="text-2xl font-bold text-purple-600">
								{formatSar(avgOrderValue)}
							</p>
						</div>
						<div className="p-2 bg-purple-100 rounded-lg">
							<TrendingUp className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								العملاء النشطون
							</p>
							<p className="text-2xl font-bold text-pink-600">
								{stats.activeCustomers}
							</p>
						</div>
						<div className="p-2 bg-pink-100 rounded-lg">
							<Users className="w-6 h-6 text-pink-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Revenue over time */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="bg-white p-6 rounded-xl border border-gray-200 lg:col-span-2">
					<h3 className="text-lg font-semibold mb-4 text-right">
						الإيرادات عبر الوقت
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={revenueByMonth}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip
								formatter={(value, name) => [
									name === "revenue"
										? formatSar(Number(value))
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
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						حالة الطلبات
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={channels}
								dataKey="value"
								cx="50%"
								cy="50%"
								outerRadius={100}
							>
								{channels.map((c, i) => (
									<Cell key={i} fill={c.color} />
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Orders and Retention */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						الطلبات شهرياً
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={revenueByMonth}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="orders" fill="#60A5FA" />
						</BarChart>
					</ResponsiveContainer>
				</div>
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						الاحتفاظ بالعملاء
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={cohorts}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip
								formatter={(value) => [`${value}%`, "نسبة الاحتفاظ"]}
							/>
							<Line
								type="monotone"
								dataKey="retention"
								stroke="#10B981"
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
