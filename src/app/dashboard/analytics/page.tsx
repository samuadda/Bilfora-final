"use client";

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
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
	// Sample analytics data
	const revenueByMonth = [
		{ name: "يناير", revenue: 12000, orders: 65 },
		{ name: "فبراير", revenue: 15000, orders: 75 },
		{ name: "مارس", revenue: 18000, orders: 85 },
		{ name: "أبريل", revenue: 21000, orders: 95 },
		{ name: "مايو", revenue: 24000, orders: 110 },
		{ name: "يونيو", revenue: 20000, orders: 98 },
	];

	const channels = [
		{ name: "بحث", value: 45, color: "#8B5CF6" },
		{ name: "إعلانات", value: 25, color: "#EC4899" },
		{ name: "اجتماعي", value: 20, color: "#60A5FA" },
		{ name: "إحالات", value: 10, color: "#10B981" },
	];

	const cohorts = [
		{ month: "يناير", retention: 62 },
		{ month: "فبراير", retention: 58 },
		{ month: "مارس", retention: 64 },
		{ month: "أبريل", retention: 61 },
		{ month: "مايو", retention: 67 },
		{ month: "يونيو", retention: 63 },
	];

	// KPIs inline
	const totalRevenue = revenueByMonth.reduce((s, d) => s + d.revenue, 0);
	const totalOrders = revenueByMonth.reduce((s, d) => s + d.orders, 0);
	const avgOrderValue = Math.round((totalRevenue / totalOrders) * 100) / 100;

	const formatSar = (n: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(n);

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
								{formatSar(totalRevenue)}
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
								{totalOrders}
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
								العملاء شهرياً
							</p>
							<p className="text-2xl font-bold text-pink-600">
								{Math.round(
									totalOrders / revenueByMonth.length
								)}
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
							<Tooltip />
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
						قنوات الاكتساب
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
							<Tooltip />
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
