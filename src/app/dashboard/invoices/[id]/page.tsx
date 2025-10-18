"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, FileText } from "lucide-react";
import {
	PDFDownloadLink,
	Page,
	Text,
	View,
	Document,
	StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
		fontSize: 12,
		fontFamily: "Helvetica",
		lineHeight: 1.4,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 30,
		paddingBottom: 20,
		borderBottomWidth: 2,
		borderBottomColor: "#8B5CF6",
	},
	logoSection: {
		flexDirection: "column",
		alignItems: "flex-start",
	},
	companyName: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#8B5CF6",
		marginBottom: 5,
	},
	companyInfo: {
		fontSize: 10,
		color: "#666666",
		lineHeight: 1.3,
	},
	invoiceInfo: {
		flexDirection: "column",
		alignItems: "flex-end",
	},
	invoiceTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 10,
	},
	invoiceDetails: {
		fontSize: 11,
		color: "#374151",
		lineHeight: 1.4,
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 10,
		backgroundColor: "#F3F4F6",
		padding: 8,
		borderRadius: 4,
	},
	clientInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "#F9FAFB",
		padding: 15,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	clientDetails: {
		flexDirection: "column",
		alignItems: "flex-start",
	},
	table: {
		width: "100%",
		marginTop: 20,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#8B5CF6",
		borderRadius: 6,
		marginBottom: 5,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
		paddingVertical: 8,
	},
	tableHeaderCell: {
		flex: 1,
		padding: 10,
		fontWeight: "bold",
		color: "#FFFFFF",
		textAlign: "center",
		fontSize: 11,
	},
	tableCell: {
		flex: 1,
		padding: 10,
		textAlign: "center",
		fontSize: 11,
		color: "#374151",
	},
	descriptionCell: {
		flex: 2,
		padding: 10,
		textAlign: "right",
		fontSize: 11,
		color: "#374151",
	},
	totalsSection: {
		marginTop: 20,
		alignItems: "flex-end",
	},
	totalsTable: {
		width: 300,
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 6,
		paddingHorizontal: 10,
	},
	totalLabel: {
		fontSize: 11,
		color: "#6B7280",
	},
	totalValue: {
		fontSize: 11,
		fontWeight: "bold",
		color: "#374151",
	},
	finalTotal: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 10,
		paddingHorizontal: 15,
		backgroundColor: "#8B5CF6",
		borderRadius: 6,
		marginTop: 5,
	},
	finalTotalLabel: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	finalTotalValue: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	footer: {
		marginTop: 40,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		alignItems: "center",
	},
	footerText: {
		fontSize: 10,
		color: "#9CA3AF",
		textAlign: "center",
	},
	notes: {
		marginTop: 20,
		padding: 15,
		backgroundColor: "#FEF3C7",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#F59E0B",
	},
	notesText: {
		fontSize: 11,
		color: "#92400E",
		lineHeight: 1.4,
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
		return new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ar-SA");
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.logoSection}>
						<Text style={styles.companyName}>شركة بيلفورا</Text>
						<View style={styles.companyInfo}>
							<Text>الرياض، المملكة العربية السعودية</Text>
							<Text>البريد الإلكتروني: info@bilfora.com</Text>
							<Text>الهاتف: +966 50 123 4567</Text>
							<Text>الرقم الضريبي: 123456789012345</Text>
						</View>
					</View>
					<View style={styles.invoiceInfo}>
						<Text style={styles.invoiceTitle}>فاتورة</Text>
						<View style={styles.invoiceDetails}>
							<Text>
								رقم الفاتورة:{" "}
								{invoice?.invoice_number || invoice?.id}
							</Text>
							<Text>
								تاريخ الإصدار: {formatDate(invoice?.issue_date)}
							</Text>
							<Text>
								تاريخ الاستحقاق: {formatDate(invoice?.due_date)}
							</Text>
							<Text>
								الحالة:{" "}
								{invoice?.status === "draft"
									? "مسودة"
									: invoice?.status === "sent"
									? "مرسلة"
									: invoice?.status === "paid"
									? "مدفوعة"
									: "ملغية"}
							</Text>
						</View>
					</View>
				</View>

				{/* Client Information */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>معلومات العميل</Text>
					<View style={styles.clientInfo}>
						<View style={styles.clientDetails}>
							<Text
								style={{
									fontWeight: "bold",
									fontSize: 13,
									marginBottom: 5,
								}}
							>
								{client?.name}
							</Text>
							<Text>
								البريد الإلكتروني: {client?.email || "-"}
							</Text>
							<Text>الهاتف: {client?.phone || "-"}</Text>
							{client?.company_name && (
								<Text>الشركة: {client.company_name}</Text>
							)}
						</View>
					</View>
				</View>

				{/* Items Table */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>تفاصيل الفاتورة</Text>
					<View style={styles.table}>
						<View style={styles.tableHeader}>
							<Text style={[styles.tableHeaderCell, { flex: 2 }]}>
								الوصف
							</Text>
							<Text style={styles.tableHeaderCell}>الكمية</Text>
							<Text style={styles.tableHeaderCell}>السعر</Text>
							<Text style={styles.tableHeaderCell}>الإجمالي</Text>
						</View>
						{items.map((it: any, i: number) => (
							<View style={styles.tableRow} key={i}>
								<Text style={styles.descriptionCell}>
									{it.description}
								</Text>
								<Text style={styles.tableCell}>
									{it.quantity}
								</Text>
								<Text style={styles.tableCell}>
									{formatCurrency(Number(it.unit_price))}
								</Text>
								<Text style={styles.tableCell}>
									{formatCurrency(
										it.quantity * it.unit_price
									)}
								</Text>
							</View>
						))}
					</View>
				</View>

				{/* Totals */}
				<View style={styles.totalsSection}>
					<View style={styles.totalsTable}>
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

				{/* Notes */}
				{invoice?.notes && (
					<View style={styles.notes}>
						<Text style={styles.notesText}>
							<Text style={{ fontWeight: "bold" }}>
								ملاحظات:{" "}
							</Text>
							{invoice.notes}
						</Text>
					</View>
				)}

				{/* Footer */}
				<View style={styles.footer}>
					<Text style={styles.footerText}>
						شكراً لتعاملكم معنا • للاستفسارات يرجى التواصل معنا
					</Text>
					<Text style={styles.footerText}>
						هذه الفاتورة تم إنشاؤها تلقائياً من نظام بيلفورا
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

	if (loading) {
		return (
			<div className="p-6">
				<Loader2 className="animate-spin" />
			</div>
		);
	}
	if (!invoice)
		return <div className="p-6 text-red-600">الفاتورة غير موجودة</div>;

	const pdfDoc = (
		<InvoicePDF invoice={invoice} client={client} items={items} />
	);

	return (
		<div className="p-4 md:p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">
					فاتورة رقم {invoice.invoice_number || invoice.id}
				</h1>
				<PDFDownloadLink
					document={pdfDoc}
					fileName={`invoice-${
						invoice.invoice_number || invoice.id
					}.pdf`}
				>
					{({ loading }) => (
						<button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
							<FileText size={16} />
							{loading ? "جاري التحضير..." : "تحميل الفاتورة PDF"}
						</button>
					)}
				</PDFDownloadLink>
			</div>

			{/* Basic HTML view */}
			<div className="rounded-xl border p-4 bg-white">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
					<div>
						<span className="text-gray-600">العميل:</span>{" "}
						{client?.name}
					</div>
					<div>
						<span className="text-gray-600">البريد:</span>{" "}
						{client?.email || "-"}
					</div>
					<div>
						<span className="text-gray-600">الهاتف:</span>{" "}
						{client?.phone || "-"}
					</div>
				</div>
				<div className="mt-4">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-right text-gray-600">
								<th className="py-2">الوصف</th>
								<th className="py-2">الكمية</th>
								<th className="py-2">السعر</th>
								<th className="py-2">الإجمالي</th>
							</tr>
						</thead>
						<tbody>
							{items.map((it, i) => (
								<tr key={i} className="border-t">
									<td className="py-2">{it.description}</td>
									<td className="py-2">{it.quantity}</td>
									<td className="py-2">
										{Number(it.unit_price).toFixed(2)}
									</td>
									<td className="py-2">
										{(it.quantity * it.unit_price).toFixed(
											2
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="bg-gray-50 rounded-xl p-3">
							المجموع الفرعي: {(invoice.subtotal ?? 0).toFixed(2)}
						</div>
						<div className="bg-gray-50 rounded-xl p-3">
							الضريبة ({invoice.tax_rate ?? 0}%):{" "}
							{(invoice.vat_amount ?? 0).toFixed(2)}
						</div>
						<div className="bg-purple-50 rounded-xl p-3 font-semibold">
							الإجمالي: {(invoice.total_amount ?? 0).toFixed(2)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
