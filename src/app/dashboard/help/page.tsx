"use client";

import { useMemo, useState } from "react";
import {
	HelpCircle,
	MessageSquare,
	Mail,
	Phone,
	FileText,
	CreditCard,
	ShieldCheck,
	Settings,
	ExternalLink,
	Search,
} from "lucide-react";
import Link from "next/link";

interface FaqItem {
	q: string;
	a: string;
	articleHref: string; // placeholder to small article page
}

interface FaqSection {
	title: string;
	icon: React.ReactNode;
	items: FaqItem[];
	key: "invoices" | "account" | "billing";
}

const faqSections: FaqSection[] = [
	{
		title: "الفواتير",
		icon: <FileText className="text-blue-600" />,
		key: "invoices",
		items: [
			{
				q: "كيف أنشئ فاتورة جديدة؟",
				a: 'اذهب إلى قسم الفواتير ثم اضغط على "فاتورة جديدة"، قم بإدخال بيانات العميل والعناصر واحفظ.',
				articleHref: "/dashboard/help/articles/create-invoice",
			},
			{
				q: "تعديل نسبة الضريبة الافتراضية",
				a: "من إعدادات الفواتير > الضرائب والإرسال، حدّد نسبة الضريبة المطلوبة.",
				articleHref: "/dashboard/help/articles/invoice-tax",
			},
			{
				q: "تخصيص قالب الفاتورة",
				a: "من إعدادات الفواتير > الهوية البصرية ونمط القالب، اختر النمط واللون والشعار.",
				articleHref: "/dashboard/help/articles/invoice-template",
			},
		],
	},
	{
		title: "الحساب والأمان",
		icon: <ShieldCheck className="text-purple-600" />,
		key: "account",
		items: [
			{
				q: "تفعيل التحقق بخطوتين (2FA)",
				a: "من الإعدادات > الأمان فعّل زر التحقق بخطوتين لتأمين حسابك.",
				articleHref: "/dashboard/help/articles/enable-2fa",
			},
			{
				q: "تغيير كلمة المرور",
				a: "اذهب إلى الإعدادات > الأمان، وأدخل كلمة المرور الحالية والجديدة.",
				articleHref: "/dashboard/help/articles/change-password",
			},
			{
				q: "إدارة الفريق والأدوار",
				a: "في الإعدادات > إدارة الفريق (خطة Team)، أضف الأعضاء وحدّد الأدوار: Admin، Accountant، Viewer.",
				articleHref: "/dashboard/help/articles/team-roles",
			},
		],
	},
	{
		title: "الاشتراكات والدفع",
		icon: <CreditCard className="text-green-600" />,
		key: "billing",
		items: [
			{
				q: "عرض الفواتير وتنزيل PDF",
				a: "من الإعدادات > الفوترة والاشتراك، ستجد سجل الفواتير وزر التحميل.",
				articleHref: "/dashboard/help/articles/billing-history",
			},
			{
				q: "تغيير وسيلة الدفع",
				a: "من الإعدادات > الفوترة والاشتراك، اختر تغيير البطاقة أو إضافة Mada.",
				articleHref: "/dashboard/help/articles/change-payment",
			},
			{
				q: "ترقية أو تخفيض الخطة",
				a: "من بطاقة الخطة الحالية، استخدم أزرار ترقية/تخفيض.",
				articleHref: "/dashboard/help/articles/plan-upgrade",
			},
		],
	},
];

export default function HelpPage() {
	const [openKey, setOpenKey] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const filteredSections = useMemo(() => {
		if (!searchTerm.trim()) return faqSections;
		const term = searchTerm.toLowerCase();
		return faqSections
			.map((sec) => ({
				...sec,
				items: sec.items.filter((it) =>
					it.q.toLowerCase().includes(term)
				),
			}))
			.filter((sec) => sec.items.length > 0);
	}, [searchTerm]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<HelpCircle className="text-purple-600" />
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								المساعدة
							</h1>
							<p className="text-gray-500 mt-1">
								ابحث عن إجابات سريعة أو تواصل مع فريق الدعم
							</p>
						</div>
					</div>
					<div className="relative w-full max-w-xs">
						<Search
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
							size={16}
						/>
						<input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="اكتب مشكلتك…"
							className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>
				</div>
			</div>

			{/* Quick links */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Link
					href="/dashboard/invoices"
					className="bg-white rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
				>
					<div className="flex items-center gap-3">
						<FileText className="text-blue-600" />
						<div>
							<div className="text-sm font-medium text-gray-900">
								الفواتير
							</div>
							<div className="text-xs text-gray-500">
								إدارة الفواتير والأسئلة الشائعة
							</div>
						</div>
					</div>
				</Link>
				<Link
					href="/dashboard/settings"
					className="bg-white rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
				>
					<div className="flex items-center gap-3">
						<Settings className="text-gray-700" />
						<div>
							<div className="text-sm font-medium text-gray-900">
								الإعدادات
							</div>
							<div className="text-xs text-gray-500">
								الأمان، الإشعارات، التفضيلات
							</div>
						</div>
					</div>
				</Link>
				<Link
					href="/dashboard/settings#billing"
					className="bg-white rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
				>
					<div className="flex items-center gap-3">
						<CreditCard className="text-green-600" />
						<div>
							<div className="text-sm font-medium text-gray-900">
								الفوترة والاشتراك
							</div>
							<div className="text-xs text-gray-500">
								الخطة، الدفع، الفواتير
							</div>
						</div>
					</div>
				</Link>
				<Link
					href="/dashboard/profile"
					className="bg-white rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
				>
					<div className="flex items-center gap-3">
						<ShieldCheck className="text-purple-600" />
						<div>
							<div className="text-sm font-medium text-gray-900">
								الملف الشخصي
							</div>
							<div className="text-xs text-gray-500">
								تحديث معلوماتك العامة
							</div>
						</div>
					</div>
				</Link>
			</div>

			{/* Grouped FAQ with articles */}
			<div className="space-y-4">
				{filteredSections.map((section) => (
					<div
						key={section.title}
						className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6"
					>
						<div className="flex items-center gap-2 mb-3">
							{section.icon}
							<h2 className="text-lg font-semibold">
								{section.title}
							</h2>
						</div>
						<div className="divide-y divide-gray-200">
							{section.items.map((item, idx) => {
								const id = `${section.key}-${idx}`;
								return (
									<div key={id} className="py-3">
										<button
											onClick={() =>
												setOpenKey(
													openKey === id ? null : id
												)
											}
											className="w-full text-right flex items-center justify-between gap-4"
										>
											<span className="text-sm font-medium text-gray-900">
												{item.q}
											</span>
											<span className="text-gray-400">
												{openKey === id ? "–" : "+"}
											</span>
										</button>
										{openKey === id && (
											<div className="mt-2 space-y-2">
												<p className="text-sm text-gray-600 leading-relaxed">
													{item.a}
												</p>
												<Link
													href={item.articleHref}
													className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
												>
													قراءة المقال{" "}
													<ExternalLink size={14} />
												</Link>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{/* Contact support */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
					<h3 className="text-md font-semibold mb-3">تواصل معنا</h3>
					<div className="space-y-3 text-sm">
						<a
							href="mailto:support@bilfora.com"
							className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
						>
							<Mail size={16} /> support@bilfora.com
						</a>
						<a
							href="tel:+966500000000"
							className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
						>
							<Phone size={16} /> +966 50 000 0000
						</a>
						<div className="flex items-center gap-2">
							<button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
								<MessageSquare size={16} /> محادثة مباشرة
								(قريباً)
							</button>
							<button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
								<MessageSquare size={16} /> واتساب (قريباً)
							</button>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 md:col-span-2">
					<h3 className="text-md font-semibold mb-3">
						أرسل لنا رسالة
					</h3>
					<form className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<input
							placeholder="الاسم"
							className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
						<input
							placeholder="البريد الإلكتروني"
							type="email"
							className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
						<textarea
							placeholder="كيف يمكننا مساعدتك؟"
							className="md:col-span-2 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							rows={4}
						/>
						<div className="md:col-span-2 flex items-center justify-end">
							<button className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]">
								إرسال
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Contextual help */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h3 className="text-md font-semibold mb-3">مساعدة سياقية</h3>
				<p className="text-sm text-gray-600 mb-3">
					سنضيف أزرار مساعدة صغيرة (؟) داخل الصفحات لتفتح المقالات
					المناسبة مباشرة.
				</p>
				<div className="flex flex-wrap gap-2 text-sm">
					<Link
						href="/dashboard/help/articles/create-invoice"
						className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
					>
						إنشاء فاتورة
					</Link>
					<Link
						href="/dashboard/help/articles/invoice-template"
						className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
					>
						قالب الفاتورة
					</Link>
					<Link
						href="/dashboard/help/articles/enable-2fa"
						className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
					>
						تفعيل 2FA
					</Link>
					<Link
						href="/dashboard/help/articles/change-payment"
						className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
					>
						تغيير وسيلة الدفع
					</Link>
				</div>
			</div>
		</div>
	);
}
