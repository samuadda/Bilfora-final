"use client";

import { useEffect, useState } from "react";
import {
	UserPlus,
	Users,
	Mail,
	Phone,
	MapPin,
	CalendarDays,
	Building2,
	Filter,
	ChevronDown,
	Edit,
	Eye,
} from "lucide-react";
import Link from "next/link";

// Client type
interface Client {
	id: string;
	name: string;
	email: string;
	phone: string;
	company: string;
	location: string;
	createdAt: string;
	lastOrderAt?: string;
	totalOrders: number;
	totalSpent: number;
	status: "active" | "inactive" | "prospect";
}

// Sample clients
const sampleClients: Client[] = [
	{
		id: "1",
		name: "شركة التقنية المتقدمة",
		email: "contact@tech-advanced.com",
		phone: "+966 55 123 4567",
		company: "التقنية المتقدمة",
		location: "الرياض، السعودية",
		createdAt: "2023-10-12",
		lastOrderAt: "2024-01-20",
		totalOrders: 12,
		totalSpent: 18500,
		status: "active",
	},
	{
		id: "2",
		name: "مؤسسة البناء الحديث",
		email: "info@modern-construction.com",
		phone: "+966 53 987 6543",
		company: "البناء الحديث",
		location: "جدة، السعودية",
		createdAt: "2023-07-05",
		lastOrderAt: "2024-01-12",
		totalOrders: 7,
		totalSpent: 9200,
		status: "active",
	},
	{
		id: "3",
		name: "شركة الخدمات الرقمية",
		email: "hello@digital-services.com",
		phone: "+966 50 222 3344",
		company: "الخدمات الرقمية",
		location: "الدمام، السعودية",
		createdAt: "2024-01-02",
		totalOrders: 0,
		totalSpent: 0,
		status: "prospect",
	},
	{
		id: "4",
		name: "مجموعة الاستثمار الذكي",
		email: "team@smart-investment.com",
		phone: "+966 54 111 2233",
		company: "الاستثمار الذكي",
		location: "أبها، السعودية",
		createdAt: "2022-12-10",
		lastOrderAt: "2023-10-18",
		totalOrders: 3,
		totalSpent: 4300,
		status: "inactive",
	},
];

const statusConfig = {
	active: {
		label: "نشط",
		className: "bg-green-100 text-green-800",
	},
	inactive: {
		label: "غير نشط",
		className: "bg-gray-100 text-gray-800",
	},
	prospect: {
		label: "محتمل",
		className: "bg-yellow-100 text-yellow-800",
	},
};

export default function ClientsPage() {
	const [clients] = useState<Client[]>(sampleClients);
	const [filteredClients, setFilteredClients] =
		useState<Client[]>(sampleClients);
	const [statusFilter, setStatusFilter] = useState<"all" | Client["status"]>(
		"all"
	);
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		let list = [...clients];
		if (statusFilter !== "all") {
			list = list.filter((c) => c.status === statusFilter);
		}
		setFilteredClients(list);
	}, [clients, statusFilter]);

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);

	return (
		<div className="space-y-6">
			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي العملاء
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{clients.length}
							</p>
						</div>
						<div className="p-2 bg-purple-100 rounded-lg">
							<Users className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">عملاء نشطون</p>
							<p className="text-2xl font-bold text-green-600">
								{
									clients.filter((c) => c.status === "active")
										.length
								}
							</p>
						</div>
						<div className="p-2 bg-green-100 rounded-lg">
							<UserPlus className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								قيمة إجمالية
							</p>
							<p className="text-2xl font-bold text-blue-600">
								{formatCurrency(
									clients.reduce(
										(s, c) => s + c.totalSpent,
										0
									)
								)}
							</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<Building2 className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">بدون طلبات</p>
							<p className="text-2xl font-bold text-orange-600">
								{
									clients.filter((c) => c.totalOrders === 0)
										.length
								}
							</p>
						</div>
						<div className="p-2 bg-orange-100 rounded-lg">
							<CalendarDays className="w-6 h-6 text-orange-600" />
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
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(
										e.target.value as
											| Client["status"]
											| "all"
									)
								}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
							>
								<option value="all">جميع الحالات</option>
								<option value="active">نشط</option>
								<option value="inactive">غير نشط</option>
								<option value="prospect">محتمل</option>
							</select>
						)}
					</div>
					<div className="text-sm text-gray-600">
						عرض {filteredClients.length} من {clients.length} عميل
					</div>
				</div>
			</div>

			{/* Clients table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									العميل
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الشركة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									التواصل
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الطلبات
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									إجمالي الإنفاق
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredClients.map((c) => {
								const status = statusConfig[c.status];
								return (
									<tr key={c.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="space-y-0.5">
												<div className="text-sm font-medium text-gray-900">
													{c.name}
												</div>
												<div className="text-xs text-gray-500 flex items-center gap-1">
													<Mail size={12} />
													{c.email}
												</div>
												<div className="text-xs text-gray-500 flex items-center gap-1">
													<Phone size={12} />
													{c.phone}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="flex items-center gap-2">
												<Building2
													size={14}
													className="text-gray-500"
												/>
												<span>{c.company}</span>
											</div>
											<div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
												<MapPin size={12} />
												{c.location}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="text-xs text-gray-500 flex items-center gap-1">
												<CalendarDays size={12} />
												<span>
													منذ{" "}
													{new Date(
														c.createdAt
													).toLocaleDateString(
														"ar-SA"
													)}
												</span>
											</div>
											<div className="text-xs text-gray-500 mt-1">
												آخر طلب:{" "}
												{c.lastOrderAt
													? new Date(
															c.lastOrderAt
													  ).toLocaleDateString(
															"ar-SA"
													  )
													: "—"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{c.totalOrders}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(c.totalSpent)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
											>
												{status.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<Link
													href={`/dashboard/clients/${c.id}`}
													className="text-blue-600 hover:text-blue-900"
													title="عرض"
												>
													<Eye size={16} />
												</Link>
												<Link
													href={`/dashboard/clients/${c.id}/edit`}
													className="text-gray-600 hover:text-gray-900"
													title="تعديل"
												>
													<Edit size={16} />
												</Link>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{filteredClients.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-500 text-lg">
							لا توجد نتائج
						</div>
						<p className="text-gray-400 mt-2">
							جرّب تعديل معايير التصفية
						</p>
						<Link
							href="/dashboard/clients/new"
							className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
						>
							<UserPlus size={16} />
							إضافة عميل جديد
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
