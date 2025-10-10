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
	page: { padding: 24, fontSize: 12, fontFamily: "Helvetica" },
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	title: { fontSize: 18, marginBottom: 12 },
	section: { marginBottom: 10, borderBottom: 1, paddingBottom: 6 },
	tableHeader: {
		flexDirection: "row",
		fontWeight: "bold",
		marginTop: 6,
		marginBottom: 4,
	},
	cell: { flex: 1 },
});

function InvoicePDF({ invoice, client, items }: any) {
	const subtotal = items.reduce(
		(s: number, it: any) => s + it.quantity * it.unit_price,
		0
	);
	const vat = subtotal * ((invoice?.tax_rate || 0) / 100);
	const total = subtotal + vat;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>
					فاتورة رقم {invoice?.invoice_number || invoice?.id}
				</Text>

				<View style={styles.section}>
					<View style={styles.row}>
						<Text>العميل: {client?.name}</Text>
						<Text>
							التاريخ: {invoice?.issue_date?.slice(0, 10)}
						</Text>
					</View>
					<View style={styles.row}>
						<Text>البريد: {client?.email || "-"}</Text>
						<Text>الهاتف: {client?.phone || "-"}</Text>
					</View>
				</View>

				<View style={styles.tableHeader}>
					<Text style={[styles.cell, { flex: 2 }]}>الوصف</Text>
					<Text style={styles.cell}>الكمية</Text>
					<Text style={styles.cell}>السعر</Text>
					<Text style={styles.cell}>الإجمالي</Text>
				</View>
				{items.map((it: any, i: number) => (
					<View style={styles.row} key={i}>
						<Text style={[styles.cell, { flex: 2 }]}>
							{it.description}
						</Text>
						<Text style={styles.cell}>{it.quantity}</Text>
						<Text style={styles.cell}>
							{Number(it.unit_price).toFixed(2)}
						</Text>
						<Text style={styles.cell}>
							{(it.quantity * it.unit_price).toFixed(2)}
						</Text>
					</View>
				))}

				<View style={{ marginTop: 12 }}>
					<View style={styles.row}>
						<Text>المجموع الفرعي</Text>
						<Text>{subtotal.toFixed(2)}</Text>
					</View>
					<View style={styles.row}>
						<Text>الضريبة ({invoice?.tax_rate || 0}%)</Text>
						<Text>{vat.toFixed(2)}</Text>
					</View>
					<View style={styles.row}>
						<Text>الإجمالي</Text>
						<Text>{total.toFixed(2)}</Text>
					</View>
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
