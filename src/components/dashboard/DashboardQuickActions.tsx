"use client";

import { Plus, UserPlus, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface DashboardQuickActionsProps {
	onCreateInvoice: () => void;
}

export default function DashboardQuickActions({
	onCreateInvoice,
}: DashboardQuickActionsProps) {
	const router = useRouter();

	return (
		<div className="flex flex-wrap gap-3">
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={onCreateInvoice}
				className="inline-flex items-center gap-2 rounded-xl bg-[#7f2dfb] text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-[#6a1fd8] transition-all"
			>
				<Plus size={18} strokeWidth={2.5} />
				<span>إنشاء فاتورة جديدة</span>
			</motion.button>
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => router.push("/dashboard/clients")}
				className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700 px-5 py-2.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all"
			>
				<UserPlus size={18} strokeWidth={2.5} />
				<span>إضافة عميل</span>
			</motion.button>
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => router.push("/dashboard/products")}
				className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700 px-5 py-2.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all"
			>
				<Package size={18} strokeWidth={2.5} />
				<span>إضافة منتج</span>
			</motion.button>
		</div>
	);
}

