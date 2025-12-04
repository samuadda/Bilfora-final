import { supabase } from "@/lib/supabase";
import { InvoiceWithClientAndItems } from "@/types/database";

export interface MonthlyStats {
	totalInvoiced: number; // Sum of total_amount for invoices in month
	collected: number; // Sum of total_amount where status = 'paid'
	outstanding: number; // Sum of total_amount where status != 'paid' and not cancelled
	overdueCount: number; // Count of invoices where due_date < today and status != 'paid'
	totalInvoices: number; // Total count of invoices
	paidInvoices: number; // Count of paid invoices
}

export interface DailyRevenue {
	day: number;
	date: string;
	revenue: number;
	paid: number;
}

export function useInvoiceStats() {

	/**
	 * Get monthly stats for a specific month/year
	 */
	const getMonthlyStats = async (
		userId: string,
		year: number,
		month: number
	): Promise<MonthlyStats> => {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
		const today = new Date();

		const { data: invoices, error: fetchError } = await supabase
			.from("invoices")
			.select("status, total_amount, due_date, issue_date")
			.eq("user_id", userId)
			.gte("issue_date", monthStart.toISOString())
			.lte("issue_date", monthEnd.toISOString());

		if (fetchError) throw fetchError;

		const stats: MonthlyStats = {
			totalInvoiced: 0,
			collected: 0,
			outstanding: 0,
			overdueCount: 0,
			totalInvoices: invoices?.length || 0,
			paidInvoices: 0,
		};

		invoices?.forEach((inv) => {
			const amount = Number(inv.total_amount || 0);
			stats.totalInvoiced += amount;

			if (inv.status === "paid") {
				stats.collected += amount;
				stats.paidInvoices += 1;
			} else if (inv.status !== "cancelled") {
				stats.outstanding += amount;

				// Check if overdue
				const dueDate = new Date(inv.due_date);
				if (dueDate < today && inv.status !== "paid") {
					stats.overdueCount += 1;
				}
			}
		});

		return stats;
	};

	/**
	 * Get daily revenue breakdown for a month
	 */
	const getDailyRevenue = async (
		userId: string,
		year: number,
		month: number
	): Promise<DailyRevenue[]> => {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
		const daysInMonth = monthEnd.getDate();

		const { data: invoices, error: fetchError } = await supabase
			.from("invoices")
			.select("issue_date, total_amount, status")
			.eq("user_id", userId)
			.gte("issue_date", monthStart.toISOString())
			.lte("issue_date", monthEnd.toISOString());

		if (fetchError) throw fetchError;

		// Initialize daily revenue array
		const dailyRevenue: DailyRevenue[] = [];
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			dailyRevenue.push({
				day,
				date: date.toISOString(),
				revenue: 0,
				paid: 0,
			});
		}

		// Aggregate by day
		invoices?.forEach((inv) => {
			const invDate = new Date(inv.issue_date);
			const day = invDate.getDate();
			const amount = Number(inv.total_amount || 0);

			if (day >= 1 && day <= daysInMonth) {
				dailyRevenue[day - 1].revenue += amount;
				if (inv.status === "paid") {
					dailyRevenue[day - 1].paid += amount;
				}
			}
		});

		return dailyRevenue;
	};

	/**
	 * Get recent invoices for a month
	 */
	const getRecentInvoices = async (
		userId: string,
		year: number,
		month: number,
		limit: number = 8
	): Promise<InvoiceWithClientAndItems[]> => {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

		const { data, error: fetchError } = await supabase
			.from("invoices")
			.select(
				`
				*,
				client:clients(*),
				items:invoice_items(*)
			`
			)
			.eq("user_id", userId)
			.gte("issue_date", monthStart.toISOString())
			.lte("issue_date", monthEnd.toISOString())
			.order("created_at", { ascending: false })
			.limit(limit);

		if (fetchError) throw fetchError;

		return (data as InvoiceWithClientAndItems[]) || [];
	};

	return {
		getMonthlyStats,
		getDailyRevenue,
		getRecentInvoices,
	};
}

