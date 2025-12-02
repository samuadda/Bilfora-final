"use client";

import { motion } from "framer-motion";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	color: "purple" | "blue" | "green" | "pink" | "orange" | "red" | "indigo";
	trend?: {
		value: number; // percentage change
		label?: string;
	};
	subtitle?: string;
	delay?: number;
}

export default function KPICard({
	title,
	value,
	icon: Icon,
	color,
	trend,
	subtitle,
	delay = 0,
}: KPICardProps) {
	const colors = {
		purple: "bg-purple-50 text-[#7f2dfb]",
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		pink: "bg-pink-50 text-pink-600",
		orange: "bg-orange-50 text-orange-600",
		red: "bg-red-50 text-red-600",
		indigo: "bg-indigo-50 text-indigo-600",
	};

	const isPositive = trend ? trend.value >= 0 : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay }}
			whileHover={{ y: -4 }}
			className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
		>
			<div className="flex justify-between items-start mb-4">
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
								? "text-green-600 bg-green-50"
								: "text-red-600 bg-red-50"
						)}
					>
						{isPositive ? (
							<ArrowUpRight size={12} />
						) : (
							<ArrowDownRight size={12} />
						)}
						{Math.abs(trend.value)}%
						{trend.label && (
							<span className="text-gray-500 font-normal mr-1">
								{trend.label}
							</span>
						)}
					</span>
				)}
			</div>
			<div>
				<p className="text-gray-500 text-sm font-bold mb-1 opacity-80">{title}</p>
				<h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
					{value}
				</h3>
				{subtitle && (
					<p className="text-xs text-gray-400 mt-1">{subtitle}</p>
				)}
			</div>
		</motion.div>
	);
}

