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
    MoreHorizontal,
    ArrowUpRight,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/dialog";
import { Button } from "@/components/dialogButton";
import { supabase } from "@/lib/supabase";
import {
	InvoiceWithClientAndItems,
	InvoiceStatus,
} from "@/types/database";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

export default function InvoicesPage() {
    const router = useRouter();
	const [invoices, setInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [filteredInvoices, setFilteredInvoices] = useState<InvoiceWithClientAndItems[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
	const [dateFilter, setDateFilter] = useState("all");
	const [showFilters, setShowFilters] = useState(false);
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState<InvoiceWithClientAndItems | null>(null);

	useEffect(() => {
		loadInvoices();
	}, []);

	useEffect(() => {
		let filtered = [...invoices];

		if (statusFilter !== "all") {
			filtered = filtered.filter((i) => i.status === statusFilter);
		}

		if (searchTerm) {
			filtered = filtered.filter(
				(i) =>
					i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
					i.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					i.client.email?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

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

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
                router.push('/login');
				return;
			}

			const { data, error } = await supabase
				.from("invoices")
				.select(`
					*,
					client:clients(*),
					items:invoice_items(*)
				`)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) throw error;

			setInvoices(data || []);
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ أثناء تحميل البيانات");
		} finally {
			setLoading(false);
		}
	};

	const handleInvoiceSuccess = () => {
		loadInvoices();
	};

    const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
		try {
			const { error } = await supabase
				.from("invoices")
				.update({ status: newStatus })
				.eq("id", invoiceId);

			if (error) throw error;
			await loadInvoices();
		} catch (err) {
			console.error("Error:", err);
            // Consider adding toast notification here
		}
	};

    const handleDeleteInvoice = async (invoiceId: string) => {
		try {
			const { error } = await supabase
				.from("invoices")
				.delete()
				.eq("id", invoiceId);

			if (error) throw error;
            setDeleteCandidate(null);
			await loadInvoices();
		} catch (err) {
			console.error("Error:", err);
		}
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
            maximumFractionDigits: 0
		}).format(amount);

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString("en-GB");

	const isOverdue = (dueDate: string, status: InvoiceStatus) => {
		return new Date(dueDate) < new Date() && status !== "paid";
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

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#012d46]">الفواتير</h1>
                    <p className="text-gray-500 mt-2 text-lg">إدارة ومتابعة فواتير العملاء</p>
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
			<div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <StatsCard 
                    title="إجمالي الفواتير"
                    value={invoices.length}
                    icon={FileText}
                    color="blue"
                />
                <StatsCard 
                    title="فواتير متأخرة"
                    value={invoices.filter(i => isOverdue(i.due_date, i.status)).length}
                    icon={AlertCircle}
                    color="orange"
                    isWarning={true}
                />
                <StatsCard 
                    title="المبلغ المستحق"
                    value={formatCurrency(invoices.filter(i => i.status !== "paid" && i.status !== "cancelled").reduce((sum, i) => sum + i.total_amount, 0))}
                    icon={Clock}
                    color="purple"
                />
                <StatsCard 
                    title="المبلغ المحصل"
                    value={formatCurrency(invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.total_amount, 0))}
                    icon={CheckCircle}
                    color="green"
                />
			</div>

			{/* Filters & Search */}
			<div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="البحث برقم الفاتورة، اسم العميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb] transition-all"
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                     <div className="relative flex-1 md:flex-none">
                         <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/20 focus:border-[#7f2dfb]"
                         >
                            <option value="all">جميع الحالات</option>
                            <option value="draft">مسودة</option>
                            <option value="sent">مرسلة</option>
                            <option value="paid">مدفوعة</option>
                            <option value="overdue">متأخرة</option>
                         </select>
                         <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                     </div>
                     <div className="relative flex-1 md:flex-none">
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
                         <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                     </div>
                </div>
			</div>

			{/* Invoices Table */}
			<div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50 border-b border-gray-100">
							<tr>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">المبلغ</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
								<th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{filteredInvoices.map((invoice, i) => {
								const statusInfo = statusConfig[invoice.status];
								const StatusIcon = statusInfo.icon;
								const isOverdueInvoice = isOverdue(invoice.due_date, invoice.status);

								return (
									<motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
										key={invoice.id}
										className="group hover:bg-gray-50/50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-bold text-[#012d46]">{invoice.invoice_number}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex flex-col">
												<span className="font-medium text-gray-900">{invoice.client.name}</span>
												<span className="text-xs text-gray-500">{invoice.client.email || '-'}</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                isOverdueInvoice ? statusConfig.overdue.color : statusInfo.color
                                            )}>
                                                {isOverdueInvoice ? <AlertCircle size={12}/> : <StatusIcon size={12} />}
												{isOverdueInvoice ? "متأخرة" : statusInfo.label}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400"/>
                                                {formatDate(invoice.issue_date)}
                                            </div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)} className="p-2 text-gray-400 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors" title="عرض التفاصيل">
                                                    <Eye size={18} />
                                                </button>
                                                {invoice.status === 'draft' && (
                                                    <button onClick={() => handleStatusChange(invoice.id, "sent")} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="إرسال">
                                                        <Send size={18} />
                                                    </button>
                                                )}
                                                {invoice.status !== 'paid' && (
                                                     <button onClick={() => handleStatusChange(invoice.id, "paid")} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="تحديد كمدفوعة">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => setDeleteCandidate(invoice)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                                                    <Trash2 size={18} />
                                                </button>
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
						<h3 className="text-lg font-bold text-gray-900">لا توجد فواتير</h3>
						<p className="text-gray-500 mt-1 mb-6 max-w-xs mx-auto">لم نجد أي فواتير تطابق بحثك. ابدأ بإنشاء فاتورة جديدة.</p>
						<button
							onClick={() => setShowInvoiceModal(true)}
							className="inline-flex items-center gap-2 px-6 py-3 bg-[#7f2dfb] text-white rounded-xl hover:bg-[#6a1fd8] transition-colors font-medium"
						>
							<Plus size={18} />
							إنشاء فاتورة
						</button>
					</div>
				)}
			</div>

			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={() => setShowInvoiceModal(false)}
				onSuccess={handleInvoiceSuccess}
			/>

            <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                <DialogContent className="rounded-3xl p-8">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-bold text-center text-[#012d46]">حذف الفاتورة؟</DialogTitle>
                    </DialogHeader>
                    <p className="text-center text-gray-600 mb-8">
                        هل أنت متأكد من أنك تريد حذف الفاتورة رقم <span className="font-bold text-gray-900">{deleteCandidate?.invoice_number}</span>؟
                        <br/>
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <DialogFooter className="flex gap-3 sm:justify-center">
                        <button onClick={() => setDeleteCandidate(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">إلغاء</button>
                        <button onClick={() => deleteCandidate && handleDeleteInvoice(deleteCandidate.id)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">نعم، حذف</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
		</div>
	);
}

function StatsCard({ title, value, icon: Icon, color, isWarning }: any) {
    const colors = {
        purple: "bg-purple-50 text-[#7f2dfb]",
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className={cn(
            "bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow",
            isWarning && "bg-orange-50/30 border-orange-100"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", colors[color as keyof typeof colors])}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
