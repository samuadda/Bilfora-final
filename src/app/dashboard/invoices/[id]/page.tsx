"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, FileText, Printer, ArrowLeft } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Link from "next/link";
import { motion } from "framer-motion";
import { InvoicePDFRenderer } from "@/components/pdf/InvoicePDFRenderer";
import { generateZatcaTLVBase64 } from "@/components/pdf/zatcaQr";
import { convertToHijri } from "@/lib/dateConvert";

// ------- Page component ----------

export default function InvoiceDetailPage() {
	const params = useParams();
	const invoiceId = params.id as string;
	const [invoice, setInvoice] = useState<any>(null);
	const [client, setClient] = useState<any>(null);
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

	useEffect(() => {
		const loadInvoice = async () => {
			try {
				setLoading(true);
				setError(null);

				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					return;
				}

				const { data, error: fetchError } = await supabase
					.from("invoices")
					.select(
						`
            *,
            client:clients(*),
            items:invoice_items(*)
          `
					)
					.eq("id", invoiceId)
					.eq("user_id", user.id)
					.single();

				if (fetchError) throw fetchError;

				if (data) {
					setInvoice(data);
					setClient(data.client);
					setItems(data.items || []);
				}
			} catch (err: any) {
				console.error("Error loading invoice:", err);
				setError(err.message || "حدث خطأ أثناء تحميل الفاتورة");
			} finally {
				setLoading(false);
			}
		};

		if (invoiceId) {
			loadInvoice();
		}
	}, [invoiceId]);

	// Generate QR code for tax invoices
	useEffect(() => {
		async function buildQr() {
			// Only run on client side
			if (typeof window === "undefined") return;
			if (!invoice) return;

			// Handle migration from old "type" to new "invoice_type"
			const invoiceType =
				invoice.invoice_type ||
				(invoice.type === "standard_tax"
					? "standard"
					: invoice.type === "simplified_tax"
					? "simplified"
					: invoice.type === "non_tax"
					? "regular"
					: "standard");

			if (invoiceType === "regular") {
				setQrDataUrl(null);
				return;
			}

			try {
				// Dynamic import of QRCode - only loads on client side
				const QRCode = (await import("qrcode")).default;

				const invoiceTotal = (invoice.total_amount ?? 0).toFixed(2);
				const vatTotal = (invoice.vat_amount ?? 0).toFixed(2);

				// TODO: Replace with real seller data from user profile/company settings
				const sellerInfo = {
					sellerName: "بيلفورة",
					vatNumber: "123456789000003",
					timestamp: new Date(invoice.issue_date).toISOString(),
					invoiceTotal,
					vatTotal,
				};

				const tlvBase64 = generateZatcaTLVBase64(sellerInfo);

				if (!tlvBase64) {
					setQrDataUrl(null);
					return;
				}

				const dataUrl = await QRCode.toDataURL(tlvBase64, {
					margin: 0,
				});
				setQrDataUrl(dataUrl);
			} catch (err) {
				console.error("Error generating QR code:", err);
				setQrDataUrl(null);
			}
		}

		buildQr();
	}, [invoice]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="w-8 h-8 animate-spin text-[#7f2dfb]" />
			</div>
		);
	}

	if (error || !invoice) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<FileText className="w-16 h-16 text-gray-400 mb-4" />
				<h2 className="text-xl font-semibold text-gray-800 mb-2">
					{error || "الفاتورة غير موجودة"}
				</h2>
				<Link
					href="/dashboard/invoices"
					className="mt-4 text-[#7f2dfb] hover:underline flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					العودة إلى قائمة الفواتير
				</Link>
			</div>
		);
	}

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);

	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-GB");
	};

	// Handle migration from old "type" to new "invoice_type"
	const invoiceType =
		invoice?.invoice_type ||
		(invoice?.type === "standard_tax"
			? "standard"
			: invoice?.type === "simplified_tax"
			? "simplified"
			: invoice?.type === "non_tax"
			? "regular"
			: "standard");
	const documentKind = invoice?.document_kind || "invoice";
	const isTax = invoiceType === "standard" || invoiceType === "simplified";
	const isRegular = invoiceType === "regular";
	const isCredit = documentKind === "credit_note";

	const taxRate = isRegular ? 0 : Number(invoice?.tax_rate || 0);
	const subtotal = items.reduce(
		(sum: number, it: any) =>
			sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
		0
	);
	const vat = isRegular ? 0 : subtotal * (taxRate / 100);
	const total = isCredit ? -(subtotal + vat) : subtotal + vat;

	const getTitle = () => {
		if (isCredit) return "إشعار دائن";
		if (invoiceType === "standard") return "فاتورة ضريبية";
		if (invoiceType === "simplified") return "فاتورة ضريبية مبسطة";
		return "فاتورة";
	};

	// Seller info (TODO: Replace with real data from user profile/company settings)
	const sellerInfo = {
		name: "بيلفورة",
		crNumber: "1234567890",
		vatNumber: "123456789000003",
		address: "الرياض، المملكة العربية السعودية",
	};

	// Build PDF document using renderer
	let pdfDoc: React.ReactElement | null = null;
	if (invoice) {
		pdfDoc = (
			<InvoicePDFRenderer
				invoice={invoice as any}
				client={client}
				items={items}
				qrDataUrl={qrDataUrl}
				sellerInfo={sellerInfo}
			/>
		) as React.ReactElement;
	}

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @media print {
          body {
            background: white !important;
          }
          
          /* Hide navigation and buttons when printing */
          a[href="/dashboard/invoices"],
          button,
          .no-print {
            display: none !important;
          }
          
          /* Remove background colors and shadows for print */
          .print-invoice {
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
            margin: 0 !important;
          }
          
          /* Ensure proper page breaks */
          .print-invoice {
            page-break-inside: avoid;
          }
          
          /* Table styling for print */
          .print-invoice table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          .print-invoice table thead {
            background: #7f2dfb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print-invoice table th {
            background: #7f2dfb !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
            padding: 12px !important;
            border: 1px solid #6a1fd8 !important;
          }
          
          .print-invoice table td {
            padding: 10px !important;
            border: 1px solid #e5e7eb !important;
          }
          
          .print-invoice table tbody tr {
            border-bottom: 1px solid #e5e7eb !important;
          }
          
          /* Ensure text is readable for print */
          .print-invoice h1,
          .print-invoice h2,
          .print-invoice h3 {
            color: #012d46 !important;
          }
          
          /* Totals section */
          .print-invoice .totals-section {
            background: white !important;
            border: 1px solid #e5e7eb !important;
          }
          
          /* Remove animations and transitions */
          * {
            animation: none !important;
            transition: none !important;
          }
          
          /* Page setup */
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Ensure full width */
          .print-invoice {
            max-width: 100% !important;
            width: 100% !important;
          }
          
          /* Show print header only when printing */
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
          }
        }
        
        /* Hide print header on screen */
        .print-header {
          display: none;
        }
      `,
				}}
			/>
			<div className="min-h-screen bg-gray-50 p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="mb-6 no-print">
						<Link
							href="/dashboard/invoices"
							className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7f2dfb] transition-colors mb-4"
						>
							<ArrowLeft className="w-4 h-4" />
							العودة إلى قائمة الفواتير
						</Link>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<div className="flex items-center gap-3 mb-2">
									<h1 className="text-2xl md:text-3xl font-bold text-[#012d46]">
										{getTitle()} #
										{invoice.invoice_number || invoice.id}
									</h1>
									{(() => {
										if (invoiceType === "standard") {
											return (
												<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
													فاتورة ضريبية
												</span>
											);
										}
										if (invoiceType === "simplified") {
											return (
												<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
													فاتورة ضريبية مبسطة
												</span>
											);
										}
										return (
											<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
												فاتورة عادية
											</span>
										);
									})()}
								</div>
								{isCredit && invoice?.related_invoice_id && (
									<p className="text-sm text-gray-500 mt-1">
										هذا إشعار دائن متعلق بالفاتورة رقم{" "}
										{invoice.invoice_number || invoice.id}
									</p>
								)}
							</div>
							<div className="flex gap-3">
								{pdfDoc ? (
									<PDFDownloadLink
										document={pdfDoc}
										fileName={`invoice-${
											invoice.invoice_number || invoice.id
										}.pdf`}
										className="inline-flex items-center gap-2 px-4 py-2 bg-[#7f2dfb] text-white rounded-lg hover:bg-[#6b1fd9] transition-colors"
									>
										{({ loading: pdfLoading }) =>
											pdfLoading ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													جاري التحميل...
												</>
											) : (
												<>
													<Printer className="w-4 h-4" />
													تحميل PDF
												</>
											)
										}
									</PDFDownloadLink>
								) : (
									<button
										disabled
										className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
									>
										<Loader2 className="w-4 h-4 animate-spin" />
										جاري التحميل...
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Print Header */}
					<div className="print-header mb-6">
						<h1 className="text-2xl font-bold text-[#012d46] text-center mb-4">
							{getTitle()} #{invoice.invoice_number || invoice.id}
						</h1>
					</div>

					{/* Invoice Details */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="print-invoice bg-white rounded-lg shadow-sm p-6 md:p-8"
					>
						{/* Invoice Info */}
						<div className="grid md:grid-cols-2 gap-6 mb-8">
							<div>
								<h3 className="text-lg font-semibold text-[#012d46] mb-4">
									معلومات الفاتورة
								</h3>
								<div className="space-y-2 text-gray-600">
									<p>
										<span className="font-medium">
											رقم الفاتورة:
										</span>{" "}
										{invoice.invoice_number || invoice.id}
									</p>
									<p>
										<span className="font-medium">
											تاريخ الإصدار:
										</span>{" "}
										<div className="flex flex-col gap-0.5 mt-1">
											<span>{formatDate(invoice.issue_date)}</span>
											{invoice.issue_date && (
												<span className="text-gray-500 text-xs">
													الموافق: {convertToHijri(invoice.issue_date).formattedHijri}
												</span>
											)}
										</div>
									</p>
									<p>
										<span className="font-medium">
											تاريخ الاستحقاق:
										</span>{" "}
										<div className="flex flex-col gap-0.5 mt-1">
											<span>{formatDate(invoice.due_date)}</span>
											{invoice.due_date && (
												<span className="text-gray-500 text-xs">
													الموافق: {convertToHijri(invoice.due_date).formattedHijri}
												</span>
											)}
										</div>
									</p>
									<p>
										<span className="font-medium">
											الحالة:
										</span>{" "}
										<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
											{invoice.status}
										</span>
									</p>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#012d46] mb-4">
									معلومات العميل
								</h3>
								<div className="space-y-2 text-gray-600">
									<p className="font-medium text-[#012d46]">
										{client?.name || "-"}
									</p>
									{client?.company_name && (
										<p>الشركة: {client.company_name}</p>
									)}
									{client?.email && (
										<p>البريد: {client.email}</p>
									)}
									{client?.phone && (
										<p>الهاتف: {client.phone}</p>
									)}
									{client?.tax_number && (
										<p>
											الرقم الضريبي: {client.tax_number}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Items Table */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold text-[#012d46] mb-4">
								تفاصيل الفاتورة
							</h3>
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-[#7f2dfb] text-white">
											<th className="p-3 text-right text-sm font-semibold">
												#
											</th>
											<th className="p-3 text-right text-sm font-semibold">
												الوصف
											</th>
											<th className="p-3 text-center text-sm font-semibold">
												الكمية
											</th>
											<th className="p-3 text-left text-sm font-semibold">
												سعر الوحدة{" "}
												{isTax ? "(بدون ضريبة)" : ""}
											</th>
											{isTax && (
												<>
													<th className="p-3 text-center text-sm font-semibold">
														نسبة الضريبة
													</th>
													<th className="p-3 text-left text-sm font-semibold">
														مبلغ الضريبة
													</th>
												</>
											)}
											<th className="p-3 text-left text-sm font-semibold">
												الإجمالي{" "}
												{isTax ? "(شامل الضريبة)" : ""}
											</th>
										</tr>
									</thead>
									<tbody>
										{items.map(
											(item: any, index: number) => {
												const qty =
													Number(item.quantity) || 0;
												const unit =
													Number(item.unit_price) ||
													0;
												const lineNet = qty * unit;
												const lineVat = isRegular
													? 0
													: lineNet * (taxRate / 100);
												const lineTotal = isCredit
													? -(lineNet + lineVat)
													: lineNet + lineVat;

												return (
													<tr
														key={item.id || index}
														className="border-b border-gray-200 hover:bg-gray-50"
													>
														<td className="p-3 text-right text-sm">
															{index + 1}
														</td>
														<td className="p-3 text-right text-sm">
															{item.description ||
																"-"}
														</td>
														<td className="p-3 text-center text-sm">
															{qty}
														</td>
														<td className="p-3 text-left text-sm">
															{formatCurrency(
																unit
															)}
														</td>
														{isTax && (
															<>
																<td className="p-3 text-center text-sm">
																	{taxRate}%
																</td>
																<td className="p-3 text-left text-sm">
																	{formatCurrency(
																		lineVat
																	)}
																</td>
															</>
														)}
														<td className="p-3 text-left text-sm font-medium">
															{formatCurrency(
																lineTotal
															)}
														</td>
													</tr>
												);
											}
										)}
									</tbody>
								</table>
							</div>
						</div>

						{/* Totals */}
						<div className="flex justify-end">
							<div className="totals-section w-full md:w-96 space-y-2 p-4 rounded-lg">
								{isTax ? (
									<>
										<div className="flex justify-between text-gray-600">
											<span>
												المجموع الفرعي (بدون ضريبة):
											</span>
											<span className="font-medium">
												{formatCurrency(subtotal)}
											</span>
										</div>
										<div className="flex justify-between text-gray-600">
											<span>
												مجموع الضريبة ({taxRate}%):
											</span>
											<span className="font-medium">
												{formatCurrency(vat)}
											</span>
										</div>
										<div className="border-t border-gray-300 pt-2 mt-2">
											<div className="flex justify-between text-lg font-bold text-[#012d46]">
												<span>
													{isCredit
														? "إشعار دائن:"
														: "الإجمالي المستحق:"}
												</span>
												<span>
													{formatCurrency(total)}
												</span>
											</div>
										</div>
									</>
								) : (
									<div className="flex justify-between text-lg font-bold text-[#012d46]">
										<span>
											{isCredit
												? "إشعار دائن:"
												: "المجموع:"}
										</span>
										<span>{formatCurrency(total)}</span>
									</div>
								)}
							</div>
						</div>

						{/* Notes */}
						{invoice.notes && (
							<div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<h4 className="font-semibold text-yellow-900 mb-2">
									ملاحظات:
								</h4>
								<p className="text-yellow-800 text-sm">
									{invoice.notes}
								</p>
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</>
	);
}
