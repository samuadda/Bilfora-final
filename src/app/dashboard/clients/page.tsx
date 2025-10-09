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
	Trash2,
	Plus,
	Search,
	AlertCircle,
	CheckCircle,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
	Client,
	CreateClientInput,
	UpdateClientInput,
	ClientStatus,
} from "@/types/database";

const statusConfig = {
	active: {
		label: "نشط",
		className: "bg-green-100 text-green-800",
	},
	inactive: {
		label: "غير نشط",
		className: "bg-gray-100 text-gray-800",
	},
};

export default function ClientsPage() {
	const [clients, setClients] = useState<Client[]>([]);
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<"all" | ClientStatus>(
		"all"
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);
	const [saving, setSaving] = useState(false);

	// Form state for add/edit
	const [formData, setFormData] = useState<CreateClientInput>({
		name: "",
		email: "",
		phone: "",
		company_name: "",
		tax_number: "",
		address: "",
		city: "",
		notes: "",
		status: "active",
	});

	// Load clients on component mount
	useEffect(() => {
		loadClients();
	}, []);

	// Filter clients when filters change
	useEffect(() => {
		let filtered = [...clients];

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter((c) => c.status === statusFilter);
		}

		// Filter by search term
		if (searchTerm) {
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
		}

		setFilteredClients(filtered);
	}, [clients, statusFilter, searchTerm]);

	const loadClients = async () => {
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
				.from("clients")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error loading clients:", error);
				setError("فشل في تحميل قائمة العملاء");
				return;
			}

			setClients(data || []);
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setLoading(false);
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

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			phone: "",
			company_name: "",
			tax_number: "",
			address: "",
			city: "",
			notes: "",
			status: "active",
		});
		setEditingClient(null);
		setError(null);
		setSuccess(null);
	};

	const handleAddClient = () => {
		resetForm();
		setShowAddModal(true);
	};

	const handleEditClient = (client: Client) => {
		setFormData({
			name: client.name,
			email: client.email,
			phone: client.phone,
			company_name: client.company_name || "",
			tax_number: client.tax_number || "",
			address: client.address || "",
			city: client.city || "",
			notes: client.notes || "",
			status: client.status,
		});
		setEditingClient(client);
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

			if (editingClient) {
				// Update existing client
				const { error } = await supabase
					.from("clients")
					.update({
						name: formData.name,
						email: formData.email,
						phone: formData.phone,
						company_name: formData.company_name || null,
						tax_number: formData.tax_number || null,
						address: formData.address || null,
						city: formData.city || null,
						notes: formData.notes || null,
						status: formData.status,
					})
					.eq("id", editingClient.id);

				if (error) {
					console.error("Error updating client:", error);
					setError("فشل في تحديث العميل");
					return;
				}

				setSuccess("تم تحديث العميل بنجاح");
			} else {
				// Create new client
				const { error } = await supabase.from("clients").insert({
					user_id: user.id,
					name: formData.name,
					email: formData.email,
					phone: formData.phone,
					company_name: formData.company_name || null,
					tax_number: formData.tax_number || null,
					address: formData.address || null,
					city: formData.city || null,
					notes: formData.notes || null,
					status: formData.status,
				});

				if (error) {
					console.error("Error creating client:", error);
					setError("فشل في إضافة العميل");
					return;
				}

				setSuccess("تم إضافة العميل بنجاح");
			}

			// Reload clients and close modal
			await loadClients();
			setShowAddModal(false);
			resetForm();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteClient = async (clientId: string) => {
		if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

		try {
			setError(null);

			const { error } = await supabase
				.from("clients")
				.delete()
				.eq("id", clientId);

			if (error) {
				console.error("Error deleting client:", error);
				setError("فشل في حذف العميل");
				return;
			}

			setSuccess("تم حذف العميل بنجاح");
			await loadClients();
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

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
					<p className="text-gray-500">جاري تحميل العملاء...</p>
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
								عملاء غير نشطين
							</p>
							<p className="text-2xl font-bold text-gray-600">
								{
									clients.filter(
										(c) => c.status === "inactive"
									).length
								}
							</p>
						</div>
						<div className="p-2 bg-gray-100 rounded-lg">
							<Building2 className="w-6 h-6 text-gray-600" />
						</div>
					</div>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								مضاف هذا الشهر
							</p>
							<p className="text-2xl font-bold text-blue-600">
								{
									clients.filter((c) => {
										const createdDate = new Date(
											c.created_at
										);
										const now = new Date();
										return (
											createdDate.getMonth() ===
												now.getMonth() &&
											createdDate.getFullYear() ===
												now.getFullYear()
										);
									}).length
								}
							</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<CalendarDays className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Header with Add Button */}
			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						العملاء
					</h1>
					<p className="text-gray-500 mt-1">إدارة قاعدة عملائك</p>
				</div>
				<button
					onClick={handleAddClient}
					className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:translate-y-[1px]"
				>
					<Plus size={16} />
					إضافة عميل جديد
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
								placeholder="البحث في العملاء..."
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
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(
										e.target.value as "all" | ClientStatus
									)
								}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
							>
								<option value="all">جميع الحالات</option>
								<option value="active">نشط</option>
								<option value="inactive">غير نشط</option>
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
									تاريخ الإضافة
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
							{filteredClients.map((client) => {
								const status = statusConfig[client.status];
								return (
									<tr
										key={client.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="space-y-0.5">
												<div className="text-sm font-medium text-gray-900">
													{client.name}
												</div>
												<div className="text-xs text-gray-500 flex items-center gap-1">
													<Mail size={12} />
													{client.email}
												</div>
												<div className="text-xs text-gray-500 flex items-center gap-1">
													<Phone size={12} />
													{client.phone}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="flex items-center gap-2">
												<Building2
													size={14}
													className="text-gray-500"
												/>
												<span>
													{client.company_name || "—"}
												</span>
											</div>
											{client.city && (
												<div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
													<MapPin size={12} />
													{client.city}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="text-xs text-gray-500">
												{client.address || "—"}
											</div>
											{client.tax_number && (
												<div className="text-xs text-gray-500 mt-1">
													الرقم الضريبي:{" "}
													{client.tax_number}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="text-xs text-gray-500 flex items-center gap-1">
												<CalendarDays size={12} />
												{formatDate(client.created_at)}
											</div>
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
												<button
													onClick={() =>
														handleEditClient(client)
													}
													className="text-gray-600 hover:text-gray-900"
													title="تعديل"
												>
													<Edit size={16} />
												</button>
												<button
													onClick={() =>
														handleDeleteClient(
															client.id
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

				{filteredClients.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-500 text-lg">
							لا توجد نتائج
						</div>
						<p className="text-gray-400 mt-2">
							جرّب تعديل معايير التصفية
						</p>
						<button
							onClick={handleAddClient}
							className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
						>
							<UserPlus size={16} />
							إضافة عميل جديد
						</button>
					</div>
				)}
			</div>

			{/* Add/Edit Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h2 className="text-xl font-bold mb-4">
							{editingClient ? "تعديل العميل" : "إضافة عميل جديد"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										اسم العميل *
									</label>
									<input
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="اسم العميل"
										required
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										البريد الإلكتروني *
									</label>
									<input
										name="email"
										type="email"
										value={formData.email}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="email@example.com"
										required
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										رقم الجوال *
									</label>
									<input
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="+966 5x xxx xxxx"
										required
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										اسم الشركة
									</label>
									<input
										name="company_name"
										value={formData.company_name}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="اسم الشركة"
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										الرقم الضريبي
									</label>
									<input
										name="tax_number"
										value={formData.tax_number}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="الرقم الضريبي"
									/>
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										المدينة
									</label>
									<input
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="المدينة"
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
										<option value="active">نشط</option>
										<option value="inactive">
											غير نشط
										</option>
									</select>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									العنوان التفصيلي
								</label>
								<input
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="العنوان التفصيلي"
								/>
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
										: editingClient
										? "تحديث"
										: "إضافة"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
