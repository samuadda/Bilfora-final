"use client";

import { useState } from "react";
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
	Plus,
	BarChart3,
	Users,
	ShoppingCart,
	CheckCircle,
	Clock,
	DollarSign,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	const [stats] = useState({
		totalOrders: 150,
		pendingOrders: 25,
		totalRevenue: 15000,
		activeCustomers: 45,
	});

	// Sample data for charts
	const monthlyData = [
		{ name: "يناير", orders: 65, revenue: 12000 },
		{ name: "فبراير", orders: 75, revenue: 15000 },
		{ name: "مارس", orders: 85, revenue: 18000 },
		{ name: "أبريل", orders: 95, revenue: 21000 },
		{ name: "مايو", orders: 110, revenue: 24000 },
		{ name: "يونيو", orders: 150, revenue: 15000 },
	];

	const orderStatusData = [
		{ name: "مكتمل", value: 85, color: "#10B981" },
		{ name: "معلق", value: 25, color: "#F59E0B" },
		{ name: "ملغي", value: 15, color: "#EF4444" },
	];

	const customerData = [
		{ name: "جدد", value: 30 },
		{ name: "عائدون", value: 45 },
		{ name: "منتظمون", value: 25 },
	];

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
					<Link
						href="/dashboard/orders/new"
						className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
					>
						<Plus size={16} />
						<span>طلب جديد</span>
					</Link>
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
								{stats.totalRevenue} ريال
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
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Plus className="w-4 h-4 text-purple-600" />
							</div>
							<span className="text-gray-900 font-medium">
								طلب جديد
							</span>
						</div>
						<span className="text-gray-500 text-sm">
							قبل 5 دقائق
						</span>
					</div>
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-100 rounded-lg">
								<CheckCircle className="w-4 h-4 text-green-600" />
							</div>
							<span className="text-gray-900 font-medium">
								تم اكتمال الطلب #123
							</span>
						</div>
						<span className="text-gray-500 text-sm">قبل ساعة</span>
					</div>
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Users className="w-4 h-4 text-blue-600" />
							</div>
							<span className="text-gray-900 font-medium">
								عميل جديد
							</span>
						</div>
						<span className="text-gray-500 text-sm">
							قبل ساعتين
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
