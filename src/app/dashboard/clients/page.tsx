"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search, Loader2, Undo2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Client, ClientStatus } from "@/types/database";
import { useToast } from "@/components/ui/use-toast"; // ⬅️ from shadcn/ui
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/dialogButton";

const statusConfig = {
	active: { label: "نشط", className: "bg-green-100 text-green-800" },
	inactive: { label: "غير نشط", className: "bg-gray-100 text-gray-800" },
	deleted: { label: "محذوف", className: "bg-red-100 text-red-800" },
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

	// Only allow fields that exist on the clients table and are updatable
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

	// 🚀 Load clients with pagination and invoice count
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
                    // invoices(count) returns an array like [{ count: N }]
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

	// 🚀 Filters and Search
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

	// 🚀 Add/Edit Logic
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value || null }));
	};

	const openAddModal = () => {
		setEditingClient(null);
		setFormData({ status: "active" }); // Set default status
		setShowModal(true);
	};

	const openEditModal = (client: Client) => {
		setEditingClient(client);
		// Avoid including computed fields like invoice_count or relation payloads
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

			// Ensure a corresponding profile row exists to satisfy FK (profiles -> clients)
			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", user.id)
				.single();
			if (!existingProfile) {
				// Create a minimal profile using safe defaults identical to DB trigger
				const { error: profileError } = await supabase.from("profiles").insert({
					id: user.id,
					full_name: "",
					phone: "",
					dob: "1990-01-01",
					gender: null,
					account_type: "individual",
					company_name: null,
					tax_number: null,
					address: null,
					city: null,
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
            // Ensure the newest record appears by returning to first page then reloading
            setPage(1);
            await loadClients();
		} catch (err: any) {
			toast({
				title: "خطأ",
				description: err?.message || "حدث خطأ أثناء الحفظ",
				variant: "destructive",
			});
			console.error("Save client error:", err);
		} finally {
			setSaving(false);
		}
	};

	// 🚀 Soft Delete Logic
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

	// 🧮 Helpers
	const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-SA");
	const totalPages = Math.ceil(totalCount / pageSize);

	// 🧾 UI Rendering
	if (loading)
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="animate-spin text-purple-600" />
			</div>
		);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">العملاء</h1>
				<button
					onClick={openAddModal}
					className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
				>
					<Plus size={16} /> إضافة عميل
				</button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-3">
				<div className="relative">
					<Search
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
						size={16}
					/>
					<input
						type="text"
						placeholder="ابحث..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-3 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200"
					/>
				</div>
				<select
					value={statusFilter}
					onChange={(e) =>
						setStatusFilter(
							e.target.value as "all" | ClientStatus | "deleted"
						)
					}
					className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200"
				>
					<option value="all">جميع الحالات</option>
					<option value="active">نشط</option>
					<option value="inactive">غير نشط</option>
					<option value="deleted">محذوف</option>
				</select>
			</div>

			{/* Clients Table */}
			<div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="p-3 text-right">العميل</th>
							<th className="p-3 text-right">الشركة</th>
							<th className="p-3 text-right">الفواتير</th>
							<th className="p-3 text-right">الحالة</th>
							<th className="p-3 text-right">تاريخ</th>
							<th className="p-3 text-right">الإجراءات</th>
						</tr>
					</thead>
					<tbody>
						{filteredClients.map((client) => (
							<tr
								key={client.id}
								className="border-b hover:bg-gray-50"
							>
								<td className="p-3">{client.name}</td>
								<td className="p-3">
									{client.company_name || "—"}
								</td>
								<td className="p-3 text-center">
									{client.invoice_count || 0}
								</td>
								<td className="p-3">
									<span
										className={`px-2 py-1 rounded-full text-xs ${
											statusConfig[client.status]
												?.className || ""
										}`}
									>
										{statusConfig[client.status]?.label}
									</span>
								</td>
								<td className="p-3 text-sm text-gray-500">
									{formatDate(client.created_at)}
								</td>
								<td className="p-3 flex gap-2">
									<button
										onClick={() => openEditModal(client)}
										className="text-gray-600 hover:text-gray-900"
									>
										<Edit size={16} />
									</button>
                                    {client.deleted_at ? (
										<button
											onClick={() =>
												restoreClient(client.id)
											}
											className="text-green-600 hover:text-green-800"
										>
											<Undo2 size={16} />
										</button>
									) : (
										<button
                                            onClick={() => setDeleteCandidate(client)}
											className="text-red-600 hover:text-red-800"
										>
											<Trash2 size={16} />
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filteredClients.length === 0 && (
					<div className="text-center py-10 text-gray-500">
						لا توجد نتائج
					</div>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-4">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						className="px-3 py-1 border rounded-lg disabled:opacity-50"
					>
						السابق
					</button>
					<span>
						صفحة {page} من {totalPages}
					</span>
					<button
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
						disabled={page === totalPages}
						className="px-3 py-1 border rounded-lg disabled:opacity-50"
					>
						التالي
					</button>
				</div>
			)}

            {/* Add/Edit Modal */}
			{showModal && (
				<div
					className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-50"
					onClick={(e) =>
						e.target === e.currentTarget && setShowModal(false)
					}
				>
					<div className="bg-white p-6 rounded-2xl w-full max-w-xl space-y-4">
						<h2 className="font-bold text-lg text-right">
							{editingClient ? "تعديل العميل" : "إضافة عميل جديد"}
						</h2>
						<form onSubmit={handleSubmit} className="space-y-3">
							<input
								name="name"
								value={formData.name || ""}
								onChange={handleInputChange}
								placeholder="اسم العميل"
								className="w-full border rounded-lg px-3 py-2"
							/>
							<input
								name="email"
								value={formData.email || ""}
								onChange={handleInputChange}
								placeholder="البريد الإلكتروني"
								className="w-full border rounded-lg px-3 py-2"
							/>
							<input
								name="phone"
								value={formData.phone || ""}
								onChange={handleInputChange}
								placeholder="رقم الجوال"
								className="w-full border rounded-lg px-3 py-2"
							/>
							<input
								name="company_name"
								value={formData.company_name || ""}
								onChange={handleInputChange}
								placeholder="اسم الشركة"
								className="w-full border rounded-lg px-3 py-2"
							/>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1 text-right">
									الحالة
								</label>
								<select
									name="status"
									value={formData.status || "active"}
									onChange={handleInputChange}
									className="w-full border rounded-lg px-3 py-2"
								>
									<option value="active">نشط</option>
									<option value="inactive">غير نشط</option>
								</select>
							</div>
							<div className="flex justify-end gap-2 pt-4">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="px-4 py-2 border rounded-lg"
								>
									إلغاء
								</button>
								<button
									type="submit"
									disabled={saving}
									className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
								>
									{saving ? "جاري الحفظ..." : "حفظ"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                    </DialogHeader>
                    <p className="text-right text-gray-600">
                        هل أنت متأكد من حذف العميل
                        {" "}
                        <span className="font-semibold">{deleteCandidate?.name}</span>
                        ؟ سيتم حذف العميل بشكل مؤقت ويمكن استعادته لاحقاً.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteCandidate(null)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteCandidate && handleDeleteClient(deleteCandidate.id)}
                        >
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
		</div>
	);
}
