import { CalendarRange, Download, Search } from "lucide-react";

export default function AnalyticsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
					<button className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200 active:translate-y-[1px]">
						<CalendarRange size={16} />
						<span>نطاق زمني</span>
					</button>
					<button className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]">
						<Download size={16} />
						<span>تصدير</span>
					</button>
				</div>
			</div>

			{/* Content */}
			<section className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
				{children}
			</section>
		</div>
	);
}
