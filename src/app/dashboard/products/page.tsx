"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/database";
import { Plus, Edit, Trash2, Loader2, X, AlertCircle, ShoppingCart, Tag, Search, CheckCircle2, XCircle, Box, CircleDollarSign, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";

export default function ProductsPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<Partial<Product>>({ name: "", unit_price: 0, unit: "", description: "" });
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    // Stats
    const stats = {
        total: products.length,
        active: products.filter(p => p.active).length,
        inactive: products.filter(p => !p.active).length,
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        let list = [...products];
        if (statusFilter !== "all") {
            list = list.filter(p => (statusFilter === "active" ? p.active : !p.active));
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.description || "").toLowerCase().includes(q)
            );
        }
        setFiltered(list);
    }, [products, searchTerm, statusFilter]);

    const load = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setProducts(data || []);
        } catch (e: any) {
            toast({ title: "خطأ", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const closeModal = useCallback(() => {
        setForm({ name: "", unit_price: 0, unit: "", description: "" });
        setError(null);
        setShowModal(false);
    }, []);

    const openNew = () => {
        setEditing(null);
        setForm({ name: "", unit_price: 0, unit: "", description: "" });
        setError(null);
        setShowModal(true);
    };

    const openEdit = (product: Product) => {
        setEditing(product);
        setForm(product);
        setError(null);
        setShowModal(true);
    };

    const submit = async () => {
        try {
            setSaving(true);
            setError(null);
            
            if (!form.name?.trim()) {
                setError("اسم المنتج مطلوب");
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("يجب تسجيل الدخول أولاً");
                return;
            }

            const payload = {
                user_id: user.id,
                name: form.name.trim(),
                description: form.description?.trim() || null,
                unit: form.unit?.trim() || null,
                unit_price: Number(form.unit_price) || 0,
                active: true,
            };

            const { error } = editing
                ? await supabase.from("products").update(payload).eq("id", editing.id)
                : await supabase.from("products").insert(payload);

            if (error) throw error;
            
            closeModal();
            await load();
            toast({ title: editing ? "تم التحديث" : "تمت الإضافة", description: "تم حفظ بيانات المنتج بنجاح" });
        } catch (e: any) {
            setError(e.message || "حدث خطأ غير متوقع");
        } finally {
            setSaving(false);
        }
    };

    const deactivate = async (id: string) => {
        const { error } = await supabase.from("products").update({ active: false }).eq("id", id);
        if (error) {
            toast({ title: "خطأ", description: error.message, variant: "destructive" });
            return;
        }
        await load();
        toast({ title: "تم التعطيل", description: "تم تعطيل المنتج بنجاح" });
    };

    const formatPrice = (price: number) => 
        new Intl.NumberFormat("en-US", { style: "currency", currency: "SAR" }).format(price);

	if (loading) {
		return <LoadingState message="جاري استعراض المنتجات..." />;
	}

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#012d46]">المنتجات والخدمات</h1>
                    <p className="text-gray-500 mt-2">أضف منتجاتك وخدماتك ليسهل عليك إنشاء الفواتير</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openNew} 
                    className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-6 py-3 text-base font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
                >
                    <Plus size={20} strokeWidth={2.5} /> إضافة منتج
                </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatsCard
                    title="إجمالي المنتجات"
                    value={stats.total}
                    icon={ShoppingCart}
                    color="purple"
                    delay={0.1}
                />
                <StatsCard
                    title="منتجات نشطة"
                    value={stats.active}
                    icon={CheckCircle2}
                    color="green"
                    delay={0.2}
                />
                <StatsCard
                    title="منتجات معطلة"
                    value={stats.inactive}
                    icon={XCircle}
                    color="orange"
                    delay={0.3}
                />
            </div>

            {/* Filters & Table Container */}
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
                            placeholder="ابحث عن اسم المنتج أو الوصف..."
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
                            <option value="inactive">معطّل</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم</th>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الوحدة</th>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">السعر</th>
                                <th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7f2dfb] flex items-center justify-center">
                                                <Box size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                                {p.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-gray-600">
                                        {p.unit ? (
                                            <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium">{p.unit}</span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <span className="font-bold text-gray-900 text-sm">
                                            {formatPrice(Number(p.unit_price))}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                                            p.active 
                                                ? "bg-green-50 text-green-700 border-green-100" 
                                                : "bg-gray-50 text-gray-700 border-gray-100"
                                        )}>
                                            {p.active ? "نشط" : "معطّل"}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEdit(p)} 
                                                className="p-2 text-gray-500 hover:text-[#7f2dfb] hover:bg-purple-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {p.active && (
                                                <button 
                                                    onClick={() => deactivate(p.id)} 
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="تعطيل"
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
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">لا توجد منتجات</h3>
                            <p className="text-gray-500 text-sm">حاول إضافة منتج جديد أو تغيير البحث</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden"
                        >
                            {/* Fixed Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editing ? "تعديل المنتج" : "إضافة منتج جديد"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                                    <AlertCircle size={20} className="text-red-600" />
                                    <span className="text-red-700 text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Body */}
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">اسم المنتج *</label>
                                        <div className="relative">
                                            <Box className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                value={form.name || ""}
                                                onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                placeholder="أدخل اسم المنتج"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">السعر (ريال)</label>
                                            <div className="relative">
                                                <CircleDollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={Number(form.unit_price || 0)}
                                                    onChange={(e) => setForm(s => ({ ...s, unit_price: parseFloat(e.target.value) || 0 }))}
                                                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">الوحدة</label>
                                            <div className="relative">
                                                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    value={form.unit || ""}
                                                    onChange={(e) => setForm(s => ({ ...s, unit: e.target.value }))}
                                                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm"
                                                    placeholder="قطعة، ساعة..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">الوصف</label>
                                        <textarea
                                            value={form.description || ""}
                                            onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm resize-none"
                                            placeholder="وصف المنتج أو الخدمة (اختياري)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-white transition-colors text-sm"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-colors text-sm flex items-center gap-2"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    {saving ? "جاري الحفظ..." : (editing ? "تحديث المنتج" : "إضافة المنتج")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
