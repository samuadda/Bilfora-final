"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
	const [topClients, setTopClients] = useState<{ name: string; revenue: number; invoiceCount: number }[]>([]);
	const [paymentTimes, setPaymentTimes] = useState<{ month: string; avgDays: number }[]>([]);
	const [overdueData, setOverdueData] = useState<{ month: string; amount: number; count: number }[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const searchParams = useSearchParams();
	const fromParam = searchParams.get("from");
	const toParam = searchParams.get("to");

	// Load analytics data when date range changes
	useEffect(() => {
		loadAnalyticsData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromParam, toParam]);

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

			// Resolve date range
			const dateFrom = fromParam ? new Date(fromParam) : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
			const dateTo = toParam ? new Date(toParam) : new Date();

			// Load all analytics data in parallel
			await Promise.all([
				loadStats(user.id),
				loadRevenueData(user.id, dateFrom, dateTo),
				loadChannelData(user.id),
				loadTopClients(user.id),
				loadPaymentTimes(user.id, dateFrom, dateTo),
				loadOverdueData(user.id, dateFrom, dateTo),
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
			// Get invoices stats
			const { data: invoicesData, error: invoicesError } = await supabase
				.from("invoices")
				.select("status, total_amount")
				.eq("user_id", userId);

			if (invoicesError) {
				console.error("Error loading invoices stats:", invoicesError);
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

			const totalInvoices = invoicesData?.length || 0;
			const pendingInvoices =
				invoicesData?.filter((i) => i.status === "sent").length || 0;
			const totalRevenue =
				invoicesData?.reduce((sum, i) => sum + i.total_amount, 0) || 0;
			const activeCustomers =
				clientsData?.filter((c) => c.status === "active").length || 0;

			setStats({
				totalOrders: totalInvoices,
				pendingOrders: pendingInvoices,
				totalRevenue,
				activeCustomers,
			});
		} catch (err) {
			console.error("Error loading stats:", err);
		}
	};

	const loadRevenueData = async (userId: string, from: Date, to: Date) => {
		try {
			const { data, error } = await supabase
				.from("invoices")
				.select("created_at, total_amount")
				.eq("user_id", userId)
				.gte("created_at", from.toISOString())
				.lte("created_at", to.toISOString())
				.order("created_at");

			if (error) {
				console.error("Error loading revenue data:", error);
				return;
			}

			// Group data by month
			const monthlyMap = new Map<
				string,
				{ invoices: number; revenue: number }
			>();

			data?.forEach((invoice) => {
				const date = new Date(invoice.created_at);
				const monthKey = `${date.getFullYear()}-${String(
					date.getMonth() + 1
				).padStart(2, "0")}`;
				const monthName = date.toLocaleDateString("ar-SA", {
					month: "long",
				});

				if (!monthlyMap.has(monthKey)) {
					monthlyMap.set(monthKey, { invoices: 0, revenue: 0 });
				}

				const monthData = monthlyMap.get(monthKey)!;
				monthData.invoices += 1;
				monthData.revenue += invoice.total_amount;
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
						orders: data.invoices,
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
				.from("invoices")
				.select("status")
				.eq("user_id", userId);

			if (error) {
				console.error("Error loading channel data:", error);
				return;
			}

			// Count invoices by status for channel analysis
			const statusCounts =
				data?.reduce((acc, invoice) => {
					acc[invoice.status] = (acc[invoice.status] || 0) + 1;
					return acc;
				}, {} as Record<string, number>) || {};

			const channelData = [
				{
					name: "مدفوعة",
					value: statusCounts.paid || 0,
					color: "#8B5CF6",
				},
				{
					name: "مرسلة",
					value: statusCounts.sent || 0,
					color: "#EC4899",
				},
				{
					name: "مسودة",
					value: statusCounts.draft || 0,
					color: "#60A5FA",
				},
				{
					name: "متأخرة",
					value: statusCounts.overdue || 0,
					color: "#F59E0B",
				},
				{
					name: "ملغية",
					value: statusCounts.cancelled || 0,
					color: "#EF4444",
				},
			].filter((item) => item.value > 0);

			setChannels(channelData);
		} catch (err) {
			console.error("Error loading channel data:", err);
		}
	};

	const loadTopClients = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("invoices")
				.select(`
					client_id,
					total_amount,
					clients!inner(name)
				`)
				.eq("user_id", userId)
				.eq("status", "paid");

			if (error) {
				console.error("Error loading top clients:", error);
				return;
			}

			// Group by client and calculate totals
			const clientMap = new Map<string, { name: string; revenue: number; invoiceCount: number }>();
			
			data?.forEach((invoice: any) => {
				const clientId = invoice.client_id;
				const clientName = invoice.clients?.name || "عميل غير معروف";
				
				if (!clientMap.has(clientId)) {
					clientMap.set(clientId, { name: clientName, revenue: 0, invoiceCount: 0 });
				}
				
				const client = clientMap.get(clientId)!;
				client.revenue += invoice.total_amount;
				client.invoiceCount += 1;
			});

			// Convert to array and sort by revenue
			const topClientsArray = Array.from(clientMap.values())
				.sort((a, b) => b.revenue - a.revenue)
				.slice(0, 5); // Top 5 clients

			setTopClients(topClientsArray);
		} catch (err) {
			console.error("Error loading top clients:", err);
		}
	};

	const loadPaymentTimes = async (userId: string, from: Date, to: Date) => {
		try {
			const { data, error } = await supabase
				.from("invoices")
				.select("created_at, updated_at, status")
				.eq("user_id", userId)
				.eq("status", "paid")
				.gte("created_at", from.toISOString())
				.lte("created_at", to.toISOString())
				.order("created_at");

			if (error) {
				console.error("Error loading payment times:", error);
				return;
			}

			// Group by month and calculate average payment time
			const monthlyMap = new Map<string, number[]>();
			
			data?.forEach((invoice) => {
				const createdDate = new Date(invoice.created_at);
				const updatedDate = new Date(invoice.updated_at);
				const paymentDays = Math.ceil((updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
				
				const monthKey = createdDate.toLocaleDateString("ar-SA", {
					month: "long",
				});
				
				if (!monthlyMap.has(monthKey)) {
					monthlyMap.set(monthKey, []);
				}
				
				monthlyMap.get(monthKey)!.push(paymentDays);
			});

			// Calculate average payment time per month
			const paymentTimesArray = Array.from(monthlyMap.entries()).map(([month, days]) => ({
				month,
				avgDays: Math.round(days.reduce((sum, day) => sum + day, 0) / days.length),
			}));

			setPaymentTimes(paymentTimesArray);
		} catch (err) {
			console.error("Error loading payment times:", err);
		}
	};

	const loadOverdueData = async (userId: string, from: Date, to: Date) => {
		try {
			const { data, error } = await supabase
				.from("invoices")
				.select("created_at, total_amount, due_date, status")
				.eq("user_id", userId)
				.in("status", ["sent", "overdue"])
				.gte("created_at", from.toISOString())
				.lte("created_at", to.toISOString())
				.order("created_at");

			if (error) {
				console.error("Error loading overdue data:", error);
				return;
			}

			// Group by month and calculate overdue amounts
			const monthlyMap = new Map<string, { amount: number; count: number }>();
			const today = new Date();
			
			data?.forEach((invoice) => {
				const dueDate = new Date(invoice.due_date);
				const isOverdue = dueDate < today;
				
				if (isOverdue) {
					const createdDate = new Date(invoice.created_at);
					const monthKey = createdDate.toLocaleDateString("ar-SA", {
						month: "long",
					});
					
					if (!monthlyMap.has(monthKey)) {
						monthlyMap.set(monthKey, { amount: 0, count: 0 });
					}
					
					const monthData = monthlyMap.get(monthKey)!;
					monthData.amount += invoice.total_amount;
					monthData.count += 1;
				}
			});

			// Convert to array
			const overdueArray = Array.from(monthlyMap.entries()).map(([month, data]) => ({
				month,
				amount: data.amount,
				count: data.count,
			}));

			setOverdueData(overdueArray);
		} catch (err) {
			console.error("Error loading overdue data:", err);
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
							<p className="text-sm text-gray-600">عدد الفواتير</p>
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
								متوسط قيمة الفاتورة
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
						حالة الفواتير
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

			{/* Invoices and Payment Times */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						الفواتير شهرياً
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
						متوسط وقت الدفع (أيام)
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={paymentTimes}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip
								formatter={(value) => [`${value} يوم`, "متوسط وقت الدفع"]}
							/>
							<Line
								type="monotone"
								dataKey="avgDays"
								stroke="#10B981"
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Top Clients and Overdue Invoices */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						أفضل العملاء
					</h3>
					<div className="space-y-3">
						{topClients.length > 0 ? (
							topClients.map((client, index) => (
								<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div className="text-right">
										<p className="font-medium text-gray-900">{client.name}</p>
										<p className="text-sm text-gray-500">{client.invoiceCount} فاتورة</p>
									</div>
									<div className="text-left">
										<p className="font-bold text-green-600">{formatSar(client.revenue)}</p>
									</div>
								</div>
							))
						) : (
							<p className="text-center text-gray-500 py-8">لا توجد بيانات</p>
						)}
					</div>
				</div>
				<div className="bg-white p-6 rounded-xl border border-gray-200">
					<h3 className="text-lg font-semibold mb-4 text-right">
						الفواتير المتأخرة
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={overdueData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip
								formatter={(value, name) => [
									name === "amount" ? formatSar(Number(value)) : value,
									name === "amount" ? "المبلغ المتأخر" : "عدد الفواتير"
								]}
							/>
							<Bar dataKey="amount" fill="#EF4444" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
