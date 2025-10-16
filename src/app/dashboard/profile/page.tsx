"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	User,
	Mail,
	Phone,
	Globe2,
	Camera,
	MapPin,
	Building2,
	AtSign,
	Link as LinkIcon,
	Calendar,
	Save,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
	Profile,
	UpdateProfileInput,
	Gender,
	AccountType,
} from "@/types/database";

export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		full_name: "",
		phone: "",
		dob: "",
		gender: "" as Gender | "",
		account_type: "individual" as AccountType,
		company_name: "",
		tax_number: "",
		address: "",
		city: "",
	});

	// Load user profile on component mount
	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
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
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) {
				console.error("Error loading profile:", error);
				setError("فشل في تحميل الملف الشخصي");
				return;
			}

			if (data) {
				setProfile(data);
				setFormData({
					full_name: data.full_name || "",
					phone: data.phone || "",
					dob: data.dob || "",
					gender: data.gender || "",
					account_type: data.account_type || "individual",
					company_name: data.company_name || "",
					tax_number: data.tax_number || "",
					address: data.address || "",
					city: data.city || "",
				});
			}
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
		setError(null);
		setSuccess(null);
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setAvatarFile(file);
			// TODO: Implement avatar upload to Supabase Storage
		}
	};

	const handleSavePersonalInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		await saveProfile({
			full_name: formData.full_name,
			phone: formData.phone,
			dob: formData.dob,
			gender: formData.gender || null,
			account_type: formData.account_type,
		});
	};

	const handleSaveBusinessInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		await saveProfile({
			company_name: formData.company_name,
			tax_number: formData.tax_number,
		});
	};

	const handleSaveAddress = async (e: React.FormEvent) => {
		e.preventDefault();
		await saveProfile({
			address: formData.address,
			city: formData.city,
		});
	};

	const saveProfile = async (updates: Partial<UpdateProfileInput>) => {
		if (!profile) return;

		try {
			setSaving(true);
			setError(null);

			const { error } = await supabase
				.from("profiles")
				.update(updates)
				.eq("id", profile.id);

			if (error) {
				console.error("Error updating profile:", error);
				setError("فشل في حفظ التغييرات");
				return;
			}

			setSuccess("تم حفظ التغييرات بنجاح");

			// Reload profile to get updated data
			await loadProfile();
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
					<p className="text-gray-500 mt-2">
						جاري تحميل الملف الشخصي...
					</p>
				</div>
			</div>
		);
	}

	if (error && !profile) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600">{error}</p>
					<button
						onClick={loadProfile}
						className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
					>
						إعادة المحاولة
					</button>
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

			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<div className="flex items-center gap-4">
					<div className="relative w-20 h-20 rounded-full overflow-hidden border">
						<Image
							src={profile?.avatar_url || "/logo-symbol.svg"}
							alt="Avatar"
							fill
							className="object-contain bg-gray-50"
						/>
						<label className="absolute bottom-0 left-0 m-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-600 text-white text-[11px] cursor-pointer hover:bg-purple-700">
							<Camera size={12} />
							<span>تغيير</span>
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleAvatarChange}
							/>
						</label>
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold text-gray-900">
							الملف الشخصي
						</h1>
						<p className="text-gray-500 mt-1">
							حدّث معلوماتك الشخصية وملفك العام
						</p>
					</div>
				</div>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Left column: profile forms */}
				<div className="lg:col-span-2 space-y-4">
					{/* Personal info */}
					<form
						onSubmit={handleSavePersonalInfo}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<h2 className="text-lg font-semibold mb-4">
							المعلومات الشخصية
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									الاسم الكامل *
								</label>
								<div className="relative">
									<User
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										name="full_name"
										value={formData.full_name}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="أدخل اسمك"
										required
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									رقم الجوال *
								</label>
								<div className="relative">
									<Phone
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="+966 5x xxx xxxx"
										required
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									تاريخ الميلاد *
								</label>
								<div className="relative">
									<Calendar
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										name="dob"
										type="date"
										value={formData.dob}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										required
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									الجنس
								</label>
								<div className="relative">
									<User
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<select
										name="gender"
										value={formData.gender}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									>
										<option value="">اختر الجنس</option>
										<option value="male">ذكر</option>
										<option value="female">أنثى</option>
									</select>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									نوع الحساب *
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<select
										name="account_type"
										value={formData.account_type}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										required
									>
										<option value="individual">فرد</option>
										<option value="business">مؤسسة</option>
									</select>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="submit"
								disabled={saving}
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								<Save size={16} />
								{saving ? "جاري الحفظ..." : "حفظ التغييرات"}
							</button>
						</div>
					</form>

					{/* Business info */}
					<form
						onSubmit={handleSaveBusinessInfo}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<h2 className="text-lg font-semibold mb-4">
							المعلومات التجارية
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									اسم الشركة
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										name="company_name"
										value={formData.company_name}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="اسم الشركة"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									الرقم الضريبي
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										name="tax_number"
										value={formData.tax_number}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="الرقم الضريبي"
									/>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="submit"
								disabled={saving}
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								<Save size={16} />
								حفظ
							</button>
						</div>
					</form>

					{/* Address */}
					<form
						onSubmit={handleSaveAddress}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<h2 className="text-lg font-semibold mb-4">العنوان</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									المدينة
								</label>
								<div className="relative">
									<MapPin
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="الرياض"
									/>
								</div>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm text-gray-600 mb-1">
									العنوان التفصيلي
								</label>
								<input
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="اسم الشارع، رقم المبنى، الحي"
								/>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="submit"
								disabled={saving}
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								<Save size={16} />
								حفظ
							</button>
						</div>
					</form>
				</div>

				{/* Right column: public profile preview */}
				<div className="space-y-4">
					{/* Public profile preview */}
					<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
						<h3 className="text-lg font-semibold mb-4">
							الملف العام
						</h3>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-50 relative">
								<Image
									src={
										profile?.avatar_url ||
										"/logo-symbol.svg"
									}
									alt="Avatar"
									fill
									className="object-contain"
								/>
							</div>
							<div>
								<div className="text-sm font-medium text-gray-900">
									{profile?.full_name || "اسم المستخدم"}
								</div>
								<div className="text-xs text-gray-500">
									{profile?.account_type === "business"
										? "مؤسسة"
										: "فرد"}
									{profile?.company_name &&
										` • ${profile.company_name}`}
								</div>
							</div>
						</div>
						<p className="text-sm text-gray-600 mt-3">
							هذه معاينة لملفك العام كما يظهر للآخرين.
						</p>
					</div>

					{/* Profile info summary */}
					<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
						<h3 className="text-lg font-semibold mb-4">
							ملخص المعلومات
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">الاسم:</span>
								<span className="font-medium">
									{profile?.full_name || "غير محدد"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">الجوال:</span>
								<span className="font-medium">
									{profile?.phone || "غير محدد"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">
									نوع الحساب:
								</span>
								<span className="font-medium">
									{profile?.account_type === "business"
										? "مؤسسة"
										: "فرد"}
								</span>
							</div>
							{profile?.company_name && (
								<div className="flex justify-between">
									<span className="text-gray-600">
										الشركة:
									</span>
									<span className="font-medium">
										{profile.company_name}
									</span>
								</div>
							)}
							{profile?.city && (
								<div className="flex justify-between">
									<span className="text-gray-600">
										المدينة:
									</span>
									<span className="font-medium">
										{profile.city}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
