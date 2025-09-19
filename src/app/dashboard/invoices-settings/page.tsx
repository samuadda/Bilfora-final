"use client";

import { useState } from "react";
import Image from "next/image";
import {
	Hash,
	CalendarClock,
	PercentCircle,
	CreditCard,
	Send,
	FileText,
	BadgePercent,
	Building2,
	MapPin,
	LayoutTemplate,
	Palette,
	QrCode,
} from "lucide-react";

export default function InvoicesSettingsPage() {
	const [prefix, setPrefix] = useState("INV-");
	const [nextNumber, setNextNumber] = useState(101);
	const [dueDays, setDueDays] = useState(30);
	const [taxRate, setTaxRate] = useState(15);
	const [autoSend, setAutoSend] = useState(false);
	const [allowPartials, setAllowPartials] = useState(true);
	const [footerNote, setFooterNote] = useState("شكراً لتعاملكم معنا");
	const [enableCard, setEnableCard] = useState(true);
	const [enableMada, setEnableMada] = useState(true);
	const [enableBank, setEnableBank] = useState(false);

	// Added: Business info
	const [vatNumber, setVatNumber] = useState("");
	const [crNumber, setCrNumber] = useState("");
	const [businessLogo, setBusinessLogo] = useState<string | null>(null);
	const [addressLine, setAddressLine] = useState("");
	const [city, setCity] = useState("");
	const [country, setCountry] = useState("");

	// Added: Branding & template
	const [template, setTemplate] = useState<"classic" | "compact" | "modern">(
		"classic"
	);
	const [primaryColor, setPrimaryColor] = useState("#8B5CF6");

	// Added: Payment info
	const [iban, setIban] = useState("");
	const [qrValue, setQrValue] = useState("");

	const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setBusinessLogo(url);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h1 className="text-2xl font-bold text-gray-900">
					إعدادات الفواتير
				</h1>
				<p className="text-gray-500 mt-1">
					إعداد الترميز والضرائب والدفع التلقائي وخيارات السداد
				</p>
			</div>

			{/* Business info */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">
					معلومات النشاط التجاري
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							الرقم الضريبي (VAT)
						</label>
						<div className="relative">
							<BadgePercent
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								value={vatNumber}
								onChange={(e) => setVatNumber(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="1234567890"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							السجل التجاري (CR)
						</label>
						<div className="relative">
							<Building2
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								value={crNumber}
								onChange={(e) => setCrNumber(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="1010XXXX"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							شعار الفواتير
						</label>
						<div className="flex items-center gap-3">
							<div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gray-50">
								{businessLogo ? (
									<Image
										src={businessLogo}
										alt="Logo"
										fill
										className="object-contain"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
										No logo
									</div>
								)}
							</div>
							<label className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 cursor-pointer">
								تغيير الشعار
								<input
									type="file"
									accept="image/*"
									onChange={onLogoChange}
									className="hidden"
								/>
							</label>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
					<div className="md:col-span-2">
						<label className="block text-sm text-gray-600 mb-1">
							العنوان
						</label>
						<div className="relative">
							<MapPin
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								value={addressLine}
								onChange={(e) => setAddressLine(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="اسم الشارع، رقم المبنى، الحي"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							المدينة
						</label>
						<input
							value={city}
							onChange={(e) => setCity(e.target.value)}
							className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							placeholder="الرياض"
						/>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							الدولة
						</label>
						<input
							value={country}
							onChange={(e) => setCountry(e.target.value)}
							className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							placeholder="السعودية"
						/>
					</div>
				</div>
			</div>

			{/* Numbering & due */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">
					الترقيم ومواعيد الاستحقاق
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							بادئة رقم الفاتورة
						</label>
						<div className="relative">
							<Hash
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								value={prefix}
								onChange={(e) => setPrefix(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							الرقم التالي
						</label>
						<input
							type="number"
							value={nextNumber}
							onChange={(e) =>
								setNextNumber(
									parseInt(e.target.value || "0", 10)
								)
							}
							className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							أيام الاستحقاق الافتراضية
						</label>
						<div className="relative">
							<CalendarClock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="number"
								value={dueDays}
								onChange={(e) =>
									setDueDays(
										parseInt(e.target.value || "0", 10)
									)
								}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Taxes, sending, footer */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">الضرائب والإرسال</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							نسبة الضريبة (%)
						</label>
						<div className="relative">
							<PercentCircle
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="number"
								value={taxRate}
								onChange={(e) =>
									setTaxRate(
										parseFloat(e.target.value || "0")
									)
								}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							/>
						</div>
					</div>
					<div className="flex items-center justify-between p-3 border rounded-xl">
						<div className="flex items-center gap-2 text-sm text-gray-700">
							<Send size={16} className="text-purple-600" /> إرسال
							الفاتورة تلقائياً عند الإنشاء
						</div>
						<input
							type="checkbox"
							checked={autoSend}
							onChange={(e) => setAutoSend(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</div>
					<div className="flex items-center justify-between p-3 border rounded-xl">
						<div className="flex items-center gap-2 text-sm text-gray-700">
							<FileText size={16} className="text-purple-600" />{" "}
							السماح بالدفع الجزئي
						</div>
						<input
							type="checkbox"
							checked={allowPartials}
							onChange={(e) => setAllowPartials(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</div>
				</div>
				<div className="mt-4">
					<label className="block text-sm text-gray-600 mb-1">
						ملاحظة أسفل الفاتورة
					</label>
					<textarea
						rows={3}
						value={footerNote}
						onChange={(e) => setFooterNote(e.target.value)}
						className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						placeholder="نص يظهر في أسفل الفاتورة"
					/>
				</div>
			</div>

			{/* Branding & template */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">
					الهوية البصرية ونمط القالب
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							نمط القالب
						</label>
						<div className="relative">
							<LayoutTemplate
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<select
								value={template}
								onChange={(e) =>
									setTemplate(
										e.target.value as typeof template
									)
								}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							>
								<option value="classic">كلاسيك</option>
								<option value="compact">مضغوط</option>
								<option value="modern">حديث</option>
							</select>
						</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							اللون الأساسي
						</label>
						<div className="relative">
							<Palette
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								type="color"
								value={primaryColor}
								onChange={(e) =>
									setPrimaryColor(e.target.value)
								}
								className="w-full h-10 rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm cursor-pointer"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Payment methods */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">طرق الدفع</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="p-3 border rounded-xl flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<CreditCard size={16} className="text-green-600" />{" "}
							بطاقة ائتمان
						</span>
						<input
							type="checkbox"
							checked={enableCard}
							onChange={(e) => setEnableCard(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</div>
					<div className="p-3 border rounded-xl flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<CreditCard size={16} className="text-green-600" />{" "}
							Mada
						</span>
						<input
							type="checkbox"
							checked={enableMada}
							onChange={(e) => setEnableMada(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</div>
					<div className="p-3 border rounded-xl flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm text-gray-700">
							<CreditCard size={16} className="text-green-600" />{" "}
							تحويل بنكي
						</span>
						<input
							type="checkbox"
							checked={enableBank}
							onChange={(e) => setEnableBank(e.target.checked)}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
						/>
					</div>
				</div>
			</div>

			{/* Default payment info */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">
					بيانات الدفع الافتراضية
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							رقم الآيبان (IBAN)
						</label>
						<input
							value={iban}
							onChange={(e) => setIban(e.target.value)}
							className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							placeholder="SAxx xxxx xxxx xxxx xxxx xx"
						/>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">
							QR Mada / نص للدفع
						</label>
						<div className="relative">
							<QrCode
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={16}
							/>
							<input
								value={qrValue}
								onChange={(e) => setQrValue(e.target.value)}
								className="w-full rounded-xl border border-gray-200 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								placeholder="رابط QR أو تعليمات الدفع"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
