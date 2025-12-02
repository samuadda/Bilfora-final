"use client";

import { motion } from "framer-motion";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardKpiCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	color: "purple" | "blue" | "green" | "orange" | "red" | "indigo";
	trend?: {
		value: number; // percentage change
		label?: string;
	};
	delay?: number;
}

export default function DashboardKpiCard({
	title,
	value,
	icon: Icon,
	color,
	trend,
	delay = 0,
}: DashboardKpiCardProps) {
	const colors = {
		purple: "bg-purple-50 text-[#7f2dfb]",
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		orange: "bg-orange-50 text-orange-600",
		red: "bg-red-50 text-red-600",
		indigo: "bg-indigo-50 text-indigo-600",
	};

	const isPositive = trend ? trend.value >= 0 : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.5 }}
			className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
		>
			{/* Subtle gradient background */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />

			<div className="flex justify-between items-start mb-4 relative z-10">
				<div
					className={cn(
						"p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300",
						colors[color]
					)}
				>
					<Icon size={24} strokeWidth={2.5} />
				</div>
				{trend && (
					<span
						className={cn(
							"flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
							isPositive
								? "text-green-600 bg-green-50 border border-green-100"
								: "text-red-600 bg-red-50 border border-red-100"
						)}
					>
						{isPositive ? (
							<ArrowUpRight size={12} />
						) : (
							<ArrowDownRight size={12} />
						)}
						{Math.abs(trend.value).toFixed(1)}%
						{trend.label && (
							<span className="text-gray-500 font-normal mr-1 text-[10px]">
								{trend.label}
							</span>
						)}
					</span>
				)}
			</div>
			<div className="relative z-10">
				<p className="text-gray-500 text-sm font-medium mb-1 opacity-80">
					{title}
				</p>
				<h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
					{value}
				</h3>
			</div>
		</motion.div>
	);
}

