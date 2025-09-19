"use client";

import { useMemo, useState } from "react";
import {
	ShieldCheck,
	Lock,
	LogOut,
	Bell,
	Mail,
	MessageSquare,
	Globe2,
	Clock4,
	CreditCard,
	ArrowUpRight,
	ArrowDownRight,
	Users,
	UserPlus,
	Trash2,
	Download,
} from "lucide-react";

interface InvoiceItem {
	id: string;
	date: string;
	amount: number;
	status: "paid" | "unpaid";
	link: string;
}

interface TeamMember {
	id: string;
	name: string;
	email: string;
	role: "Admin" | "Accountant" | "Viewer";
}

export default function SettingsPage() {
	// Security
	const [twoFA, setTwoFA] = useState(false);
	const [alertLogins, setAlertLogins] = useState(true);

	// Notifications
	const [emailNotif, setEmailNotif] = useState(true);
	const [smsNotif, setSmsNotif] = useState(false);
	const [frequency, setFrequency] = useState<
		"immediate" | "daily" | "weekly"
	>("immediate");

	// System
	const [language, setLanguage] = useState("ar");
	const [currency, setCurrency] = useState("SAR");
	const [timezone, setTimezone] = useState("auto");

	// Billing
	const [currentPlan] = useState<"Free" | "Pro" | "Team">("Pro");
	const renewalDate = "2025-12-31";
	const invoices: InvoiceItem[] = [
		{
			id: "INV-001",
			date: "2025-06-01",
			amount: 99,
			status: "paid",
			link: "#",
		},
		{
			id: "INV-002",
			date: "2025-05-01",
			amount: 99,
			status: "paid",
			link: "#",
		},
		{
			id: "INV-003",
			date: "2025-04-01",
			amount: 99,
			status: "paid",
			link: "#",
		},
	];

	// Team (visible only for Team plan)
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
		{
			id: "1",
			name: "أحمد محمد",
			email: "ahmed@example.com",
			role: "Admin",
		},
		{
			id: "2",
			name: "فاطمة علي",
			email: "fatima@example.com",
			role: "Accountant",
		},
	]);
	const isTeamPlan = useMemo(() => currentPlan === "Team", [currentPlan]);

	const formatSar = (n: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(n);

	const onChangePassword = (e: React.FormEvent) => {
		e.preventDefault();
		// Integrate with backend
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
				<p className="text-gray-500 mt-1">
					قم بإدارة الأمان، الإشعارات، التفضيلات، والفوترة
				</p>
			</div>

			{/* Security */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">الأمان</h2>
				<form
					onSubmit={onChangePassword}
					className="grid grid-cols-1 md:grid-cols-3 gap-4"
				>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							كلمة المرور الحالية
						</label>
						<div className="relative">
							<Lock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							كلمة المرور الجديدة
						</label>
						<div className="relative">
							<Lock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							تأكيد كلمة المرور
						</label>
						<div className="relative">
							<Lock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div className="md:col-span-3 flex items-center justify-end gap-2">
						<button
							type="submit"
							className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
						>
							تحديث كلمة المرور
						</button>
					</div>
				</form>
				<div className="mt-6 space-y-3">
					<label className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<ShieldCheck size={16} className="text-green-600" />{" "}
							تفعيل التحقق بخطوتين (2FA)
						</span>
						<input
							type="checkbox"
							checked={twoFA}
							onChange={(e) => setTwoFA(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</label>
					<label className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<ShieldCheck size={16} className="text-green-600" />{" "}
							تنبيهات تسجيل الدخول المشبوه
						</span>
						<input
							type="checkbox"
							checked={alertLogins}
							onChange={(e) => setAlertLogins(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</label>
					<button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50">
						<LogOut size={16} /> تسجيل الخروج من جميع الأجهزة
					</button>
				</div>
			</div>

			{/* Notifications */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">الإشعارات</h2>
				<div className="space-y-3">
					<label className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<Mail size={16} className="text-purple-600" />{" "}
							إشعارات البريد الإلكتروني
						</span>
						<input
							type="checkbox"
							checked={emailNotif}
							onChange={(e) => setEmailNotif(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</label>
					<label className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<MessageSquare
								size={16}
								className="text-purple-600"
							/>{" "}
							إشعارات الرسائل القصيرة
						</span>
						<input
							type="checkbox"
							checked={smsNotif}
							onChange={(e) => setSmsNotif(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</label>
				</div>
				<div className="mt-4">
					<label className="block text-sm text-gray-600 mb-1">
						تكرار الإشعارات
					</label>
					<select
						value={frequency}
						onChange={(e) =>
							setFrequency(
								e.target.value as
									| "immediate"
									| "daily"
									| "weekly"
							)
						}
						className="w-56 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
					>
						<option value="immediate">فوري</option>
						<option value="daily">ملخص يومي</option>
						<option value="weekly">ملخص أسبوعي</option>
					</select>
				</div>
			</div>

			{/* System Preferences */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">تفضيلات النظام</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							اللغة
						</label>
						<div className="relative">
							<Globe2
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							>
								<option value="ar">العربية</option>
								<option value="en">English</option>
							</select>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							العملة الافتراضية
						</label>
						<div className="relative">
							<CreditCard
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<select
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							>
								<option value="SAR">SAR</option>
								<option value="USD">USD</option>
								<option value="EUR">EUR</option>
							</select>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							المنطقة الزمنية
						</label>
						<div className="relative">
							<Clock4
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<select
								value={timezone}
								onChange={(e) => setTimezone(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							>
								<option value="auto">تلقائي</option>
								<option value="Asia/Riyadh">Asia/Riyadh</option>
								<option value="UTC">UTC</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Billing & Subscription */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">
					الفوترة والاشتراك
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="border border-gray-200 rounded-xl p-4">
						<div className="text-sm text-gray-600">
							الخطة الحالية
						</div>
						<div className="text-xl font-bold mt-1">
							{currentPlan}
						</div>
						<div className="text-sm text-gray-500 mt-1">
							تجدد في:{" "}
							{new Date(renewalDate).toLocaleDateString("ar-SA")}
						</div>
						<div className="flex gap-2 mt-3">
							<button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">
								<ArrowUpRight size={14} /> ترقية
							</button>
							<button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
								<ArrowDownRight size={14} /> تخفيض
							</button>
						</div>
					</div>
					<div className="border border-gray-200 rounded-xl p-4">
						<div className="text-sm text-gray-600">طريقة الدفع</div>
						<div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
							<CreditCard size={16} /> بطاقة ائتمان •••• 4242
						</div>
						<div className="flex gap-2 mt-3">
							<button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
								تغيير البطاقة
							</button>
							<button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
								إضافة Mada
							</button>
						</div>
					</div>
					<div className="border border-gray-200 rounded-xl p-4">
						<div className="text-sm text-gray-600">
							سجل الفواتير
						</div>
						<div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
							<table className="w-full text-sm">
								<thead className="bg-gray-50 text-gray-600">
									<tr>
										<th className="px-3 py-2 text-right">
											رقم الفاتورة
										</th>
										<th className="px-3 py-2 text-right">
											التاريخ
										</th>
										<th className="px-3 py-2 text-right">
											المبلغ
										</th>
										<th className="px-3 py-2 text-right">
											الحالة
										</th>
										<th className="px-3 py-2 text-right">
											تحميل
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{invoices.map((inv) => (
										<tr key={inv.id} className="bg-white">
											<td className="px-3 py-2">
												{inv.id}
											</td>
											<td className="px-3 py-2">
												{new Date(
													inv.date
												).toLocaleDateString("ar-SA")}
											</td>
											<td className="px-3 py-2">
												{formatSar(inv.amount)}
											</td>
											<td className="px-3 py-2">
												<span
													className={`px-2 py-0.5 rounded-full text-xs ${
														inv.status === "paid"
															? "bg-green-100 text-green-800"
															: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{inv.status === "paid"
														? "مدفوعة"
														: "غير مدفوعة"}
												</span>
											</td>
											<td className="px-3 py-2">
												<button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
													<Download size={14} /> PDF
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* Team Management */}
			{isTeamPlan && (
				<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
					<h2 className="text-lg font-semibold mb-4">إدارة الفريق</h2>
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm text-gray-600 flex items-center gap-2">
							<Users size={16} /> أعضاء الفريق
						</div>
						<button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">
							<UserPlus size={14} /> إضافة عضو
						</button>
					</div>
					<div className="border border-gray-200 rounded-lg overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 text-gray-600">
								<tr>
									<th className="px-3 py-2 text-right">
										الاسم
									</th>
									<th className="px-3 py-2 text-right">
										البريد الإلكتروني
									</th>
									<th className="px-3 py-2 text-right">
										الدور
									</th>
									<th className="px-3 py-2 text-right">
										إجراءات
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{teamMembers.map((m) => (
									<tr key={m.id} className="bg-white">
										<td className="px-3 py-2">{m.name}</td>
										<td className="px-3 py-2">{m.email}</td>
										<td className="px-3 py-2">
											<select
												value={m.role}
												onChange={(e) =>
													setTeamMembers((prev) =>
														prev.map((tm) =>
															tm.id === m.id
																? {
																		...tm,
																		role: e
																			.target
																			.value as TeamMember["role"],
																  }
																: tm
														)
													)
												}
												className="rounded-lg border border-gray-300 px-2 py-1"
											>
												<option>Admin</option>
												<option>Accountant</option>
												<option>Viewer</option>
											</select>
										</td>
										<td className="px-3 py-2">
											<button className="text-red-600 hover:text-red-800">
												إزالة
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Danger Zone */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-2 text-red-600">
					منطقة حساسة
				</h2>
				<p className="text-sm text-gray-500 mb-4">
					الرجاء استخدام هذه الإجراءات بحذر.
				</p>
				<div className="flex flex-col sm:flex-row gap-3">
					<button className="px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm hover:bg-red-50 inline-flex items-center gap-2">
						<Bell size={16} />
						تعطيل الإشعارات مؤقتاً
					</button>
					<button className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
						<Download size={16} />
						تصدير بيانات الحساب
					</button>
					<button className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 inline-flex items-center gap-2">
						<Trash2 size={16} />
						حذف الحساب نهائياً
					</button>
				</div>
			</div>
		</div>
	);
}
