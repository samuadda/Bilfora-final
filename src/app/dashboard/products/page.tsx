"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/database";
import { Plus, Edit, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

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
            toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
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
        toast({ title: "تم التعطيل" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المنتجات / الخدمات</h1>
                    <p className="text-gray-500 mt-1">إدارة قائمة المنتجات والخدمات لاستخدامها في الفواتير</p>
                </div>
                <button onClick={openNew} className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 active:translate-y-[1px]">
                    <Plus size={16} /> إضافة منتج
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex gap-3 flex-wrap">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن منتج..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 w-64"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">معطّل</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-600">عرض {filtered.length} من {products.length} منتج</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-right">الاسم</th>
                            <th className="p-3 text-right">الوحدة</th>
                            <th className="p-3 text-right">السعر</th>
                            <th className="p-3 text-right">الحالة</th>
                            <th className="p-3 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.id} className="border-b">
                                <td className="p-3">{p.name}</td>
                                <td className="p-3">{p.unit || "-"}</td>
                                <td className="p-3">{Number(p.unit_price).toFixed(2)}</td>
                                <td className="p-3">{p.active ? "نشط" : "معطّل"}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => openEdit(p)} className="text-gray-600 hover:text-gray-900"><Edit size={16} /></button>
                                    {p.active && (
                                        <button onClick={() => deactivate(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-10 text-gray-500">لا توجد منتجات</div>
                )}
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center p-4 z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden h-auto"
                    >
                        {/* Fixed Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-right">
                                {editing ? "تعديل المنتج" : "إضافة منتج جديد"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-600" />
                                <span className="text-red-700 text-sm">{error}</span>
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Product Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 text-right">
                                            اسم المنتج *
                                        </label>
                                        <input
                                            value={form.name || ""}
                                            onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                                            placeholder="أدخل اسم المنتج"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 text-right">
                                            الوحدة
                                        </label>
                                        <input
                                            value={form.unit || ""}
                                            onChange={(e) => setForm(s => ({ ...s, unit: e.target.value }))}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                                            placeholder="مثل: قطعة، ساعة، كيلو"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 text-right">
                                            السعر (ريال)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={Number(form.unit_price || 0)}
                                            onChange={(e) => setForm(s => ({ ...s, unit_price: parseFloat(e.target.value) || 0 }))}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 text-right">
                                            الوصف
                                        </label>
                                        <textarea
                                            value={form.description || ""}
                                            onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                                            placeholder="وصف المنتج أو الخدمة"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={submit}
                                disabled={saving}
                                className="px-6 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                                {saving ? "جاري الحفظ..." : (editing ? "تحديث" : "إضافة")}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}


