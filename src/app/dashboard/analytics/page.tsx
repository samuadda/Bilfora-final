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
    Legend
} from "recharts";
import { 
    TrendingUp, 
    Users, 
    ShoppingCart, 
    DollarSign, 
    Loader2, 
    AlertCircle,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
	DashboardStats,
	MonthlyData,
	OrderStatusData,
} from "@/types/database";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
						name: date.toLocaleDateString("ar-SA-u-nu-latn", {
							month: "short",
                            year: "numeric"
						}),
						orders: data.invoices,
						revenue: data.revenue,
					};
				})
                // Simple sort by key (YYYY-MM)
                .sort((a, b) => 0); // You might want to sort based on the key if needed, but Map iterates in insertion order mostly if inserted chronologically.

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
				{ name: "مدفوعة", value: statusCounts.paid || 0, color: "#10B981" },
				{ name: "مرسلة", value: statusCounts.sent || 0, color: "#3B82F6" },
				{ name: "مسودة", value: statusCounts.draft || 0, color: "#E5E7EB" },
				{ name: "متأخرة", value: statusCounts.overdue || 0, color: "#F59E0B" },
				{ name: "ملغية", value: statusCounts.cancelled || 0, color: "#EF4444" },
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
				
				const monthKey = createdDate.toLocaleDateString("ar-SA-u-nu-latn", {
					month: "short",
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
					const monthKey = createdDate.toLocaleDateString("ar-SA-u-nu-latn", {
						month: "short",
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

	const totalRevenue = revenueByMonth.reduce((s, d) => s + d.revenue, 0);
	const totalOrders = revenueByMonth.reduce((s, d) => s + d.orders, 0);
	const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

	const formatSar = (n: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
            maximumFractionDigits: 0
		}).format(n);

    const CustomTooltip = ({ active, payload, label, type }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-gray-800 text-sm">
                    <p className="font-bold mb-2 opacity-50">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                            <span className="font-medium">
                                {type === 'currency' ? formatSar(entry.value) : entry.value}
                            </span>
                            <span className="opacity-70 ml-1">{entry.name}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
				    <Loader2 className="h-12 w-12 text-[#7f2dfb]" />
                </motion.div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={loadAnalyticsData}
						className="px-6 py-2 bg-[#7f2dfb] text-white rounded-xl hover:bg-[#6a1fd8] transition-colors font-bold"
					>
						إعادة المحاولة
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#012d46]">تقارير الأداء</h1>
                    <p className="text-gray-500 mt-2 text-lg">تحليلات مفصلة لنمو أعمالك</p>
                </div>
                <div className="flex gap-3">
                    {/* Date range picker could go here */}
                </div>
            </div>

			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <KpiCard 
                    title="إجمالي الإيرادات" 
                    value={formatSar(stats.totalRevenue)} 
                    icon={DollarSign} 
                    color="green"
                    trend="+15%"
                />
                <KpiCard 
                    title="عدد الفواتير" 
                    value={stats.totalOrders} 
                    icon={ShoppingCart} 
                    color="blue"
                />
                <KpiCard 
                    title="متوسط قيمة الفاتورة" 
                    value={formatSar(avgOrderValue)} 
                    icon={TrendingUp} 
                    color="purple"
                />
                <KpiCard 
                    title="العملاء النشطون" 
                    value={stats.activeCustomers} 
                    icon={Users} 
                    color="pink"
                />
			</div>

			{/* Revenue & Distribution */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2"
                >
					<div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-[#012d46]">نمو الإيرادات</h3>
                        <select className="bg-gray-50 border-none rounded-lg text-sm p-2 focus:ring-0 cursor-pointer">
                            <option>هذا العام</option>
                            <option>العام الماضي</option>
                        </select>
                    </div>
					<div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueByMonth} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-15} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip content={<CustomTooltip type="currency" />} cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#analyticsRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
				</motion.div>

				<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col"
                >
					<h3 className="text-xl font-bold text-[#012d46] mb-2">حالة الفواتير</h3>
                    <p className="text-sm text-gray-500 mb-8">توزيع الفواتير حسب الحالة</p>
                    
					<div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={channels}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    cornerRadius={6}
                                >
                                    {channels.map((c, i) => (
                                        <Cell key={i} fill={c.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-sm font-medium text-gray-600 mr-2">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
				</motion.div>
			</div>

			{/* Secondary Metrics */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
					<h3 className="text-xl font-bold text-[#012d46] mb-8">عدد الفواتير شهرياً</h3>
					<div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByMonth} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb', radius: 8}} />
                                <Bar dataKey="orders" name="عدد الفواتير" fill="#3B82F6" radius={[6, 6, 6, 6]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
				</motion.div>

				<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
					<h3 className="text-xl font-bold text-[#012d46] mb-2">متوسط وقت الدفع</h3>
                    <p className="text-sm text-gray-500 mb-8">متوسط الأيام حتى سداد الفاتورة</p>
					<div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={paymentTimes}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgDays" 
                                    name="الأيام"
                                    stroke="#10B981" 
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
				</motion.div>
			</div>

			{/* Bottom Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
					<div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-[#012d46]">أفضل العملاء</h3>
                        <button className="text-[#7f2dfb] text-sm font-bold hover:underline">عرض الكل</button>
                    </div>
					<div className="space-y-4">
						{topClients.length > 0 ? (
							topClients.map((client, index) => (
								<div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
									<div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{client.name}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{client.invoiceCount} فاتورة مدفوعة</p>
                                        </div>
									</div>
									<div className="text-left">
										<p className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                                            {formatSar(client.revenue)}
                                        </p>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">لا توجد بيانات كافية</p>
                            </div>
						)}
					</div>
				</motion.div>

				<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
					<h3 className="text-xl font-bold text-[#012d46] mb-2">الفواتير المتأخرة</h3>
                    <p className="text-sm text-gray-500 mb-8">تحليل المبالغ غير المسددة</p>
					<div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overdueData} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                                <Tooltip content={<CustomTooltip type="currency" />} cursor={{fill: '#f9fafb', radius: 8}} />
                                <Bar dataKey="amount" name="المبلغ" fill="#EF4444" radius={[8, 8, 8, 8]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
				</motion.div>
			</div>
		</div>
	);
}

function KpiCard({ title, value, icon: Icon, color, trend }: any) {
     const colors = {
        purple: "bg-purple-50 text-[#7f2dfb]",
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        pink: "bg-pink-50 text-pink-600",
    };

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                 <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", colors[color as keyof typeof colors])}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        {trend}
                        <ArrowUpRight size={12} />
                    </span>
                )}
            </div>
             <div>
                <p className="text-gray-500 text-sm font-bold mb-1 opacity-80">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
            </div>
        </motion.div>
    )
}
