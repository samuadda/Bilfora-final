"use client";

import { motion } from "framer-motion";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { MonthlyStats } from "@/hooks/useInvoiceStats";

interface MonthlyStatsCardsProps {
	stats: MonthlyStats;
	formatCurrency: (amount: number) => string;
}

export default function MonthlyStatsCards({
	stats,
	formatCurrency,
}: MonthlyStatsCardsProps) {
	const cards = [
		{
			title: "إجمالي الفواتير",
			value: formatCurrency(stats.totalInvoiced),
			icon: DollarSign,
			color: "blue",
			delay: 0.1,
		},
		{
			title: "المحصل",
			value: formatCurrency(stats.collected),
			icon: CheckCircle,
			color: "green",
			delay: 0.2,
		},
		{
			title: "المستحقات",
			value: formatCurrency(stats.outstanding),
			icon: Clock,
			color: "orange",
			delay: 0.3,
		},
		{
			title: "فواتير متأخرة",
			value: stats.overdueCount,
			icon: AlertCircle,
			color: "red",
			delay: 0.4,
		},
	];

	const colors = {
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		orange: "bg-orange-50 text-orange-600",
		red: "bg-red-50 text-red-600",
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<motion.div
						key={card.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: card.delay, duration: 0.5 }}
						className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className={`p-2.5 rounded-xl ${colors[card.color as keyof typeof colors]}`}
							>
								<Icon size={20} strokeWidth={2.5} />
							</div>
						</div>
						<div>
							<p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
							<h3 className="text-2xl font-bold text-gray-900 tracking-tight">
								{card.value}
							</h3>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
}

