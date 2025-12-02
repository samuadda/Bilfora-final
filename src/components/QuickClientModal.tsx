"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickClientModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

const clientSchema = z.object({
	name: z.string().min(2, "اسم العميل قصير جداً"),
	email: z.string().email("البريد الإلكتروني غير صالح"),
	phone: z.string().min(9, "رقم الجوال غير صالح"),
	company_name: z.string().nullable().optional(),
	tax_number: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	status: z.enum(["active", "inactive"]),
});

export default function QuickClientModal({
	isOpen,
	onClose,
	onSuccess,
}: QuickClientModalProps) {
	const { toast } = useToast();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		company_name: "",
		tax_number: "",
		address: "",
		city: "",
		status: "active" as "active" | "inactive",
	});

	const resetForm = useCallback(() => {
		setFormData({
			name: "",
			email: "",
			phone: "",
			company_name: "",
			tax_number: "",
			address: "",
			city: "",
			status: "active",
		});
		setError(null);
	}, []);

	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value || null }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = clientSchema.safeParse(formData);
		if (!parsed.success) {
			setError(parsed.error.issues[0].message);
			return;
		}

		try {
			setSaving(true);
			setError(null);

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

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

			const payload = {
				user_id: user.id,
				name: formData.name.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim(),
				company_name: formData.company_name?.trim() || null,
				tax_number: formData.tax_number?.trim() || null,
				address: formData.address?.trim() || null,
				city: formData.city?.trim() || null,
				status: formData.status,
			};

			const { error } = await supabase.from("clients").insert(payload);

			if (error) throw error;

			toast({
				title: "تم الإضافة",
				description: "تمت إضافة العميل بنجاح",
			});

			handleClose();
			if (onSuccess) onSuccess();
		} catch (err: any) {
			setError(err?.message || "حدث خطأ أثناء الحفظ");
		} finally {
			setSaving(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm"
						onClick={handleClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 bg-white z-10">
							<h2 className="text-xl font-bold text-gray-900">
								إضافة عميل جديد
							</h2>
							<button
								type="button"
								onClick={handleClose}
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

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										اسم العميل *
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										البريد الإلكتروني *
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										رقم الهاتف *
									</label>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										اسم الشركة
									</label>
									<input
										type="text"
										name="company_name"
										value={formData.company_name}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الرقم الضريبي
									</label>
									<input
										type="text"
										name="tax_number"
										value={formData.tax_number}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الحالة
									</label>
									<select
										name="status"
										value={formData.status}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
									>
										<option value="active">نشط</option>
										<option value="inactive">غير نشط</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										العنوان
									</label>
									<input
										type="text"
										name="address"
										value={formData.address}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										المدينة
									</label>
									<input
										type="text"
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
									/>
								</div>
							</div>

							{/* Footer */}
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={handleClose}
									className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm"
								>
									إلغاء
								</button>
								<button
									type="submit"
									disabled={saving}
									className="flex-1 px-4 py-2 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6a25d1] shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
								>
									{saving ? (
										<>
											<Loader2 size={18} className="animate-spin" />
											جاري الحفظ...
										</>
									) : (
										"إضافة العميل"
									)}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

