"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search, Loader2, Undo2, Users, CheckCircle2, XCircle, Building2, Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Client, ClientStatus } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/dialogButton";
import { motion, AnimatePresence } from "framer-motion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";

const statusConfig = {
	active: { label: "نشط", className: "bg-green-50 text-green-700 border-green-100" },
	inactive: { label: "غير نشط", className: "bg-gray-50 text-gray-700 border-gray-100" },
	deleted: { label: "محذوف", className: "bg-red-50 text-red-700 border-red-100" },
};

const clientSchema = z.object({
	name: z.string().min(2, "اسم العميل قصير جداً"),
	email: z.string().email("البريد الإلكتروني غير صالح"),
	phone: z.string().min(9, "رقم الجوال غير صالح"),
	company_name: z.string().nullable().optional(),
	tax_number: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	status: z.enum(["active", "inactive"]),
});

export default function ClientsPage() {
	const [clients, setClients] = useState<Client[]>([]);
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const pageSize = 10;

	const [statusFilter, setStatusFilter] = useState<
		"all" | ClientStatus | "deleted"
	>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState<Partial<Client>>({});
    const [deleteCandidate, setDeleteCandidate] = useState<Client | null>(null);
	const { toast } = useToast();

	// Stats
	const stats = {
		total: clients.length,
		active: clients.filter(c => c.status === "active").length,
		inactive: clients.filter(c => c.status === "inactive").length,
	};

	const pickUpdatableFields = (data: Partial<Client>) => {
		return {
			name: data.name ?? null,
			email: data.email ?? null,
			phone: data.phone ?? null,
			company_name: data.company_name ?? null,
			tax_number: data.tax_number ?? null,
			address: data.address ?? null,
			city: data.city ?? null,
			notes: data.notes ?? null,
			status: data.status ?? ("active" as ClientStatus),
		};
	};

	useEffect(() => {
		loadClients();
	}, [page]);

	useEffect(() => {
		filterClients();
	}, [clients, statusFilter, searchTerm]);

	const loadClients = async () => {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;

			const { data, error, count } = await supabase
				.from("clients")
				.select("*, invoices(count)", { count: "exact" })
				.eq("user_id", user.id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false })
				.range(from, to);

			if (error) throw error;

            setClients(
                data.map((c: Client & { invoices?: any[] }) => ({
                    ...c,
                    invoice_count: Array.isArray(c.invoices)
                        ? (c.invoices[0] as any)?.count ?? 0
                        : 0,
                }))
            );
			setTotalCount(count || 0);
		} catch (err) {
			toast({
				title: "خطأ",
				description: "فشل في تحميل العملاء",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const filterClients = () => {
		let filtered = [...clients];
		if (statusFilter !== "all")
			filtered = filtered.filter((c) => c.status === statusFilter);
		if (searchTerm)
			filtered = filtered.filter(
				(c) =>
					c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					c.phone.includes(searchTerm) ||
					(c.company_name &&
						c.company_name
							.toLowerCase()
							.includes(searchTerm.toLowerCase()))
			);
		setFilteredClients(filtered);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value || null }));
	};

	const openAddModal = () => {
		setEditingClient(null);
		setFormData({ status: "active" });
		setShowModal(true);
	};

	const openEditModal = (client: Client) => {
		setEditingClient(client);
		setFormData(pickUpdatableFields(client));
		setShowModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = clientSchema.safeParse(formData);
		if (!parsed.success) {
			toast({
				title: "تحقق من البيانات",
				description: parsed.error.issues[0].message,
				variant: "destructive",
			});
			return;
		}
		try {
			setSaving(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", user.id)
				.single();
			if (!existingProfile) {
				const { error: profileError } = await supabase.from("profiles").insert({
					id: user.id,
					full_name: "",
					phone: "",
					dob: "1990-01-01",
					account_type: "individual",
				});
				if (profileError) throw profileError;
			}

			if (editingClient) {
				const payload = pickUpdatableFields(formData);
				const { error } = await supabase
					.from("clients")
					.update(payload)
                    .eq("id", editingClient.id);
                if (error) throw error;
				toast({
					title: "تم التحديث",
					description: "تم تحديث بيانات العميل بنجاح",
				});
			} else {
				const payload = pickUpdatableFields(formData);
				const { error } = await supabase
                    .from("clients")
					.insert({ ...payload, user_id: user.id });
                if (error) throw error;
				toast({
					title: "تم الإضافة",
					description: "تمت إضافة العميل بنجاح",
				});
			}
			setShowModal(false);
            setPage(1);
            await loadClients();
		} catch (err: any) {
			toast({
				title: "خطأ",
				description: err?.message || "حدث خطأ أثناء الحفظ",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

    const handleDeleteClient = async (id: string) => {
        try {
            await supabase
                .from("clients")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);
            toast({
                title: "تم الحذف",
                description: "تم حذف العميل (Soft Delete)",
            });
            setDeleteCandidate(null);
            loadClients();
        } catch (err) {
            toast({
                title: "خطأ",
                description: "فشل في حذف العميل",
                variant: "destructive",
            });
        }
    };

	const restoreClient = async (id: string) => {
		await supabase
			.from("clients")
			.update({ deleted_at: null })
			.eq("id", id);
		toast({
			title: "تم الاستعادة",
			description: "تم استعادة العميل بنجاح",
		});
		loadClients();
	};

	const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB");
	const totalPages = Math.ceil(totalCount / pageSize);

	if (loading)
		return <LoadingState message="جاري تحميل العملاء..." />;

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#012d46]">العملاء</h1>
                    <p className="text-gray-500 mt-2">إدارة قاعدة بيانات العملاء ومتابعة تفاصيلهم</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-6 py-3 text-base font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>إضافة عميل</span>
                </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatsCard
                    title="إجمالي العملاء"
                    value={totalCount}
                    icon={Users}
                    color="blue"
                    delay={0.1}
                />
                <StatsCard
                    title="العملاء النشطون"
                    value={stats.active}
                    icon={CheckCircle2}
                    color="green"
                    delay={0.2}
                />
                <StatsCard
                    title="العملاء غير النشطين"
                    value={stats.inactive}
                    icon={XCircle}
                    color="orange"
                    delay={0.3}
                />
            </div>

			{/* Filter & Table Container */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
                {/* Filters */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث باسم العميل، الشركة، الهاتف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                        />
                    </div>
                    <div className="relative flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7f2dfb] focus:ring-2 focus:ring-purple-100 text-sm md:w-auto pr-10"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Clients Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الشركة</th>
                                <th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الفواتير</th>
                                <th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ الإضافة</th>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-gray-50/80 transition-colors group"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{client.name}</p>
                                                <p className="text-xs text-gray-500">{client.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {client.company_name ? (
                                                <>
                                                    <Building2 size={16} className="text-gray-400" />
                                                    {client.company_name}
                                                </>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold">
                                            {client.invoice_count || 0}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold border",
                                                statusConfig[client.status]?.className
                                            )}
                                        >
                                            {statusConfig[client.status]?.label}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-gray-500">
                                        {formatDate(client.created_at)}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(client)}
                                                className="p-2 text-gray-500 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {client.deleted_at ? (
                                                <button
                                                    onClick={() => restoreClient(client.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="استعادة"
                                                >
                                                    <Undo2 size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteCandidate(client)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredClients.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">لا يوجد عملاء</h3>
                            <p className="text-gray-500 text-sm">حاول تغيير معايير البحث أو أضف عميلاً جديداً</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-4 bg-gray-50/30">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            السابق
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            صفحة {page} من {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
			    {showModal && (
				    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">اسم العميل *</label>
                                        <div className="relative">
                                            <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                name="name"
                                                value={formData.name || ""}
                                                onChange={handleInputChange}
                                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                placeholder="الاسم الكامل"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={handleInputChange}
                                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                placeholder="example@domain.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">رقم الهاتف *</label>
                                        <div className="relative">
                                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                name="phone"
                                                value={formData.phone || ""}
                                                onChange={handleInputChange}
                                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                placeholder="05xxxxxxxx"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">اسم الشركة</label>
                                        <div className="relative">
                                            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                name="company_name"
                                                value={formData.company_name || ""}
                                                onChange={handleInputChange}
                                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                placeholder="اختياري"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">العنوان</label>
                                        <div className="relative">
                                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                name="address"
                                                value={formData.address || ""}
                                                onChange={handleInputChange}
                                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                placeholder="المدينة، الحي، الشارع"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">الحالة</label>
                                        <div className="relative">
                                            <select
                                                name="status"
                                                value={formData.status || "active"}
                                                onChange={handleInputChange}
                                                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm bg-white"
                                            >
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">ملاحظات</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes || ""}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                            placeholder="أي ملاحظات إضافية..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-colors text-sm flex items-center gap-2"
                                    >
                                        {saving && <Loader2 size={16} className="animate-spin" />}
                                        {saving ? "جاري الحفظ..." : "حفظ العميل"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-gray-600 mb-2">
                            هل أنت متأكد من حذف العميل؟
                        </p>
                        <p className="font-bold text-gray-900 text-lg">
                            {deleteCandidate?.name}
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteCandidate(null)}
                            className="rounded-xl flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteCandidate && handleDeleteClient(deleteCandidate.id)}
                            className="rounded-xl flex-1 bg-red-600 hover:bg-red-700"
                        >
                            حذف العميل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
		</div>
	);
}
