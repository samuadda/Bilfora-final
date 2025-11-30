import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default function ClientsLayout({
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
						العملاء
					</h1>
					<p className="text-gray-500 mt-1">
						إدارة عملائك، إضافة عملاء جدد، وتتبع نشاطهم وقيمتهم
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
							size={16}
						/>
						<input
							type="search"
							placeholder="ابحث في العملاء..."
							className="w-56 rounded-xl border border-gray-200 pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>
					<Link
						href="/dashboard/clients/new"
						className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-4 py-2 text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
					>
						<Plus size={16} strokeWidth={2.5} />
						<span>عميل جديد</span>
					</Link>
				</div>
			</div>

			{/* Content */}
			<section className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
				{children}
			</section>
		</div>
	);
}
