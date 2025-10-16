"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, Download, Search, ChevronDown, FileText, Table } from "lucide-react";

export default function AnalyticsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [customFrom, setCustomFrom] = useState("");
	const [customTo, setCustomTo] = useState("");
	const datePickerRef = useRef<HTMLDivElement>(null);
	const exportMenuRef = useRef<HTMLDivElement>(null);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
				setShowDatePicker(false);
			}
			if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
				setShowExportMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const from = searchParams.get("from");
	const to = searchParams.get("to");

	const currentRangeLabel = useMemo(() => {
		if (from && to) return `${new Date(from).toLocaleDateString("ar-SA")} – ${new Date(to).toLocaleDateString("ar-SA")}`;
		return "نطاق زمني";
	}, [from, to]);

	const setRange = (days: number) => {
		const toDate = new Date();
		const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
		const params = new URLSearchParams(searchParams.toString());
		params.set("from", fromDate.toISOString());
		params.set("to", toDate.toISOString());
		router.push(`${pathname}?${params.toString()}`);
	};

	const setCustomRange = () => {
		if (customFrom && customTo) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("from", new Date(customFrom).toISOString());
			params.set("to", new Date(customTo).toISOString());
			router.push(`${pathname}?${params.toString()}`);
			setShowDatePicker(false);
		}
	};

	const exportData = async (format: 'csv' | 'excel', type: 'summary' | 'invoices') => {
		try {
			if (type === 'summary') {
				// Export summary data
				const summaryData = [
					['نطاق التصدير', `${from ? new Date(from).toLocaleDateString("ar-SA") : 'غير محدد'} - ${to ? new Date(to).toLocaleDateString("ar-SA") : 'غير محدد'}`],
					['تاريخ التصدير', new Date().toLocaleDateString("ar-SA")],
					[''],
					['البيانات', 'القيمة'],
					['إجمالي الإيرادات', 'يتم حسابها من البيانات'],
					['عدد الفواتير', 'يتم حسابها من البيانات'],
					['متوسط قيمة الفاتورة', 'يتم حسابها من البيانات'],
					['العملاء النشطون', 'يتم حسابها من البيانات']
				];

				const csvContent = summaryData.map(row => row.join(',')).join('\n');
				const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`;
				a.click();
				URL.revokeObjectURL(url);
			} else if (type === 'invoices') {
				// Export detailed invoice data
				const response = await fetch(`/api/analytics/export-invoices?from=${from || ''}&to=${to || ''}`);
				const data = await response.json();
				
				if (format === 'csv') {
					const csvContent = [
						['رقم الفاتورة', 'العميل', 'المبلغ الإجمالي', 'الحالة', 'تاريخ الإصدار', 'تاريخ الاستحقاق', 'الضريبة', 'المجموع الفرعي'],
						...data.map((invoice: any) => [
							invoice.invoice_number,
							invoice.client_name,
							invoice.total_amount,
							invoice.status,
							new Date(invoice.issue_date).toLocaleDateString("ar-SA"),
							new Date(invoice.due_date).toLocaleDateString("ar-SA"),
							invoice.tax_amount,
							invoice.subtotal
						])
					].map(row => row.join(',')).join('\n');
					
					const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
					a.click();
					URL.revokeObjectURL(url);
				} else {
					// For Excel, we'll use a simple CSV with .xlsx extension
					// In a real app, you'd use a library like xlsx
					const csvContent = [
						['رقم الفاتورة', 'العميل', 'المبلغ الإجمالي', 'الحالة', 'تاريخ الإصدار', 'تاريخ الاستحقاق', 'الضريبة', 'المجموع الفرعي'],
						...data.map((invoice: any) => [
							invoice.invoice_number,
							invoice.client_name,
							invoice.total_amount,
							invoice.status,
							new Date(invoice.issue_date).toLocaleDateString("ar-SA"),
							new Date(invoice.due_date).toLocaleDateString("ar-SA"),
							invoice.tax_amount,
							invoice.subtotal
						])
					].map(row => row.join('\t')).join('\n');
					
					const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `invoices-${new Date().toISOString().split('T')[0]}.xlsx`;
					a.click();
					URL.revokeObjectURL(url);
				}
			}
		} catch (error) {
			console.error('Export error:', error);
			alert('حدث خطأ أثناء التصدير');
		}
	};

	return (
		<div className="space-y-6">
			{/* Page header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						التحليلات
					</h1>
					<p className="text-gray-500 mt-1">
						نظرة متقدمة على الأداء والمبيعات والعملاء عبر الفترات
						الزمنية
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative hidden md:block">
						<Search
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
							size={16}
						/>
						<input
							type="search"
							placeholder="ابحث في التقارير..."
							className="w-56 rounded-xl border border-gray-200 pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>
					
					{/* Date Range Picker */}
					<div className="relative" ref={datePickerRef}>
						<button 
							onClick={() => setShowDatePicker(!showDatePicker)}
							className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200 active:translate-y-[1px]"
						>
							<CalendarRange size={16} />
							<span>{currentRangeLabel}</span>
							<ChevronDown size={16} />
						</button>
						
						{showDatePicker && (
							<div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 min-w-80">
								<div className="space-y-4">
									<h3 className="font-semibold text-gray-900">اختر النطاق الزمني</h3>
									
									{/* Quick ranges */}
									<div className="flex gap-2 flex-wrap">
										<button onClick={() => setRange(7)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">7 أيام</button>
										<button onClick={() => setRange(30)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">30 يوماً</button>
										<button onClick={() => setRange(90)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">3 أشهر</button>
										<button onClick={() => setRange(180)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">6 أشهر</button>
									</div>
									
									{/* Custom range */}
									<div className="border-t pt-4">
										<h4 className="font-medium text-gray-700 mb-3">نطاق مخصص</h4>
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-sm text-gray-600 mb-1">من</label>
												<input
													type="date"
													value={customFrom}
													onChange={(e) => setCustomFrom(e.target.value)}
													className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
												/>
											</div>
											<div>
												<label className="block text-sm text-gray-600 mb-1">إلى</label>
												<input
													type="date"
													value={customTo}
													onChange={(e) => setCustomTo(e.target.value)}
													className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
												/>
											</div>
										</div>
										<button
											onClick={setCustomRange}
											className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
										>
											تطبيق النطاق المخصص
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
					
					{/* Export Menu */}
					<div className="relative" ref={exportMenuRef}>
						<button 
							onClick={() => setShowExportMenu(!showExportMenu)}
							className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
						>
							<Download size={16} />
							<span>تصدير</span>
							<ChevronDown size={16} />
						</button>
						
						{showExportMenu && (
							<div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 min-w-48">
								<div className="space-y-1">
									<div className="px-3 py-2 text-sm font-medium text-gray-700">ملخص التحليلات</div>
									<button 
										onClick={() => exportData('csv', 'summary')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<FileText size={16} />
										تصدير CSV
									</button>
									<button 
										onClick={() => exportData('excel', 'summary')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<Table size={16} />
										تصدير Excel
									</button>
									
									<div className="border-t my-2"></div>
									<div className="px-3 py-2 text-sm font-medium text-gray-700">تفاصيل الفواتير</div>
									<button 
										onClick={() => exportData('csv', 'invoices')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<FileText size={16} />
										فواتير CSV
									</button>
									<button 
										onClick={() => exportData('excel', 'invoices')}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										<Table size={16} />
										فواتير Excel
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Content */}
			<section className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
				{children}
			</section>
		</div>
	);
}
