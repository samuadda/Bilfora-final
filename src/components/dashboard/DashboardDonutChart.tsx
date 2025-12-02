"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface StatusData {
	name: string;
	value: number;
	color: string;
}

interface DashboardDonutChartProps {
	data: StatusData[];
	total: number;
}

export default function DashboardDonutChart({
	data,
	total,
}: DashboardDonutChartProps) {
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0];
			const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
			return (
				<div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-sm">
					<p className="font-bold mb-1">{data.name}</p>
					<p className="font-medium">{data.value} فاتورة</p>
					<p className="text-xs opacity-70 mt-1">{percentage}% من الإجمالي</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 min-h-[280px] relative">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={70}
							outerRadius={95}
							paddingAngle={4}
							dataKey="value"
							cornerRadius={6}
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
					</PieChart>
				</ResponsiveContainer>
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-center">
						<p className="text-3xl font-extrabold text-gray-900">{total}</p>
						<p className="text-xs text-gray-500 mt-1">إجمالي الفواتير</p>
					</div>
				</div>
			</div>
			<div className="mt-4">
				<Legend
					verticalAlign="bottom"
					height={36}
					iconType="circle"
					formatter={(value) => (
						<span className="text-sm font-medium text-gray-600 mr-2">
							{value}
						</span>
					)}
				/>
			</div>
		</div>
	);
}
