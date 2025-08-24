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
			{/* Header Section - Added md:mr-8 and pl-16 for mobile */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-16 md:pl-0">
				<h1 className="text-2xl font-bold md:mr-8">لوحة التحكم</h1>
				<div className="flex flex-wrap gap-2">
					<button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
						<span>➕</span>
						<span>طلب جديد</span>
					</button>
					<button className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition flex items-center gap-2">
						<span>📊</span>
						<span>التقارير</span>
					</button>
					<button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
						<span>👥</span>
						<span>العملاء</span>
					</button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-gray-500 text-sm mb-1">
						إجمالي الطلبات
					</h3>
					<p className="text-3xl font-bold text-purple-600">
						{stats.totalOrders}
					</p>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-gray-500 text-sm mb-1">
						الطلبات المعلقة
					</h3>
					<p className="text-3xl font-bold text-pink-500">
						{stats.pendingOrders}
					</p>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-gray-500 text-sm mb-1">
						إجمالي الإيرادات
					</h3>
					<p className="text-3xl font-bold text-green-500">
						{stats.totalRevenue} ريال
					</p>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-gray-500 text-sm mb-1">
						العملاء النشطون
					</h3>
					<p className="text-3xl font-bold text-blue-500">
						{stats.activeCustomers}
					</p>
				</div>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Revenue Chart */}
				<div className="bg-white p-6 rounded-lg shadow">
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
				<div className="bg-white p-6 rounded-lg shadow">
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
				<div className="bg-white p-6 rounded-lg shadow">
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
				<div className="bg-white p-6 rounded-lg shadow">
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
			<div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
				<h3 className="text-lg font-semibold mb-4 text-right">
					النشاطات الأخيرة
				</h3>
				<div className="space-y-3">
					<div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
						<span className="text-purple-600 font-medium">
							طلب جديد
						</span>
						<span className="text-gray-500 text-sm">
							قبل 5 دقائق
						</span>
					</div>
					<div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
						<span className="text-green-600 font-medium">
							تم اكتمال الطلب #123
						</span>
						<span className="text-gray-500 text-sm">قبل ساعة</span>
					</div>
					<div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
						<span className="text-blue-600 font-medium">
							عميل جديد
						</span>
						<span className="text-gray-500 text-sm">
							قبل ساعتين
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
