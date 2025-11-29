import { BarChart3 } from "lucide-react";

interface EmptyChartProps {
    message?: string;
}

export function EmptyChart({ message = "لا توجد بيانات" }: EmptyChartProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                <BarChart3 className="w-8 h-8 text-gray-300" />
            </div>
            <span className="text-sm font-bold text-gray-500">{message}</span>
        </div>
    );
}

