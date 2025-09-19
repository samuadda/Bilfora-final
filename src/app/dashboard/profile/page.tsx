"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function ProfilePage() {
	const avatarUrl: string | null = null;
	const [saving, setSaving] = useState(false);

	const onSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setTimeout(() => setSaving(false), 1000);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<div className="flex items-center gap-4">
					<div className="relative w-20 h-20 rounded-full overflow-hidden border">
						<Image
							src={avatarUrl || "/logo-ar-navy.svg"}
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
						onSubmit={onSave}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<h2 className="text-lg font-semibold mb-4">
							المعلومات الشخصية
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									الاسم الكامل
								</label>
								<div className="relative">
									<User
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="أدخل اسمك"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									البريد الإلكتروني
								</label>
								<div className="relative">
									<Mail
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										type="email"
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="you@example.com"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									رقم الجوال
								</label>
								<div className="relative">
									<Phone
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="+966 5x xxx xxxx"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									اللغة
								</label>
								<div className="relative">
									<Globe2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<select className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
										<option>العربية</option>
										<option>English</option>
									</select>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="button"
								className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
							>
								إلغاء
							</button>
							<button
								type="submit"
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
							>
								{saving ? "جاري الحفظ..." : "حفظ التغييرات"}
							</button>
						</div>
					</form>

					{/* Bio & role */}
					<form
						onSubmit={onSave}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<h2 className="text-lg font-semibold mb-4">
							النبذة والمسمى الوظيفي
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									المسمى الوظيفي
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="مثال: مدير المبيعات"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									الشركة
								</label>
								<div className="relative">
									<Building2
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="اسم الشركة"
									/>
								</div>
							</div>
						</div>
						<div className="mt-4">
							<label className="block text-sm text-gray-600 mb-1">
								نبذة تعريفية
							</label>
							<textarea
								rows={4}
								className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="اكتب نبذة قصيرة عنك، خبراتك واهتماماتك"
							></textarea>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="submit"
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
							>
								حفظ
							</button>
						</div>
					</form>

					{/* Address */}
					<form
						onSubmit={onSave}
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
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="الرياض"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									الدولة
								</label>
								<div className="relative">
									<MapPin
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
										size={16}
									/>
									<input
										className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										placeholder="السعودية"
									/>
								</div>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm text-gray-600 mb-1">
									العنوان التفصيلي
								</label>
								<input
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="اسم الشارع، رقم المبنى، الحي"
								/>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="submit"
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
							>
								حفظ
							</button>
						</div>
					</form>
				</div>

				{/* Right column: public profile & social links */}
				<div className="space-y-4">
					{/* Public profile preview */}
					<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
						<h3 className="text-lg font-semibold mb-4">
							الملف العام
						</h3>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-50 relative">
								<Image
									src={avatarUrl || "/logo-ar-navy.svg"}
									alt="Avatar"
									fill
									className="object-contain"
								/>
							</div>
							<div>
								<div className="text-sm font-medium text-gray-900">
									اسم المستخدم
								</div>
								<div className="text-xs text-gray-500">
									المسمى الوظيفي • الشركة
								</div>
							</div>
						</div>
						<p className="text-sm text-gray-600 mt-3">
							هذه معاينة لملفك العام كما يظهر للآخرين.
						</p>
					</div>

					{/* Social links */}
					<form
						onSubmit={onSave}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<h3 className="text-lg font-semibold mb-4">
							روابط التواصل
						</h3>
						<div className="space-y-3">
							<div className="relative">
								<AtSign
									size={16}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>
								<input
									className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="اسم المستخدم على X / تويتر"
								/>
							</div>
							<div className="relative">
								<LinkIcon
									size={16}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>
								<input
									className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="رابط لينكدإن"
								/>
							</div>
							<div className="relative">
								<LinkIcon
									size={16}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>
								<input
									className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="الموقع الشخصي"
								/>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2 mt-4">
							<button
								type="submit"
								className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
							>
								حفظ
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
