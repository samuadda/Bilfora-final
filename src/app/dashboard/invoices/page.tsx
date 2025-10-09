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
	Plus,
	Search,
	Trash2,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
	Invoice,
	InvoiceWithClientAndItems,
	CreateInvoiceInput,
	UpdateInvoiceInput,
	InvoiceStatus,
	Client,
	Order,
} from "@/types/database";

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
	const [invoices, setInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [filteredInvoices, setFilteredInvoices] = useState<
		InvoiceWithClientAndItems[]
	>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
		"all"
	);
	const [dateFilter, setDateFilter] = useState("all");
	const [showFilters, setShowFilters] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingInvoice, setEditingInvoice] =
		useState<InvoiceWithClientAndItems | null>(null);
	const [saving, setSaving] = useState(false);

	// Form state for add/edit
	const [formData, setFormData] = useState({
		client_id: "",
		order_id: "",
		issue_date: "",
		due_date: "",
		status: "draft" as InvoiceStatus,
		tax_rate: 15,
		notes: "",
		items: [{ description: "", quantity: 1, unit_price: 0 }],
	});

	// Load invoices, clients, and orders on component mount
	useEffect(() => {
		loadInvoices();
		loadClients();
		loadOrders();
	}, []);

	// Filter invoices when filters change
	useEffect(() => {
		let filtered = [...invoices];

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter((i) => i.status === statusFilter);
		}

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter(
				(i) =>
					i.invoice_number
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					i.client.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					i.client.email
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		// Filter by date
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
				(i) => new Date(i.created_at) >= filterDate
			);
		}

		setFilteredInvoices(filtered);
	}, [invoices, statusFilter, searchTerm, dateFilter]);

	const loadInvoices = async () => {
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

			const { data, error } = await supabase
				.from("invoices")
				.select(
					`
					*,
					client:clients(*),
					order:orders(*),
					items:invoice_items(*)
				`
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error loading invoices:", error);
				setError("فشل في تحميل قائمة الفواتير");
				return;
			}

			setInvoices(data || []);
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setLoading(false);
		}
	};

	const loadClients = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("clients")
				.select("*")
				.eq("user_id", user.id)
				.eq("status", "active")
				.order("name");

			if (error) {
				console.error("Error loading clients:", error);
				return;
			}

			setClients(data || []);
		} catch (err) {
			console.error("Unexpected error loading clients:", err);
		}
	};

	const loadOrders = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("orders")
				.select("*")
				.eq("user_id", user.id)
				.eq("status", "completed")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error loading orders:", error);
				return;
			}

			setOrders(data || []);
		} catch (err) {
			console.error("Unexpected error loading orders:", err);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleItemChange = (
		index: number,
		field: string,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			items: prev.items.map((item, i) =>
				i === index ? { ...item, [field]: value } : item
			),
		}));
	};

	const addItem = () => {
		setFormData((prev) => ({
			...prev,
			items: [
				...prev.items,
				{ description: "", quantity: 1, unit_price: 0 },
			],
		}));
	};

	const removeItem = (index: number) => {
		setFormData((prev) => ({
			...prev,
			items: prev.items.filter((_, i) => i !== index),
		}));
	};

	const resetForm = () => {
		setFormData({
			client_id: "",
			order_id: "",
			issue_date: "",
			due_date: "",
			status: "draft",
			tax_rate: 15,
			notes: "",
			items: [{ description: "", quantity: 1, unit_price: 0 }],
		});
		setEditingInvoice(null);
		setError(null);
		setSuccess(null);
	};

	const handleAddInvoice = () => {
		resetForm();
		setShowAddModal(true);
	};

	const handleEditInvoice = (invoice: InvoiceWithClientAndItems) => {
		setFormData({
			client_id: invoice.client_id,
			order_id: invoice.order_id || "",
			issue_date: invoice.issue_date,
			due_date: invoice.due_date,
			status: invoice.status,
			tax_rate: invoice.tax_rate,
			notes: invoice.notes || "",
			items: invoice.items.map((item) => ({
				description: item.description,
				quantity: item.quantity,
				unit_price: item.unit_price,
			})),
		});
		setEditingInvoice(invoice);
		setShowAddModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setSaving(true);
			setError(null);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			// Calculate totals
			const subtotal = formData.items.reduce(
				(sum, item) => sum + item.quantity * item.unit_price,
				0
			);
			const taxAmount = subtotal * (formData.tax_rate / 100);
			const totalAmount = subtotal + taxAmount;

			if (editingInvoice) {
				// Update existing invoice
				const { error: invoiceError } = await supabase
					.from("invoices")
					.update({
						client_id: formData.client_id,
						order_id: formData.order_id || null,
						issue_date: formData.issue_date,
						due_date: formData.due_date,
						status: formData.status,
						tax_rate: formData.tax_rate,
						subtotal: subtotal,
						tax_amount: taxAmount,
						total_amount: totalAmount,
						notes: formData.notes || null,
					})
					.eq("id", editingInvoice.id);

				if (invoiceError) {
					console.error("Error updating invoice:", invoiceError);
					setError("فشل في تحديث الفاتورة");
					return;
				}

				// Delete existing items and insert new ones
				const { error: deleteError } = await supabase
					.from("invoice_items")
					.delete()
					.eq("invoice_id", editingInvoice.id);

				if (deleteError) {
					console.error("Error deleting invoice items:", deleteError);
					setError("فشل في تحديث عناصر الفاتورة");
					return;
				}

				const { error: insertError } = await supabase
					.from("invoice_items")
					.insert(
						formData.items.map((item) => ({
							invoice_id: editingInvoice.id,
							description: item.description,
							quantity: item.quantity,
							unit_price: item.unit_price,
							total: item.quantity * item.unit_price,
						}))
					);

				if (insertError) {
					console.error(
						"Error inserting invoice items:",
						insertError
					);
					setError("فشل في تحديث عناصر الفاتورة");
					return;
				}

				setSuccess("تم تحديث الفاتورة بنجاح");
			} else {
				// Create new invoice
				const { data: invoiceData, error: invoiceError } =
					await supabase
						.from("invoices")
						.insert({
							user_id: user.id,
							client_id: formData.client_id,
							order_id: formData.order_id || null,
							issue_date: formData.issue_date,
							due_date: formData.due_date,
							status: formData.status,
							tax_rate: formData.tax_rate,
							subtotal: subtotal,
							tax_amount: taxAmount,
							total_amount: totalAmount,
							notes: formData.notes || null,
						})
						.select()
						.single();

				if (invoiceError) {
					console.error("Error creating invoice:", invoiceError);
					setError("فشل في إضافة الفاتورة");
					return;
				}

				// Insert invoice items
				const { error: insertError } = await supabase
					.from("invoice_items")
					.insert(
						formData.items.map((item) => ({
							invoice_id: invoiceData.id,
							description: item.description,
							quantity: item.quantity,
							unit_price: item.unit_price,
							total: item.quantity * item.unit_price,
						}))
					);

				if (insertError) {
					console.error(
						"Error inserting invoice items:",
						insertError
					);
					setError("فشل في إضافة عناصر الفاتورة");
					return;
				}

				setSuccess("تم إضافة الفاتورة بنجاح");
			}

			// Reload invoices and close modal
			await loadInvoices();
			setShowAddModal(false);
			resetForm();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	const handleStatusChange = async (
		invoiceId: string,
		newStatus: InvoiceStatus
	) => {
		try {
			setError(null);

			const { error } = await supabase
				.from("invoices")
				.update({ status: newStatus })
				.eq("id", invoiceId);

			if (error) {
				console.error("Error updating invoice status:", error);
				setError("فشل في تحديث حالة الفاتورة");
				return;
			}

			setSuccess("تم تحديث حالة الفاتورة بنجاح");
			await loadInvoices();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		}
	};

	const handleDeleteInvoice = async (invoiceId: string) => {
		if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;

		try {
			setError(null);

			const { error } = await supabase
				.from("invoices")
				.delete()
				.eq("id", invoiceId);

			if (error) {
				console.error("Error deleting invoice:", error);
				setError("فشل في حذف الفاتورة");
				return;
			}

			setSuccess("تم حذف الفاتورة بنجاح");
			await loadInvoices();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		}
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString("ar-SA");

	const isOverdue = (dueDate: string, status: InvoiceStatus) => {
		return new Date(dueDate) < new Date() && status !== "paid";
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
					<p className="text-gray-500">جاري تحميل الفواتير...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Success/Error Messages */}
			{success && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
					<CheckCircle className="h-5 w-5 text-green-600" />
					<p className="text-green-800">{success}</p>
				</div>
			)}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
					<AlertCircle className="h-5 w-5 text-red-600" />
					<p className="text-red-800">{error}</p>
				</div>
			)}

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
									invoices.filter((i) =>
										isOverdue(i.due_date, i.status)
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
												sum + invoice.total_amount,
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
												sum + invoice.total_amount,
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

			{/* Header with Add Button */}
			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						الفواتير
					</h1>
					<p className="text-gray-500 mt-1">إدارة فواتير العملاء</p>
				</div>
				<button
					onClick={handleAddInvoice}
					className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:translate-y-[1px]"
				>
					<Plus size={16} />
					إنشاء فاتورة جديدة
				</button>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-xl border border-gray-200">
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
					<div className="flex flex-wrap gap-3">
						<div className="relative">
							<Search
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="text"
								placeholder="البحث في الفواتير..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-3 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 w-64"
							/>
						</div>
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
								const isOverdueInvoice = isOverdue(
									invoice.due_date,
									invoice.status
								);

								return (
									<tr
										key={invoice.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{invoice.invoice_number}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{invoice.client.name}
												</div>
												<div className="text-sm text-gray-500">
													{invoice.client.email}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{formatCurrency(
												invoice.total_amount
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(invoice.tax_amount)}
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
											{formatDate(invoice.due_date)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														handleEditInvoice(
															invoice
														)
													}
													className="text-gray-600 hover:text-gray-900"
													title="تعديل"
												>
													<Edit size={16} />
												</button>
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
												<button
													onClick={() =>
														handleDeleteInvoice(
															invoice.id
														)
													}
													className="text-red-600 hover:text-red-900"
													title="حذف"
												>
													<Trash2 size={16} />
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
						<button
							onClick={handleAddInvoice}
							className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
						>
							<FileText size={16} />
							إنشاء فاتورة جديدة
						</button>
					</div>
				)}
			</div>

			{/* Add/Edit Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
						<h2 className="text-xl font-bold mb-4">
							{editingInvoice
								? "تعديل الفاتورة"
								: "إنشاء فاتورة جديدة"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										العميل *
									</label>
									<select
										name="client_id"
										value={formData.client_id}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										required
									>
										<option value="">اختر العميل</option>
										{clients.map((client) => (
											<option
												key={client.id}
												value={client.id}
											>
												{client.name} - {client.email}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										الطلب (اختياري)
									</label>
									<select
										name="order_id"
										value={formData.order_id}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									>
										<option value="">اختر الطلب</option>
										{orders.map((order) => (
											<option
												key={order.id}
												value={order.id}
											>
												{order.order_number} -{" "}
												{formatCurrency(
													order.total_amount
												)}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										تاريخ الإصدار *
									</label>
									<input
										name="issue_date"
										type="date"
										value={formData.issue_date}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										required
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										تاريخ الاستحقاق *
									</label>
									<input
										name="due_date"
										type="date"
										value={formData.due_date}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										required
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										الحالة
									</label>
									<select
										name="status"
										value={formData.status}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									>
										<option value="draft">مسودة</option>
										<option value="sent">مرسلة</option>
										<option value="paid">مدفوعة</option>
										<option value="cancelled">ملغية</option>
									</select>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										معدل الضريبة (%)
									</label>
									<input
										name="tax_rate"
										type="number"
										min="0"
										max="100"
										step="0.01"
										value={formData.tax_rate}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									/>
								</div>
							</div>

							{/* Invoice Items */}
							<div>
								<div className="flex items-center justify-between mb-4">
									<label className="block text-sm text-gray-600">
										عناصر الفاتورة *
									</label>
									<button
										type="button"
										onClick={addItem}
										className="text-purple-600 hover:text-purple-700 text-sm"
									>
										+ إضافة عنصر
									</button>
								</div>

								<div className="space-y-3">
									{formData.items.map((item, index) => (
										<div
											key={index}
											className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
										>
											<div className="md:col-span-2">
												<label className="block text-xs text-gray-600 mb-1">
													الوصف
												</label>
												<input
													value={item.description}
													onChange={(e) =>
														handleItemChange(
															index,
															"description",
															e.target.value
														)
													}
													className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
													placeholder="وصف العنصر"
													required
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													الكمية
												</label>
												<input
													type="number"
													min="1"
													value={item.quantity}
													onChange={(e) =>
														handleItemChange(
															index,
															"quantity",
															parseInt(
																e.target.value
															) || 1
														)
													}
													className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
													required
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1">
													السعر
												</label>
												<div className="flex gap-2">
													<input
														type="number"
														min="0"
														step="0.01"
														value={item.unit_price}
														onChange={(e) =>
															handleItemChange(
																index,
																"unit_price",
																parseFloat(
																	e.target
																		.value
																) || 0
															)
														}
														className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
														required
													/>
													<button
														type="button"
														onClick={() =>
															removeItem(index)
														}
														className="text-red-600 hover:text-red-700 p-2"
														disabled={
															formData.items
																.length === 1
														}
													>
														<Trash2 size={16} />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-600 mb-1">
									ملاحظات
								</label>
								<textarea
									name="notes"
									value={formData.notes}
									onChange={handleInputChange}
									rows={3}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="ملاحظات إضافية"
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-4">
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										resetForm();
									}}
									className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
								>
									إلغاء
								</button>
								<button
									type="submit"
									disabled={saving}
									className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{saving && (
										<Loader2
											size={16}
											className="animate-spin"
										/>
									)}
									{saving
										? "جاري الحفظ..."
										: editingInvoice
										? "تحديث"
										: "إنشاء"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
