"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, FileText, Printer, ArrowLeft } from "lucide-react";
import {
	PDFDownloadLink,
	Page,
	Text,
	View,
	Document,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";
import Link from "next/link";
import { motion } from "framer-motion";

// Register Arabic fonts for proper RTL rendering with error handling
try {
Font.register({
	family: "NotoNaskh", // اسم بسيط بدون مسافات
	fonts: [
		{
			src: "/fonts/Noto-Naskh-Arabic/NotoNaskhArabic-Regular.ttf",
			fontWeight: "normal",
		},
		{
			src: "/fonts/Noto-Naskh-Arabic/NotoNaskhArabic-Medium.ttf",
			fontWeight: 500,
		},
		{
			src: "/fonts/Noto-Naskh-Arabic/NotoNaskhArabic-SemiBold.ttf",
			fontWeight: 600,
		},
		{
			src: "/fonts/Noto-Naskh-Arabic/NotoNaskhArabic-Bold.ttf",
			fontWeight: "bold",
		},
	],
});

} catch (error) {
	console.warn("Failed to register Noto Naskh Arabic font:", error);
}

// Register Markazi Text as fallback
try {
	Font.register({
		family: "Markazi Text",
		fonts: [
			{
				src: "/fonts/markazi/MarkaziText-Regular.ttf",
				fontWeight: "normal",
			},
			{ src: "/fonts/markazi/MarkaziText-Bold.ttf", fontWeight: "bold" },
		],
	});
} catch (error) {
	console.warn("Failed to register Markazi Text font:", error);
}

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 32,
		fontSize: 12,
		fontFamily: "NotoNaskh",
		lineHeight: 1.6,
		direction: "rtl",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 32,
		paddingBottom: 24,
		borderBottomWidth: 2,
		borderBottomColor: "#7f2dfb",
	},
	logoSection: {
		flexDirection: "column",
		alignItems: "flex-start",
		width: "50%",
	},
	logoPlaceholder: {
		width: 60,
		height: 60,
		backgroundColor: "#7f2dfb",
		marginBottom: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	logoText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "bold",
		fontFamily: "NotoNaskh",
	},
	companyName: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#012d46",
		marginBottom: 8,
		fontFamily: "NotoNaskh",
	},
	companyInfo: {
		fontSize: 10,
		color: "#6B7280",
		lineHeight: 1.6,
		marginTop: 4,
		fontFamily: "NotoNaskh",
	},
	companyInfoRow: {
		marginBottom: 3,
	},
	invoiceInfo: {
		flexDirection: "column",
		alignItems: "flex-end",
		width: "45%",
	},
	invoiceTitle: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#012d46",
		marginBottom: 16,
		fontFamily: "NotoNaskh",
	},
	invoiceDetails: {
		fontSize: 11,
		color: "#374151",
		lineHeight: 1.8,
		fontFamily: "NotoNaskh",
	},
	invoiceDetailRow: {
		marginBottom: 6,
	},
	section: {
		marginBottom: 28,
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: "bold",
		color: "#012d46",
		marginBottom: 12,
		backgroundColor: "#F7F7F7",
		padding: 10,
		borderRadius: 6,
		textAlign: "right",
		fontFamily: "NotoNaskh",
	},
	clientInfo: {
		flexDirection: "column",
		alignItems: "flex-start",
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		marginTop: 8,
	},
	clientDetails: {
		flexDirection: "column",
		alignItems: "flex-start",
	},
	clientName: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#012d46",
		marginBottom: 8,
		fontFamily: "NotoNaskh",
	},
	clientDetailRow: {
		fontSize: 11,
		color: "#6B7280",
		marginBottom: 4,
		lineHeight: 1.6,
		fontFamily: "NotoNaskh",
	},
	table: {
		width: "100%",
		marginTop: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 8,
		overflow: "hidden",
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#7f2dfb",
		paddingVertical: 12,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
		paddingVertical: 12,
	},
	tableRowZebra: {
		backgroundColor: "#FAFAFA",
	},
	tableHeaderCell: {
		flex: 1,
		paddingHorizontal: 12,
		fontWeight: "bold",
		color: "#FFFFFF",
		textAlign: "right",
		fontSize: 12,
		fontFamily: "NotoNaskh",
	},
	tableHeaderCellCenter: {
		textAlign: "center",
	},
	tableCell: {
		flex: 1,
		paddingHorizontal: 12,
		textAlign: "right",
		fontSize: 11,
		color: "#374151",
		fontFamily: "NotoNaskh",
	},
	tableCellCenter: {
		textAlign: "center",
	},
	tableCellNumber: {
		textAlign: "right",
		fontFamily: "NotoNaskh",
		direction: "ltr",
	},
	descriptionCell: {
		flex: 2.5,
		paddingHorizontal: 12,
		textAlign: "right",
		fontSize: 11,
		color: "#374151",
		fontFamily: "NotoNaskh",
	},
	totalsSection: {
		marginTop: 28,
		alignItems: "flex-end",
	},
	totalsCard: {
		width: 320,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 8,
		padding: 20,
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 8,
		marginBottom: 4,
	},
	totalLabel: {
		fontSize: 12,
		color: "#6B7280",
		textAlign: "right",
		fontFamily: "NotoNaskh",
	},
	totalValue: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#374151",
		textAlign: "left",
		fontFamily: "NotoNaskh",
		direction: "ltr",
	},
	totalDivider: {
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		marginVertical: 12,
	},
	finalTotal: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#7f2dfb",
		borderRadius: 6,
		marginTop: 8,
	},
	finalTotalLabel: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#FFFFFF",
		fontFamily: "NotoNaskh",
	},
	finalTotalValue: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#FFFFFF",
		fontFamily: "NotoNaskh",
		direction: "ltr",
	},
	footer: {
		marginTop: 48,
		paddingTop: 24,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		alignItems: "center",
	},
	footerText: {
		fontSize: 10,
		color: "#9CA3AF",
		textAlign: "center",
		lineHeight: 1.6,
		marginBottom: 4,
		fontFamily: "NotoNaskh",
	},
	notes: {
		marginTop: 24,
		padding: 16,
		backgroundColor: "#FEF3C7",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#F59E0B",
	},
	notesText: {
		fontSize: 11,
		color: "#92400E",
		lineHeight: 1.6,
		fontFamily: "NotoNaskh",
	},
	notesLabel: {
		fontWeight: "bold",
		marginBottom: 4,
	},
});

function InvoicePDF({ invoice, client, items }: any) {
	const subtotal = items.reduce(
		(s: number, it: any) => s + it.quantity * it.unit_price,
		0
	);
	const vat = subtotal * ((invoice?.tax_rate || 0) / 100);
	const total = subtotal + vat;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-GB");
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "draft":
				return "مسودة";
			case "sent":
				return "مرسلة";
			case "paid":
				return "مدفوعة";
			case "overdue":
				return "متأخرة";
			case "cancelled":
				return "ملغية";
			default:
				return "غير محدد";
		}
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Professional Header */}
				<View style={styles.header}>
					<View style={styles.logoSection}>
						{/* Logo Placeholder */}
						<View style={styles.logoPlaceholder}>
							<Text style={styles.logoText}>بيلفورة</Text>
						</View>
						<Text style={styles.companyName}>بيلفورة</Text>
						<View style={styles.companyInfo}>
							<Text style={styles.companyInfoRow}>
								الرياض، المملكة العربية السعودية
							</Text>
							<Text style={styles.companyInfoRow}>
								البريد الإلكتروني: info@bilfora.com
							</Text>
							<Text style={styles.companyInfoRow}>
								الهاتف: +966 50 123 4567
							</Text>
							<Text style={styles.companyInfoRow}>
								الرقم الضريبي: 123456789012345
							</Text>
						</View>
					</View>
					<View style={styles.invoiceInfo}>
						<Text style={styles.invoiceTitle}>فاتورة</Text>
						<View style={styles.invoiceDetails}>
							<Text style={styles.invoiceDetailRow}>
								رقم الفاتورة:{" "}
								{invoice?.invoice_number || invoice?.id}
							</Text>
							<Text style={styles.invoiceDetailRow}>
								تاريخ الإصدار: {formatDate(invoice?.issue_date)}
							</Text>
							<Text style={styles.invoiceDetailRow}>
								تاريخ الاستحقاق: {formatDate(invoice?.due_date)}
							</Text>
							<Text style={styles.invoiceDetailRow}>
								الحالة: {getStatusText(invoice?.status || "")}
							</Text>
						</View>
					</View>
				</View>

				{/* Client Information Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>معلومات العميل</Text>
					<View style={styles.clientInfo}>
						<View style={styles.clientDetails}>
							<Text style={styles.clientName}>
								{client?.name || "غير محدد"}
							</Text>
							{client?.company_name && (
								<Text style={styles.clientDetailRow}>
									الشركة: {client.company_name}
								</Text>
							)}
							<Text style={styles.clientDetailRow}>
								البريد الإلكتروني: {client?.email || "-"}
							</Text>
							<Text style={styles.clientDetailRow}>
								الهاتف: {client?.phone || "-"}
							</Text>
							{client?.tax_number && (
								<Text style={styles.clientDetailRow}>
									الرقم الضريبي: {client.tax_number}
								</Text>
							)}
							{client?.address && (
								<Text style={styles.clientDetailRow}>
									العنوان: {client.address}
									{client?.city ? `، ${client.city}` : ""}
								</Text>
							)}
						</View>
					</View>
				</View>

				{/* Invoice Items Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>تفاصيل الفاتورة</Text>
					<View style={styles.table}>
						{/* Table Header */}
						<View style={styles.tableHeader}>
							<Text
								style={[
									styles.tableHeaderCell,
									styles.descriptionCell,
								]}
							>
								الوصف
							</Text>
							<Text
								style={[
									styles.tableHeaderCell,
									styles.tableHeaderCellCenter,
								]}
							>
								الكمية
							</Text>
							<Text
								style={[
									styles.tableHeaderCell,
									styles.tableCellNumber,
								]}
							>
								السعر
							</Text>
							<Text
								style={[
									styles.tableHeaderCell,
									styles.tableCellNumber,
								]}
							>
								الإجمالي
							</Text>
						</View>
						{/* Table Rows with Zebra Striping */}
						{items.map((it: any, i: number) => (
							<View
								style={[
									styles.tableRow,
									i % 2 === 1 ? styles.tableRowZebra : {},
								]}
								key={i}
							>
								<Text style={styles.descriptionCell}>
									{it.description || "-"}
								</Text>
								<Text
									style={[
										styles.tableCell,
										styles.tableCellCenter,
									]}
								>
									{it.quantity || 0}
								</Text>
								<Text
									style={[
										styles.tableCell,
										styles.tableCellNumber,
									]}
								>
									{formatCurrency(Number(it.unit_price) || 0)}
								</Text>
								<Text
									style={[
										styles.tableCell,
										styles.tableCellNumber,
									]}
								>
									{formatCurrency(
										(it.quantity || 0) *
											(it.unit_price || 0)
									)}
								</Text>
							</View>
						))}
					</View>
				</View>

				{/* Totals Summary Card */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>الإجمالي</Text>
					<View style={styles.totalsSection}>
						<View style={styles.totalsCard}>
							<View style={styles.totalRow}>
								<Text style={styles.totalLabel}>
									المجموع الفرعي:
								</Text>
								<Text style={styles.totalValue}>
									{formatCurrency(subtotal)}
								</Text>
							</View>
							<View style={styles.totalRow}>
								<Text style={styles.totalLabel}>
									الضريبة ({invoice?.tax_rate || 0}%):
								</Text>
								<Text style={styles.totalValue}>
									{formatCurrency(vat)}
								</Text>
							</View>
							<View style={styles.totalDivider} />
							<View style={styles.finalTotal}>
								<Text style={styles.finalTotalLabel}>
									الإجمالي:
								</Text>
								<Text style={styles.finalTotalValue}>
									{formatCurrency(total)}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Notes */}
				{invoice?.notes && (
					<View style={styles.notesText}>
						<Text style={styles.notesLabel}>ملاحظات:</Text>
						<Text>{invoice.notes}</Text>
					</View>
				)}

				{/* Professional Footer */}
				<View style={styles.footer}>
					<Text style={styles.footerText}>
						صُنعت هذه الفاتورة بواسطة منصة بيلفورا – النظام المعتمد
						لإصدار الفواتير الاحترافية.
					</Text>
				</View>
			</Page>
		</Document>
	);
}

export default function InvoiceShowPage() {
	const params = useParams<{ id: string }>();
	const [loading, setLoading] = useState(true);
	const [invoice, setInvoice] = useState<any>(null);
	const [client, setClient] = useState<any>(null);
	const [items, setItems] = useState<any[]>([]);

	useEffect(() => {
		(async () => {
			const { data: inv } = await supabase
				.from("invoices")
				.select("*")
				.eq("id", params.id)
				.single();
			setInvoice(inv || null);
			if (inv?.client_id) {
				const { data: c } = await supabase
					.from("clients")
					.select("*")
					.eq("id", inv.client_id)
					.single();
				setClient(c || null);
			}
			const { data: it } = await supabase
				.from("invoice_items")
				.select("*")
				.eq("invoice_id", params.id);
			setItems(it || []);
			setLoading(false);
		})();
	}, [params.id]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 2,
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-10 w-10 text-[#7f2dfb] animate-spin" />
			</div>
		);
	}
	if (!invoice)
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
				<FileText size={48} className="mb-4 opacity-50" />
				<p>الفاتورة غير موجودة أو تم حذفها</p>
				<Link
					href="/dashboard/invoices"
					className="mt-4 text-[#7f2dfb] hover:underline"
				>
					العودة للفواتير
				</Link>
			</div>
		);

	// Only create PDF document if we have invoice data
	const pdfDoc = invoice ? (
		<InvoicePDF invoice={invoice} client={client} items={items} />
	) : null;

	return (
		<div className="space-y-6 pb-10">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
			>
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard/invoices"
						className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							فاتورة{" "}
							{invoice.invoice_number || invoice.id.slice(0, 8)}
							<span
								className={`text-xs px-2 py-1 rounded-full ${
									invoice.status === "paid"
										? "bg-green-100 text-green-700"
										: invoice.status === "draft"
										? "bg-gray-100 text-gray-700"
										: "bg-blue-100 text-blue-700"
								}`}
							>
								{invoice.status === "paid"
									? "مدفوعة"
									: invoice.status === "draft"
									? "مسودة"
									: "مرسلة"}
							</span>
						</h1>
						<p className="text-sm text-gray-500">
							تاريخ الإصدار:{" "}
							{new Date(invoice.issue_date).toLocaleDateString(
								"en-GB"
							)}
						</p>
					</div>
				</div>
				{pdfDoc ? (
					<PDFDownloadLink
						document={pdfDoc}
						fileName={`invoice-${
							invoice.invoice_number || invoice.id
						}.pdf`}
						className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all font-bold text-sm disabled:opacity-70 no-underline cursor-pointer"
						style={{ textDecoration: "none" }}
					>
						{({ loading, error }) => {
							if (error) {
								console.error("PDF generation error:", error);
								return (
									<span className="inline-flex items-center gap-2">
										<Printer size={18} />
										خطأ في التحميل
									</span>
								);
							}
							return (
								<span className="inline-flex items-center gap-2">
									{loading ? (
										<Loader2
											size={18}
											className="animate-spin"
										/>
									) : (
										<Printer size={18} />
									)}
									{loading ? "جاري التحضير..." : "تحميل PDF"}
								</span>
							);
						}}
					</PDFDownloadLink>
				) : (
					<button
						disabled
						className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-400 text-white shadow-lg transition-all font-bold text-sm opacity-70 cursor-not-allowed"
					>
						<Loader2 size={18} className="animate-spin" />
						جاري التحميل...
					</button>
				)}
			</motion.div>

			{/* Invoice Paper View */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 shadow-sm max-w-4xl mx-auto"
			>
				{/* Invoice Header */}
				<div className="flex flex-col md:flex-row justify-between mb-12 border-b border-gray-100 pb-8">
					<div>
						<h2 className="text-3xl font-bold text-[#7f2dfb] mb-2">
							بيلفورة
						</h2>
						<div className="text-sm text-gray-500 space-y-1">
							<p>الرياض، المملكة العربية السعودية</p>
							<p>info@bilfora.com</p>
							<p>+966 50 123 4567</p>
						</div>
					</div>
					<div className="text-left mt-6 md:mt-0">
						<h3 className="text-4xl font-black text-gray-900 mb-2">
							فاتورة
						</h3>
						<div className="text-sm text-gray-500 space-y-1">
							<p>
								<span className="font-medium text-gray-700">
									رقم الفاتورة:
								</span>{" "}
								{invoice.invoice_number}
							</p>
							<p>
								<span className="font-medium text-gray-700">
									تاريخ الإصدار:
								</span>{" "}
								{new Date(
									invoice.issue_date
								).toLocaleDateString("en-GB")}
							</p>
							<p>
								<span className="font-medium text-gray-700">
									تاريخ الاستحقاق:
								</span>{" "}
								{new Date(invoice.due_date).toLocaleDateString(
									"en-GB"
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Client Info */}
				<div className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
					<h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
						فوترة إلى
					</h4>
					<div className="flex flex-col gap-1">
						<span className="text-lg font-bold text-gray-900">
							{client?.name}
						</span>
						<span className="text-gray-600">
							{client?.company_name}
						</span>
						<span className="text-gray-500 text-sm">
							{client?.email}
						</span>
						<span className="text-gray-500 text-sm">
							{client?.phone}
						</span>
					</div>
				</div>

				{/* Items Table */}
				<div className="overflow-x-auto mb-12">
					<table className="w-full">
						<thead>
							<tr className="border-b-2 border-gray-100">
								<th className="py-4 text-right text-sm font-bold text-gray-900 w-1/2">
									الوصف
								</th>
								<th className="py-4 text-center text-sm font-bold text-gray-900">
									الكمية
								</th>
								<th className="py-4 text-center text-sm font-bold text-gray-900">
									السعر
								</th>
								<th className="py-4 text-left text-sm font-bold text-gray-900">
									الإجمالي
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{items.map((it, i) => (
								<tr key={i}>
									<td className="py-4 text-gray-700 font-medium">
										{it.description}
									</td>
									<td className="py-4 text-center text-gray-600">
										{it.quantity}
									</td>
									<td className="py-4 text-center text-gray-600">
										{Number(it.unit_price).toFixed(2)}
									</td>
									<td className="py-4 text-left font-bold text-gray-900">
										{formatCurrency(
											it.quantity * it.unit_price
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Totals */}
				<div className="flex justify-end mb-12">
					<div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
						<div className="flex justify-between text-gray-600">
							<span>المجموع الفرعي</span>
							<span className="font-medium">
								{formatCurrency(invoice.subtotal ?? 0)}
							</span>
						</div>
						<div className="flex justify-between text-gray-600">
							<span>الضريبة ({invoice.tax_rate ?? 0}%)</span>
							<span className="font-medium">
								{formatCurrency(invoice.vat_amount ?? 0)}
							</span>
						</div>
						<div className="border-t border-gray-200 my-2"></div>
						<div className="flex justify-between text-lg font-bold text-[#7f2dfb]">
							<span>الإجمالي</span>
							<span>
								{formatCurrency(invoice.total_amount ?? 0)}
							</span>
						</div>
					</div>
				</div>

				{/* Notes */}
				{invoice.notes && (
					<div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
						<span className="font-bold block mb-1">ملاحظات:</span>
						{invoice.notes}
					</div>
				)}
			</motion.div>
		</div>
	);
}
