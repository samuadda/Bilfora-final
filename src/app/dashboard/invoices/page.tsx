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
	FileText,
	Send,
} from "lucide-react";
import Link from "next/link";

// Invoice status types
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface Invoice {
	id: string;
	invoiceNumber: string;
	customerName: string;
	customerEmail: string;
	items: number;
	subtotal: number;
	tax: number;
	total: number;
	status: InvoiceStatus;
	createdAt: string;
	dueDate: string;
	paidAt?: string;
	paymentMethod?: string;
	notes?: string;
}

// Sample data
const sampleInvoices: Invoice[] = [
	{
		id: "1",
		invoiceNumber: "INV-2024-001",
		customerName: "شركة التقنية المتقدمة",
		customerEmail: "billing@tech-advanced.com",
		items: 3,
		subtotal: 400.0,
		tax: 60.0,
		total: 460.0,
		status: "paid",
		createdAt: "2024-01-15",
		dueDate: "2024-02-15",
		paidAt: "2024-01-20",
		paymentMethod: "تحويل بنكي",
		notes: "دفع مبكر - خصم 5%",
	},
	{
		id: "2",
		invoiceNumber: "INV-2024-002",
		customerName: "مؤسسة البناء الحديث",
		customerEmail: "accounts@modern-construction.com",
		items: 1,
		subtotal: 100.0,
		tax: 15.0,
		total: 115.0,
		status: "sent",
		createdAt: "2024-01-14",
		dueDate: "2024-02-14",
	},
	{
		id: "3",
		invoiceNumber: "INV-2024-003",
		customerName: "مجموعة الاستثمار الذكي",
		customerEmail: "finance@smart-investment.com",
		items: 5,
		subtotal: 750.0,
		tax: 112.5,
		total: 862.5,
		status: "overdue",
		createdAt: "2024-01-10",
		dueDate: "2024-01-25",
	},
	{
		id: "4",
		invoiceNumber: "INV-2024-004",
		customerName: "شركة الخدمات الرقمية",
		customerEmail: "billing@digital-services.com",
		items: 2,
		subtotal: 300.0,
		tax: 45.0,
		total: 345.0,
		status: "draft",
		createdAt: "2024-01-12",
		dueDate: "2024-02-12",
		notes: "في انتظار الموافقة النهائية",
	},
	{
		id: "5",
		invoiceNumber: "INV-2024-005",
		customerName: "مؤسسة التطوير العقاري",
		customerEmail: "accounts@real-estate-dev.com",
		items: 4,
		subtotal: 600.0,
		tax: 90.0,
		total: 690.0,
		status: "cancelled",
		createdAt: "2024-01-08",
		dueDate: "2024-02-08",
		notes: "تم الإلغاء - تغيير في نطاق المشروع",
	},
	{
		id: "6",
		invoiceNumber: "INV-2024-006",
		customerName: "شركة النقل السريع",
		customerEmail: "billing@fast-transport.com",
		items: 1,
		subtotal: 250.0,
		tax: 37.5,
		total: 287.5,
		status: "sent",
		createdAt: "2024-01-20",
		dueDate: "2024-02-20",
	},
	{
		id: "7",
		invoiceNumber: "INV-2024-007",
		customerName: "مؤسسة التصنيع المتقدم",
		customerEmail: "finance@advanced-manufacturing.com",
		items: 6,
		subtotal: 1200.0,
		tax: 180.0,
		total: 1380.0,
		status: "paid",
		createdAt: "2024-01-18",
		dueDate: "2024-02-18",
		paidAt: "2024-01-25",
		paymentMethod: "بطاقة ائتمان",
		notes: "دفع جزئي - المتبقي 500 ريال",
	},
];

const statusConfig = {
	draft: {
		label: "مسودة",
		color: "bg-gray-100 text-gray-800",
		icon: FileText,
	},
	sent: {
		label: "مرسلة",
		color: "bg-blue-100 text-blue-800",
		icon: Send,
	},
	paid: {
		label: "مدفوعة",
		color: "bg-green-100 text-green-800",
		icon: CheckCircle,
	},
	overdue: {
		label: "متأخرة",
		color: "bg-red-100 text-red-800",
		icon: AlertCircle,
	},
	cancelled: {
		label: "ملغية",
		color: "bg-gray-100 text-gray-800",
		icon: XCircle,
	},
};

export default function InvoicesPage() {
	const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices);
	const [filteredInvoices, setFilteredInvoices] =
		useState<Invoice[]>(sampleInvoices);
	const [searchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
		"all"
	);
	const [dateFilter, setDateFilter] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	// Filter invoices based on search and filters
	useEffect(() => {
		let filtered = invoices;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(invoice) =>
					invoice.invoiceNumber
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					invoice.customerName
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					invoice.customerEmail
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter(
				(invoice) => invoice.status === statusFilter
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
				(invoice) => new Date(invoice.createdAt) >= filterDate
			);
		}

		setFilteredInvoices(filtered);
	}, [invoices, searchTerm, statusFilter, dateFilter]);

	const handleStatusChange = async (
		invoiceId: string,
		newStatus: InvoiceStatus
	) => {
		setInvoices((prev) =>
			prev.map((invoice) =>
				invoice.id === invoiceId
					? {
							...invoice,
							status: newStatus,
							paidAt:
								newStatus === "paid"
									? new Date().toISOString().split("T")[0]
									: undefined,
					  }
					: invoice
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

	const isOverdue = (dueDate: string) => {
		return (
			new Date(dueDate) < new Date() &&
			!invoices.find((inv) => inv.dueDate === dueDate)?.paidAt
		);
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								إجمالي الفواتير
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{invoices.length}
							</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<FileText className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								فواتير متأخرة
							</p>
							<p className="text-2xl font-bold text-red-600">
								{
									invoices.filter(
										(i) =>
											new Date(i.dueDate) < new Date() &&
											i.status !== "paid"
									).length
								}
							</p>
						</div>
						<div className="p-2 bg-red-100 rounded-lg">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								المبلغ المستحق
							</p>
							<p className="text-2xl font-bold text-orange-600">
								{formatCurrency(
									invoices
										.filter(
											(i) =>
												i.status !== "paid" &&
												i.status !== "cancelled"
										)
										.reduce(
											(sum, invoice) =>
												sum + invoice.total,
											0
										)
								)}
							</p>
						</div>
						<div className="p-2 bg-orange-100 rounded-lg">
							<Clock className="w-6 h-6 text-orange-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								المبلغ المحصل
							</p>
							<p className="text-2xl font-bold text-green-600">
								{formatCurrency(
									invoices
										.filter((i) => i.status === "paid")
										.reduce(
											(sum, invoice) =>
												sum + invoice.total,
											0
										)
								)}
							</p>
						</div>
						<div className="p-2 bg-green-100 rounded-lg">
							<CheckCircle className="w-6 h-6 text-green-600" />
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
												| InvoiceStatus
												| "all"
										)
									}
									className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
								>
									<option value="all">جميع الحالات</option>
									<option value="draft">مسودة</option>
									<option value="sent">مرسلة</option>
									<option value="paid">مدفوعة</option>
									<option value="overdue">متأخرة</option>
									<option value="cancelled">ملغية</option>
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
						عرض {filteredInvoices.length} من {invoices.length}{" "}
						فاتورة
					</div>
				</div>
			</div>

			{/* Invoices Table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									رقم الفاتورة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									العميل
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									المبلغ الإجمالي
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الضريبة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									تاريخ الاستحقاق
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredInvoices.map((invoice) => {
								const statusInfo = statusConfig[invoice.status];
								const StatusIcon = statusInfo.icon;
								const isOverdueInvoice =
									isOverdue(invoice.dueDate) &&
									invoice.status !== "paid";

								return (
									<tr
										key={invoice.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{invoice.invoiceNumber}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{invoice.customerName}
												</div>
												<div className="text-sm text-gray-500">
													{invoice.customerEmail}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(invoice.total)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(invoice.tax)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
													isOverdueInvoice
														? "bg-red-100 text-red-800"
														: statusInfo.color
												}`}
											>
												<StatusIcon size={12} />
												{isOverdueInvoice
													? "متأخرة"
													: statusInfo.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(invoice.dueDate)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<Link
													href={`/dashboard/invoices/${invoice.id}`}
													className="text-blue-600 hover:text-blue-900"
													title="عرض الفاتورة"
												>
													<Eye size={16} />
												</Link>
												<Link
													href={`/dashboard/invoices/${invoice.id}/edit`}
													className="text-gray-600 hover:text-gray-900"
													title="تعديل الفاتورة"
												>
													<Edit size={16} />
												</Link>
												<button
													className="text-green-600 hover:text-green-900"
													title="تحميل PDF"
												>
													<Download size={16} />
												</button>
												<button
													onClick={() =>
														handleStatusChange(
															invoice.id,
															"sent"
														)
													}
													className="text-blue-600 hover:text-blue-900"
													title="إرسال الفاتورة"
												>
													<Send size={16} />
												</button>
												<button
													onClick={() =>
														handleStatusChange(
															invoice.id,
															"paid"
														)
													}
													className="text-green-600 hover:text-green-900"
													title="تمييز كمدفوعة"
												>
													<CheckCircle size={16} />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{filteredInvoices.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-500 text-lg">
							لا توجد فواتير
						</div>
						<p className="text-gray-400 mt-2">
							لم يتم العثور على فواتير تطابق المعايير المحددة
						</p>
						<Link
							href="/dashboard/invoices/new"
							className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
						>
							<FileText size={16} />
							إنشاء فاتورة جديدة
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
