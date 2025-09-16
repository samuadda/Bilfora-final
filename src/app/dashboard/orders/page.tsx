"use client";

import { useState, useEffect } from "react";
import {
	Eye,
	Edit,
	Download,
	Filter,
	ChevronDown,
	CheckCircle,
	Clock,
	XCircle,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Order status types
type OrderStatus =
	| "pending"
	| "processing"
	| "completed"
	| "cancelled"
	| "refunded";

interface Order {
	id: string;
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	items: number;
	total: number;
	status: OrderStatus;
	createdAt: string;
	updatedAt: string;
	paymentMethod: string;
	notes?: string;
}

// Sample data
const sampleOrders: Order[] = [
	{
		id: "1",
		orderNumber: "ORD-2024-001",
		customerName: "أحمد محمد",
		customerEmail: "ahmed@example.com",
		items: 3,
		total: 450.0,
		status: "completed",
		createdAt: "2024-01-15",
		updatedAt: "2024-01-16",
		paymentMethod: "تحويل بنكي",
		notes: "طلب عاجل",
	},
	{
		id: "2",
		orderNumber: "ORD-2024-002",
		customerName: "فاطمة علي",
		customerEmail: "fatima@example.com",
		items: 1,
		total: 120.0,
		status: "pending",
		createdAt: "2024-01-14",
		updatedAt: "2024-01-14",
		paymentMethod: "نقدي",
	},
	{
		id: "3",
		orderNumber: "ORD-2024-003",
		customerName: "محمد السعد",
		customerEmail: "mohammed@example.com",
		items: 5,
		total: 890.0,
		status: "processing",
		createdAt: "2024-01-13",
		updatedAt: "2024-01-15",
		paymentMethod: "بطاقة ائتمان",
	},
	{
		id: "4",
		orderNumber: "ORD-2024-004",
		customerName: "نورا أحمد",
		customerEmail: "nora@example.com",
		items: 2,
		total: 340.0,
		status: "cancelled",
		createdAt: "2024-01-12",
		updatedAt: "2024-01-13",
		paymentMethod: "تحويل بنكي",
		notes: "تم الإلغاء بناءً على طلب العميل",
	},
	{
		id: "5",
		orderNumber: "ORD-2024-005",
		customerName: "خالد العتيبي",
		customerEmail: "khalid@example.com",
		items: 4,
		total: 670.0,
		status: "refunded",
		createdAt: "2024-01-11",
		updatedAt: "2024-01-14",
		paymentMethod: "بطاقة ائتمان",
		notes: "استرداد كامل",
	},
];

const statusConfig = {
	pending: {
		label: "معلق",
		color: "bg-yellow-100 text-yellow-800",
		icon: Clock,
	},
	processing: {
		label: "قيد المعالجة",
		color: "bg-blue-100 text-blue-800",
		icon: AlertCircle,
	},
	completed: {
		label: "مكتمل",
		color: "bg-green-100 text-green-800",
		icon: CheckCircle,
	},
	cancelled: {
		label: "ملغي",
		color: "bg-red-100 text-red-800",
		icon: XCircle,
	},
	refunded: {
		label: "مسترد",
		color: "bg-gray-100 text-gray-800",
		icon: XCircle,
	},
};

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>(sampleOrders);
	const [filteredOrders, setFilteredOrders] = useState<Order[]>(sampleOrders);
	const [searchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(
		"all"
	);
	const [dateFilter, setDateFilter] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	// Filter orders based on search and filters
	useEffect(() => {
		let filtered = orders;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(order) =>
					order.orderNumber
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					order.customerName
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					order.customerEmail
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter(
				(order) => order.status === statusFilter
			);
		}

		// Date filter
		if (dateFilter !== "all") {
			const now = new Date();
			const filterDate = new Date();

			switch (dateFilter) {
				case "today":
					filterDate.setHours(0, 0, 0, 0);
					break;
				case "week":
					filterDate.setDate(now.getDate() - 7);
					break;
				case "month":
					filterDate.setMonth(now.getMonth() - 1);
					break;
			}

			filtered = filtered.filter(
				(order) => new Date(order.createdAt) >= filterDate
			);
		}

		setFilteredOrders(filtered);
	}, [orders, searchTerm, statusFilter, dateFilter]);

	const handleStatusChange = async (
		orderId: string,
		newStatus: OrderStatus
	) => {
		setOrders((prev) =>
			prev.map((order) =>
				order.id === orderId
					? {
							...order,
							status: newStatus,
							updatedAt: new Date().toISOString().split("T")[0],
					  }
					: order
			)
		);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ar-SA");
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي الطلبات
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{orders.length}
							</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<CheckCircle className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">طلبات معلقة</p>
							<p className="text-2xl font-bold text-yellow-600">
								{
									orders.filter((o) => o.status === "pending")
										.length
								}
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
								طلبات مكتملة
							</p>
							<p className="text-2xl font-bold text-green-600">
								{
									orders.filter(
										(o) => o.status === "completed"
									).length
								}
							</p>
						</div>
						<div className="p-2 bg-green-100 rounded-lg">
							<CheckCircle className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي المبيعات
							</p>
							<p className="text-2xl font-bold text-purple-600">
								{formatCurrency(
									orders.reduce(
										(sum, order) => sum + order.total,
										0
									)
								)}
							</p>
						</div>
						<div className="p-2 bg-purple-100 rounded-lg">
							<Download className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-xl border border-gray-200">
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
					<div className="flex flex-wrap gap-3">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							<Filter size={16} />
							<span>تصفية</span>
							<ChevronDown size={16} />
						</button>

						{showFilters && (
							<>
								<select
									value={statusFilter}
									onChange={(e) =>
										setStatusFilter(
											e.target.value as
												| OrderStatus
												| "all"
										)
									}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
								>
									<option value="all">جميع الحالات</option>
									<option value="pending">معلق</option>
									<option value="processing">
										قيد المعالجة
									</option>
									<option value="completed">مكتمل</option>
									<option value="cancelled">ملغي</option>
									<option value="refunded">مسترد</option>
								</select>

								<select
									value={dateFilter}
									onChange={(e) =>
										setDateFilter(e.target.value)
									}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
								>
									<option value="all">جميع التواريخ</option>
									<option value="today">اليوم</option>
									<option value="week">آخر أسبوع</option>
									<option value="month">آخر شهر</option>
								</select>
							</>
						)}
					</div>

					<div className="text-sm text-gray-600">
						عرض {filteredOrders.length} من {orders.length} طلب
					</div>
				</div>
			</div>

			{/* Orders Table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									رقم الطلب
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									العميل
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									العناصر
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									المبلغ
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									التاريخ
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredOrders.map((order) => {
								const statusInfo = statusConfig[order.status];
								const StatusIcon = statusInfo.icon;

								return (
									<tr
										key={order.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{order.orderNumber}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{order.customerName}
												</div>
												<div className="text-sm text-gray-500">
													{order.customerEmail}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{order.items} عنصر
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(order.total)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
											>
												<StatusIcon size={12} />
												{statusInfo.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(order.createdAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<Link
													href={`/dashboard/orders/${order.id}`}
													className="text-blue-600 hover:text-blue-900"
													title="عرض التفاصيل"
												>
													<Eye size={16} />
												</Link>
												<Link
													href={`/dashboard/orders/${order.id}/edit`}
													className="text-gray-600 hover:text-gray-900"
													title="تعديل"
												>
													<Edit size={16} />
												</Link>
												<button
													onClick={() =>
														handleStatusChange(
															order.id,
															"completed"
														)
													}
													className="text-green-600 hover:text-green-900"
													title="تمييز كمكتمل"
												>
													<CheckCircle size={16} />
												</button>
												<button
													onClick={() =>
														handleStatusChange(
															order.id,
															"cancelled"
														)
													}
													className="text-red-600 hover:text-red-900"
													title="إلغاء"
												>
													<XCircle size={16} />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{filteredOrders.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-500 text-lg">
							لا توجد طلبات
						</div>
						<p className="text-gray-400 mt-2">
							لم يتم العثور على طلبات تطابق المعايير المحددة
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
