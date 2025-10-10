"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import InvoiceCreationModal from "@/components/InvoiceCreationModal";

export default function InvoicesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const router = useRouter();

	const openInvoiceModal = () => {
		setShowInvoiceModal(true);
	};

	const closeInvoiceModal = () => {
		setShowInvoiceModal(false);
	};

	const handleInvoiceSuccess = (id?: string) => {
		if (id) router.push(`/dashboard/invoices/${id}`);
		else window.location.reload();
	};

	return (
		<div className="space-y-6">
			{/* Page header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						الفواتير
					</h1>
					<p className="text-gray-500 mt-1">
						إدارة فواتيرك وإنشاء فواتير جديدة وتتبع المدفوعات
						والحالة
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
							placeholder="ابحث في الفواتير..."
							className="w-56 rounded-xl border border-gray-200 pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						/>
					</div>
					<button
						onClick={openInvoiceModal}
						className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 active:translate-y-[1px]"
					>
						<Plus size={16} />
						<span>فاتورة جديدة</span>
					</button>
				</div>
			</div>

			{/* Content */}
			<section className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
				{children}
			</section>

			{/* Invoice Creation Modal */}
			<InvoiceCreationModal
				isOpen={showInvoiceModal}
				onClose={closeInvoiceModal}
				onSuccess={handleInvoiceSuccess}
			/>
		</div>
	);
}
