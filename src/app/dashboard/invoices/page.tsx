"use client";

import { useState, useEffect, useMemo } from "react";
import {
	Eye,
	Download,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
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
	Calendar,
	Check,
	ArrowDown,
	ArrowUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/dialog";
import { supabase } from "@/lib/supabase";
import { InvoiceWithClientAndItems, InvoiceStatus } from "@/types/database";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";

const statusConfig = {
	draft: {
		label: "مسودة",
		color: "bg-gray-100 text-gray-600 border-gray-200",
		icon: FileText,
	},
	sent: {
		label: "مرسلة",
		color: "bg-blue-50 text-blue-600 border-blue-100",
		icon: Send,
	},
	paid: {
		label: "مدفوعة",
		color: "bg-green-50 text-green-600 border-green-100",
		icon: CheckCircle,
	},
	overdue: {
		label: "متأخرة",
		color: "bg-orange-50 text-orange-600 border-orange-100",
		icon: AlertCircle,
	},
	cancelled: {
		label: "ملغية",
		color: "bg-red-50 text-red-600 border-red-100",
		icon: XCircle,
	},
};

type SortField = "amount" | "issue_date" | "due_date" | null;
type SortDirection = "asc" | "desc";
type AmountFilter = "all" | "under-1000" | "1000-5000" | "over-5000";

// Helper functions
const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "SAR",
		maximumFractionDigits: 0,
	}).format(amount);

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-GB");
};

const isOverdue = (dueDate: string, status: InvoiceStatus): boolean => {
	return (
		new Date(dueDate) < new Date() &&
		status !== "paid" &&
		status !== "cancelled"
	);
};

const getDaysDifference = (dueDate: string): number => {
	const due = new Date(dueDate);
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	due.setHours(0, 0, 0, 0);
	const diffTime = due.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDueDateInfo = (
	invoice: InvoiceWithClientAndItems
): { text: string; color: string } | null => {
	if (invoice.status === "paid") {
		return null;
	}

	const days = getDaysDifference(invoice.due_date);

	if (days < 0) {
		return {
			text: `متأخرة ${Math.abs(days)} أيام`,
			color: "text-red-600",
		};
	} else if (days === 0) {
		return {
			text: "مستحقة اليوم",
			color: "text-orange-600",
		};
	} else if (days <= 7) {
		return {
			text: `متبقي ${days} أيام`,
			color: "text-amber-600",
		};
	} else {
		return {
			text: `متبقي ${days} أيام`,
			color: "text-green-600",
		};
	}
};

export default function InvoicesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [invoices, setInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [filteredInvoices, setFilteredInvoices] = useState<
		InvoiceWithClientAndItems[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
		"all"
	);
	const [dateFilter, setDateFilter] = useState("all");
	const [clientFilter, setClientFilter] = useState<string>("all");
	const [amountFilter, setAmountFilter] = useState<AmountFilter>("all");
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [deleteCandidate, setDeleteCandidate] =
		useState<InvoiceWithClientAndItems | null>(null);
	const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Sorting
	const [sortField, setSortField] = useState<SortField>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Bulk selection
	const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(
		new Set()
	);

	// Get unique clients from invoices
	const uniqueClients = useMemo(() => {
		const clients = invoices.map((inv) => inv.client.name);
		return Array.from(new Set(clients)).sort();
	}, [invoices]);

	// Initialize from URL params
	useEffect(() => {
		const status = searchParams.get("status");
		const date = searchParams.get("date");
		const client = searchParams.get("client");
		const amount = searchParams.get("amount");
		const search = searchParams.get("search");
		const sort = searchParams.get("sort");
		const sortDir = searchParams.get("sortDir");

		if (
			status &&
			(status === "all" || Object.keys(statusConfig).includes(status))
		) {
			setStatusFilter(status as InvoiceStatus | "all");
		}
		if (date) setDateFilter(date);
		if (client) setClientFilter(client);
		if (
			amount &&
			["all", "under-1000", "1000-5000", "over-5000"].includes(amount)
		) {
			setAmountFilter(amount as AmountFilter);
		}
		if (search) setSearchTerm(search);
		if (sort && ["amount", "issue_date", "due_date"].includes(sort)) {
			setSortField(sort as SortField);
		}
		if (sortDir && ["asc", "desc"].includes(sortDir)) {
			setSortDirection(sortDir as SortDirection);
		}
	}, [searchParams]);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();
		if (statusFilter !== "all") params.set("status", statusFilter);
		if (dateFilter !== "all") params.set("date", dateFilter);
		if (clientFilter !== "all") params.set("client", clientFilter);
		if (amountFilter !== "all") params.set("amount", amountFilter);
		if (searchTerm) params.set("search", searchTerm);
		if (sortField) {
			params.set("sort", sortField);
			params.set("sortDir", sortDirection);
		}

		const queryString = params.toString();
		const newUrl = queryString
			? `?${queryString}`
			: window.location.pathname;
		router.replace(newUrl, { scroll: false });
	}, [
		statusFilter,
		dateFilter,
		clientFilter,
		amountFilter,
		searchTerm,
		sortField,
		sortDirection,
		router,
	]);

	useEffect(() => {
		loadInvoices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let filtered = [...invoices];

		// Status filter
		if (statusFilter !== "all") {
			if (statusFilter === "overdue") {
				filtered = filtered.filter((i) =>
					isOverdue(i.due_date, i.status)
				);
			} else {
				filtered = filtered.filter((i) => i.status === statusFilter);
			}
		}

		// Search filter
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
						?.toLowerCase()
						.includes(searchTerm.toLowerCase())
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
				(i) => new Date(i.created_at) >= filterDate
			);
		}

		// Client filter
		if (clientFilter !== "all") {
			filtered = filtered.filter((i) => i.client.name === clientFilter);
		}

		// Amount filter
		if (amountFilter !== "all") {
			switch (amountFilter) {
				case "under-1000":
					filtered = filtered.filter((i) => i.total_amount < 1000);
					break;
				case "1000-5000":
					filtered = filtered.filter(
						(i) => i.total_amount >= 1000 && i.total_amount <= 5000
					);
					break;
				case "over-5000":
					filtered = filtered.filter((i) => i.total_amount > 5000);
					break;
			}
		}

		// Sorting
		if (sortField) {
			filtered.sort((a, b) => {
				let aVal: number | string;
				let bVal: number | string;

				switch (sortField) {
					case "amount":
						aVal = a.total_amount;
						bVal = b.total_amount;
						break;
					case "issue_date":
						aVal = new Date(a.created_at).getTime();
						bVal = new Date(b.created_at).getTime();
						break;
					case "due_date":
						aVal = new Date(a.due_date).getTime();
						bVal = new Date(b.due_date).getTime();
						break;
					default:
						return 0;
				}

				if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
				if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
				return 0;
			});
		}

		setFilteredInvoices(filtered);
		setCurrentPage(1);
		// Clear selection if selected invoices are no longer visible
		setSelectedInvoiceIds((prev) => {
			const filteredIds = new Set(filtered.map((i) => i.id));
			return new Set([...prev].filter((id) => filteredIds.has(id)));
		});
	}, [
		invoices,
		statusFilter,
		searchTerm,
		dateFilter,
		clientFilter,
		amountFilter,
		sortField,
		sortDirection,
	]);

	// Pagination
	const totalPages = Math.ceil(filteredInvoices.length / pageSize);
	const paginatedInvoices = filteredInvoices.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	const allSelected =
		paginatedInvoices.length > 0 &&
		selectedInvoiceIds.size === paginatedInvoices.length;
	const hasSelected = selectedInvoiceIds.size > 0;

	const loadInvoices = async () => {
		try {
			setLoading(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				router.push("/login");
				return;
			}

			const { data, error } = await supabase
				.from("invoices")
				.select(
					`
					*,
					client:clients(*),
					items:invoice_items(*)
				`
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) throw error;

			setInvoices(data || []);
		} catch (err) {
			console.error("Unexpected error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleInvoiceSuccess = () => {
		loadInvoices();
	};

	const handleStatusChange = async (
		invoiceIds: string | string[],
		newStatus: InvoiceStatus
	) => {
		try {
			const ids = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];
			const { error } = await supabase
				.from("invoices")
				.update({ status: newStatus })
				.in("id", ids);

			if (error) throw error;
			setSelectedInvoiceIds(new Set());
			await loadInvoices();
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const handleDeleteInvoice = async (invoiceIds: string | string[]) => {
		try {
			const ids = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];
			const { error } = await supabase
				.from("invoices")
				.delete()
				.in("id", ids);

			if (error) throw error;
			setDeleteCandidate(null);
			setShowBulkDeleteDialog(false);
			setSelectedInvoiceIds(new Set());
			await loadInvoices();
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	const toggleSelect = (id: string) => {
		setSelectedInvoiceIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (allSelected) {
			setSelectedInvoiceIds(new Set());
		} else {
			setSelectedInvoiceIds(new Set(paginatedInvoices.map((i) => i.id)));
		}
	};

	const handleBulkStatusChange = async (newStatus: InvoiceStatus) => {
		if (selectedInvoiceIds.size === 0) return;
		setBulkActionLoading(true);
		try {
			await handleStatusChange(Array.from(selectedInvoiceIds), newStatus);
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedInvoiceIds.size === 0) return;
		setBulkActionLoading(true);
		try {
			await handleDeleteInvoice(Array.from(selectedInvoiceIds));
		} finally {
			setBulkActionLoading(false);
		}
	};

	const exportToCSV = () => {
		const headers = [
			"رقم الفاتورة",
			"اسم العميل",
			"البريد الإلكتروني",
			"المبلغ",
			"الحالة",
			"تاريخ الإصدار",
			"تاريخ الاستحقاق",
		];

		const rows = filteredInvoices.map((invoice) => [
			invoice.invoice_number,
			invoice.client.name,
			invoice.client.email || "",
			invoice.total_amount.toString(),
			statusConfig[invoice.status]?.label || invoice.status,
			formatDate(invoice.created_at),
			formatDate(invoice.due_date),
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob(["\uFEFF" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`invoices-export-${new Date().toISOString().split("T")[0]}.csv`
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Stats calculations (from all invoices, not filtered)
	const stats = useMemo(() => {
		const total = invoices.length;
		const overdue = invoices.filter((i) =>
			isOverdue(i.due_date, i.status)
		).length;
		const dueIn7Days = invoices.filter((i) => {
			if (i.status === "paid" || i.status === "cancelled") return false;
			const days = getDaysDifference(i.due_date);
			return days >= 0 && days <= 7;
		});
		const dueIn7DaysAmount = dueIn7Days.reduce(
			(sum, i) => sum + i.total_amount,
			0
		);
		const outstanding = invoices.filter(
			(i) => i.status !== "paid" && i.status !== "cancelled"
		);
		const outstandingAmount = outstanding.reduce(
			(sum, i) => sum + i.total_amount,
			0
		);
		const paid = invoices.filter((i) => i.status === "paid");
		const paidAmount = paid.reduce((sum, i) => sum + i.total_amount, 0);

		return {
			total,
			overdue,
			outstandingAmount,
			paidAmount,
			dueIn7DaysAmount,
		};
	}, [invoices]);

	if (loading) {
		return <LoadingState message="جاري جلب الفواتير..." />;
	}

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
			<div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-[#012d46]">
						الفواتير
					</h1>
					<p className="text-gray-500 mt-2 text-lg">
						إدارة ومتابعة فواتير العملاء
					</p>
				</div>
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setShowInvoiceModal(true)}
					className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-6 py-3 text-base font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
				>
					<Plus size={20} strokeWidth={2.5} />
					<span>إنشاء فاتورة جديدة</span>
				</motion.button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
				<StatsCard
					title="إجمالي الفواتير"
					value={stats.total}
					icon={FileText}
					color="blue"
				/>
				<StatsCard
					title="فواتير متأخرة"
					value={stats.overdue}
					icon={AlertCircle}
					color="orange"
					isWarning={true}
				/>
				<StatsCard
					title="المبلغ المستحق"
					value={formatCurrency(stats.outstandingAmount)}
					icon={Clock}
					color="purple"
				/>
				<StatsCard
					title="المبلغ المحصل"
					value={formatCurrency(stats.paidAmount)}
					icon={CheckCircle}
					color="green"
				/>
				<StatsCard
					title="مستحق خلال ٧ أيام"
					value={formatCurrency(stats.dueIn7DaysAmount)}
					icon={Calendar}
					color="indigo"
				/>
			</div>

			{/* Bulk Actions Bar */}
			{hasSelected && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7f2dfb] flex items-center justify-center flex-shrink-0">
							<Check size={20} />
						</div>
						<div>
							<p className="font-bold text-gray-900 text-sm">
								تم تحديد {selectedInvoiceIds.size} فاتورة
							</p>
							<p className="text-xs text-gray-500 mt-0.5">
								اختر إجراءاً لتطبيقه على الفواتير المحددة
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2 flex-wrap">
						<button
							type="button"
							onClick={() => handleBulkStatusChange("paid")}
							disabled={bulkActionLoading}
							className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<CheckCircle size={16} />
							تحديد كـ مدفوعة
						</button>
						<button
							type="button"
							onClick={() => handleBulkStatusChange("sent")}
							disabled={bulkActionLoading}
							className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Send size={16} />
							تحديد كـ مرسلة
						</button>
						<button
							type="button"
							onClick={() => setShowBulkDeleteDialog(true)}
							disabled={bulkActionLoading}
							className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Trash2 size={16} />
							حذف
						</button>
						<button
							type="button"
							onClick={() => setSelectedInvoiceIds(new Set())}
							className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium transition-colors"
						>
							<XCircle size={16} />
							إلغاء
						</button>
					</div>
				</motion.div>
			)}

			{/* Filters & Search */}
			<div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
				<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
					<div className="relative w-full lg:w-96">
						<Search
							className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
							size={20}
						/>
						<input
							type="text"
							placeholder="البحث برقم الفاتورة، اسم العميل..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all"
						/>
					</div>

					<div className="flex flex-wrap gap-3 w-full lg:w-auto">
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(
										e.target.value as InvoiceStatus | "all"
									)
								}
								className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb]"
							>
								<option value="all">جميع الحالات</option>
								<option value="draft">مسودة</option>
								<option value="sent">مرسلة</option>
								<option value="paid">مدفوعة</option>
								<option value="cancelled">ملغية</option>
								<option value="overdue">متأخرة</option>
							</select>
							<ChevronDown
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								size={16}
							/>
						</div>
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<select
								value={dateFilter}
								onChange={(e) => setDateFilter(e.target.value)}
								className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb]"
							>
								<option value="all">كل الوقت</option>
								<option value="today">اليوم</option>
								<option value="week">هذا الأسبوع</option>
								<option value="month">هذا الشهر</option>
							</select>
							<ChevronDown
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								size={16}
							/>
						</div>
						{uniqueClients.length > 0 && (
							<div className="relative flex-1 lg:flex-none min-w-[140px]">
								<select
									value={clientFilter}
									onChange={(e) =>
										setClientFilter(e.target.value)
									}
									className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb]"
								>
									<option value="all">كل العملاء</option>
									{uniqueClients.map((client) => (
										<option key={client} value={client}>
											{client}
										</option>
									))}
								</select>
								<ChevronDown
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
									size={16}
								/>
							</div>
						)}
						<div className="relative flex-1 lg:flex-none min-w-[140px]">
							<select
								value={amountFilter}
								onChange={(e) =>
									setAmountFilter(
										e.target.value as AmountFilter
									)
								}
								className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb]"
							>
								<option value="all">كل المبالغ</option>
								<option value="under-1000">أقل من 1,000</option>
								<option value="1000-5000">
									من 1,000 إلى 5,000
								</option>
								<option value="over-5000">أكثر من 5,000</option>
							</select>
							<ChevronDown
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								size={16}
							/>
						</div>
						<button
							type="button"
							onClick={exportToCSV}
							className="inline-flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium transition-colors"
						>
							<Download size={18} />
							تصدير (CSV)
						</button>
					</div>
				</div>
			</div>

			{/* Invoices Table */}
			<div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50 border-b border-gray-100">
							<tr>
								<th className="px-4 py-4 text-center w-12">
									<button
										type="button"
										onClick={toggleSelectAll}
										className="p-1 hover:bg-gray-200 rounded transition-colors"
										title="تحديد الكل"
									>
										{allSelected ? (
											<Check className="w-5 h-5 text-[#7f2dfb]" />
										) : (
											<div className="w-5 h-5 border-2 border-gray-300 rounded" />
										)}
									</button>
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									رقم الفاتورة
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									العميل
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("amount")}
								>
									<div className="flex items-center justify-end gap-1">
										المبلغ
										{sortField === "amount" &&
											(sortDirection === "asc" ? (
												<ArrowUp
													size={14}
													className="text-[#7f2dfb]"
												/>
											) : (
												<ArrowDown
													size={14}
													className="text-[#7f2dfb]"
												/>
											))}
									</div>
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									الحالة
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("issue_date")}
								>
									<div className="flex items-center justify-end gap-1">
										تاريخ الإصدار
										{sortField === "issue_date" &&
											(sortDirection === "asc" ? (
												<ArrowUp
													size={14}
													className="text-[#7f2dfb]"
												/>
											) : (
												<ArrowDown
													size={14}
													className="text-[#7f2dfb]"
												/>
											))}
									</div>
								</th>
								<th
									className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => handleSort("due_date")}
								>
									<div className="flex items-center justify-end gap-1">
										تاريخ الاستحقاق
										{sortField === "due_date" &&
											(sortDirection === "asc" ? (
												<ArrowUp
													size={14}
													className="text-[#7f2dfb]"
												/>
											) : (
												<ArrowDown
													size={14}
													className="text-[#7f2dfb]"
												/>
											))}
									</div>
								</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
									الإجراءات
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{paginatedInvoices.map((invoice, i) => {
								const statusInfo = statusConfig[invoice.status];
								const StatusIcon = statusInfo.icon;
								const isOverdueInvoice = isOverdue(
									invoice.due_date,
									invoice.status
								);
								const isSelected = selectedInvoiceIds.has(
									invoice.id
								);
								const dueDateInfo = getDueDateInfo(invoice);

								return (
									<motion.tr
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: i * 0.05 }}
										key={invoice.id}
										className={cn(
											"group hover:bg-gray-50/50 transition-colors",
											isSelected && "bg-purple-50/50"
										)}
									>
										<td className="px-4 py-4 text-center">
											<button
												type="button"
												onClick={() =>
													toggleSelect(invoice.id)
												}
												className="p-1 hover:bg-gray-200 rounded transition-colors"
											>
												{isSelected ? (
													<Check className="w-5 h-5 text-[#7f2dfb]" />
												) : (
													<div className="w-5 h-5 border-2 border-gray-300 rounded" />
												)}
											</button>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-bold text-[#012d46]">
												{invoice.invoice_number}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col">
												<span className="font-medium text-gray-900">
													{invoice.client.name}
												</span>
												<span className="text-xs text-gray-500">
													{invoice.client.email ||
														"-"}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-bold text-gray-900">
												{formatCurrency(
													invoice.total_amount
												)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col gap-1">
												<span
													className={cn(
														"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit",
														isOverdueInvoice
															? statusConfig
																	.overdue
																	.color
															: statusInfo.color
													)}
												>
													{isOverdueInvoice ? (
														<AlertCircle
															size={12}
														/>
													) : (
														<StatusIcon size={12} />
													)}
													{isOverdueInvoice
														? "متأخرة"
														: statusInfo.label}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="flex items-center gap-2">
												<Calendar
													size={14}
													className="text-gray-400"
												/>
												<div className="flex flex-col gap-0.5">
													<span className="font-semibold text-gray-900">
														{formatDate(
															invoice.created_at
														)}
													</span>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col gap-1">
												<span className="text-sm font-semibold text-gray-900">
													{formatDate(
														invoice.due_date
													)}
												</span>
												{dueDateInfo && (
													<span
														className={cn(
															"text-xs font-medium",
															dueDateInfo.color
														)}
													>
														{dueDateInfo.text}
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														router.push(
															`/dashboard/invoices/${invoice.id}`
														)
													}
													className="p-2 text-gray-400 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors"
													title="عرض التفاصيل"
												>
													<Eye size={18} />
												</button>
												{invoice.status === "draft" && (
													<button
														onClick={() =>
															handleStatusChange(
																invoice.id,
																"sent"
															)
														}
														className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
														title="إرسال"
													>
														<Send size={18} />
													</button>
												)}
												{invoice.status !== "paid" &&
													invoice.status !==
														"cancelled" && (
														<>
															<button
																onClick={() =>
																	handleStatusChange(
																		invoice.id,
																		"paid"
																	)
																}
																className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
																title="تحديد كمدفوعة"
															>
																<CheckCircle
																	size={18}
																/>
															</button>
															<button
																onClick={() =>
																	handleStatusChange(
																		invoice.id,
																		"cancelled"
																	)
																}
																className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
																title="إلغاء الفاتورة"
															>
																<XCircle
																	size={18}
																/>
															</button>
														</>
													)}
												{invoice.status === "draft" && (
													<button
														onClick={() =>
															setDeleteCandidate(
																invoice
															)
														}
														className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
														title="حذف"
													>
														<Trash2 size={18} />
													</button>
												)}
											</div>
										</td>
									</motion.tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{filteredInvoices.length === 0 && (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
							<FileText className="w-10 h-10 text-gray-300" />
						</div>
						<h3 className="text-lg font-bold text-gray-900">
							لا توجد فواتير
						</h3>
						<p className="text-gray-500 mt-1 mb-6 max-w-xs mx-auto">
							لم نجد أي فواتير تطابق بحثك. ابدأ بإنشاء فاتورة
							جديدة.
						</p>
						<button
							onClick={() => setShowInvoiceModal(true)}
							className="inline-flex items-center gap-2 px-6 py-3 bg-[#7f2dfb] text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
						>
							<Plus size={18} strokeWidth={2.5} />
							إنشاء فاتورة
						</button>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">
								عدد العناصر في الصفحة:
							</span>
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setCurrentPage(1);
								}}
								className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100"
							>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
							</select>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() =>
									setCurrentPage((p) => Math.max(1, p - 1))
								}
								disabled={currentPage === 1}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronRight size={18} />
							</button>
							<span className="text-sm text-gray-600 px-3">
								صفحة {currentPage} من {totalPages}
							</span>
							<button
								type="button"
								onClick={() =>
									setCurrentPage((p) =>
										Math.min(totalPages, p + 1)
									)
								}
								disabled={currentPage === totalPages}
								className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronLeft size={18} />
							</button>
						</div>
					</div>
				)}
			</div>

			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={() => setShowInvoiceModal(false)}
				onSuccess={handleInvoiceSuccess}
			/>

			<Dialog
				open={!!deleteCandidate}
				onOpenChange={(open) => !open && setDeleteCandidate(null)}
			>
				<DialogContent className="rounded-3xl p-8">
					<DialogHeader className="mb-4">
						<DialogTitle className="text-2xl font-bold text-center text-[#012d46]">
							حذف الفاتورة؟
						</DialogTitle>
					</DialogHeader>
					<p className="text-center text-gray-600 mb-8">
						هل أنت متأكد من أنك تريد حذف الفاتورة رقم{" "}
						<span className="font-bold text-gray-900">
							{deleteCandidate?.invoice_number}
						</span>
						؟
						<br />
						لا يمكن التراجع عن هذا الإجراء.
					</p>
					<DialogFooter className="flex gap-3 sm:justify-center">
						<button
							onClick={() => setDeleteCandidate(null)}
							className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
						>
							إلغاء
						</button>
						<button
							onClick={() =>
								deleteCandidate &&
								handleDeleteInvoice(deleteCandidate.id)
							}
							className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
						>
							نعم، حذف
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={showBulkDeleteDialog}
				onOpenChange={setShowBulkDeleteDialog}
			>
				<DialogContent className="rounded-3xl p-8">
					<DialogHeader className="mb-4">
						<DialogTitle className="text-2xl font-bold text-center text-[#012d46]">
							حذف الفواتير المحددة؟
						</DialogTitle>
					</DialogHeader>
					<p className="text-center text-gray-600 mb-8">
						هل أنت متأكد من أنك تريد حذف {selectedInvoiceIds.size}{" "}
						فاتورة؟
						<br />
						لا يمكن التراجع عن هذا الإجراء.
					</p>
					<DialogFooter className="flex gap-3 sm:justify-center">
						<button
							onClick={() => setShowBulkDeleteDialog(false)}
							className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
						>
							إلغاء
						</button>
						<button
							onClick={handleBulkDelete}
							disabled={bulkActionLoading}
							className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{bulkActionLoading && (
								<Loader2 size={16} className="animate-spin" />
							)}
							حذف
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: React.ComponentType<{
		size?: number;
		strokeWidth?: number;
		className?: string;
	}>;
	color: "purple" | "blue" | "green" | "orange" | "indigo";
	isWarning?: boolean;
}

function StatsCard({
	title,
	value,
	icon: Icon,
	color,
	isWarning,
}: StatsCardProps) {
	const colors = {
		purple: "bg-purple-50 text-[#7f2dfb]",
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		orange: "bg-orange-50 text-orange-600",
		indigo: "bg-indigo-50 text-indigo-600",
	};

	return (
		<div
			className={cn(
				"bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow",
				isWarning && "bg-orange-50/30 border-orange-100"
			)}
		>
			<div className="flex justify-between items-start mb-4">
				<div
					className={cn(
						"p-3 rounded-2xl",
						colors[color as keyof typeof colors]
					)}
				>
					<Icon size={24} strokeWidth={2.5} />
				</div>
			</div>
			<div>
				<p className="text-gray-500 text-sm font-medium mb-1">
					{title}
				</p>
				<h3 className="text-2xl font-bold text-gray-900 tracking-tight">
					{value}
				</h3>
			</div>
		</div>
	);
}
