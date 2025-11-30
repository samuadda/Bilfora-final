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
// Register Markazi font (safer with react-pdf)
try {
  Font.register({
    family: "Markazi",
    fonts: [
      {
        src: "/fonts/markazi/MarkaziText-Regular.ttf",
        fontWeight: "normal",
      },
      {
        src: "/fonts/markazi/MarkaziText-Bold.ttf",
        fontWeight: "bold",
      },
    ],
  });
} catch (err) {
  console.warn("Failed to register Markazi font for PDF:", err);
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 32,
    fontSize: 11,
    fontFamily: "Markazi",
    lineHeight: 1.6,
    direction: "rtl",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: "#7f2dfb",
  },
  logoSection: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "50%",
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: "#7f2dfb",
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#012d46",
    marginBottom: 6,
  },
  companyInfo: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
    marginTop: 2,
  },
  companyInfoRow: {
    marginBottom: 2,
  },
  invoiceInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
    width: "45%",
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#012d46",
    marginBottom: 10,
  },
  invoiceDetails: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.7,
  },
  invoiceDetailRow: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#012d46",
    marginBottom: 10,
    backgroundColor: "#F7F7F7",
    padding: 8,
    borderRadius: 6,
    textAlign: "right",
  },
  clientInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 6,
  },
  clientDetails: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  clientName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#012d46",
    marginBottom: 6,
  },
  clientDetailRow: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 3,
    lineHeight: 1.5,
  },
  table: {
    width: "100%",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7f2dfb",
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 8,
  },
  tableRowZebra: {
    backgroundColor: "#FAFAFA",
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 8,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "right",
    fontSize: 10,
  },
  tableHeaderCellCenter: {
    textAlign: "center",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    textAlign: "right",
    fontSize: 10,
    color: "#374151",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellNumber: {
    textAlign: "left",
    direction: "ltr",
    fontSize: 10,
  },
  indexCell: {
    width: 24,
    textAlign: "center",
  },
  descriptionCell: {
    flex: 3,
    paddingHorizontal: 8,
    textAlign: "right",
    fontSize: 10,
    color: "#374151",
  },
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsCard: {
    width: 320,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "right",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "left",
    direction: "ltr",
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginVertical: 8,
  },
  finalTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#7f2dfb",
    borderRadius: 6,
    marginTop: 4,
  },
  finalTotalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  finalTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    direction: "ltr",
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  notes: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  notesText: {
    fontSize: 10,
    color: "#92400E",
    lineHeight: 1.5,
  },
  notesLabel: {
    fontWeight: "bold",
    marginBottom: 2,
  },
});

// ------- PDF component ----------

function InvoicePDF({ invoice, client, items }: any) {
  const taxRate = Number(invoice?.tax_rate || 0);

  const subtotal = items.reduce(
    (sum: number, it: any) =>
      sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );
  const vat = subtotal * (taxRate / 100);
  const total = subtotal + vat;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getStatusText = (status?: string) => {
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

  const s = (value: any) => {
    if (value === null || value === undefined) return " ";
    const str = String(value);
    return str === "" ? " " : str;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
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
              <Text style={styles.companyInfoRow}>الهاتف: +966 50 123 4567</Text>
              <Text style={styles.companyInfoRow}>
                الرقم الضريبي: 123456789012345
              </Text>
            </View>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>فاتورة ضريبية</Text>
            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceDetailRow}>
                رقم الفاتورة: {s(invoice?.invoice_number || invoice?.id)}
              </Text>
              <Text style={styles.invoiceDetailRow}>
                تاريخ الإصدار: {s(formatDate(invoice?.issue_date))}
              </Text>
              <Text style={styles.invoiceDetailRow}>
                تاريخ الاستحقاق: {s(formatDate(invoice?.due_date))}
              </Text>
              <Text style={styles.invoiceDetailRow}>
                الحالة: {s(getStatusText(invoice?.status))}
              </Text>
            </View>
          </View>
        </View>

        {/* Client info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.clientInfo}>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>
                {s(client?.name || "غير محدد")}
              </Text>
              {client?.company_name && (
                <Text style={styles.clientDetailRow}>
                  الشركة: {s(client.company_name)}
                </Text>
              )}
              <Text style={styles.clientDetailRow}>
                البريد الإلكتروني: {s(client?.email || "-")}
              </Text>
              <Text style={styles.clientDetailRow}>
                الهاتف: {s(client?.phone || "-")}
              </Text>
              {client?.tax_number && (
                <Text style={styles.clientDetailRow}>
                  الرقم الضريبي للعميل: {s(client.tax_number)}
                </Text>
              )}
              {client?.address && (
                <Text style={styles.clientDetailRow}>
                  العنوان: {s(client.address)}
                  {client?.city ? `، ${s(client.city)}` : ""}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الفاتورة</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.indexCell]}>#</Text>
              <Text
                style={[styles.tableHeaderCell, styles.descriptionCell]}
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
                سعر الوحدة (بدون ضريبة)
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.tableCellCenter,
                ]}
              >
                نسبة الضريبة
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.tableCellNumber,
                ]}
              >
                مبلغ الضريبة
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.tableCellNumber,
                ]}
              >
                الإجمالي (شامل الضريبة)
              </Text>
            </View>

            {items.map((it: any, i: number) => {
              const qty = Number(it.quantity) || 0;
              const unit = Number(it.unit_price) || 0;
              const lineNet = qty * unit;
              const lineVat = lineNet * (taxRate / 100);
              const lineTotal = lineNet + lineVat;

              return (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowZebra : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.indexCell]}>
                    {i + 1}
                  </Text>
                  <Text style={styles.descriptionCell}>
                    {s(it.description || "-")}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellCenter,
                    ]}
                  >
                    {s(qty)}
                  </Text>
                  <Text style={styles.tableCellNumber}>
                    {s(formatCurrency(unit))}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellCenter,
                    ]}
                  >
                    {taxRate ? `${taxRate}%` : "0%"}
                  </Text>
                  <Text style={styles.tableCellNumber}>
                    {s(formatCurrency(lineVat))}
                  </Text>
                  <Text style={styles.tableCellNumber}>
                    {s(formatCurrency(lineTotal))}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإجمالي</Text>
          <View style={styles.totalsSection}>
            <View style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  المجموع الفرعي (بدون ضريبة):
                </Text>
                <Text style={styles.totalValue}>
                  {s(formatCurrency(subtotal))}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  مجموع الضريبة ({taxRate || 0}%):
                </Text>
                <Text style={styles.totalValue}>
                  {s(formatCurrency(vat))}
                </Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.finalTotal}>
                <Text style={styles.finalTotalLabel}>الإجمالي المستحق:</Text>
                <Text style={styles.finalTotalValue}>
                  {s(formatCurrency(total))}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice?.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>ملاحظات:</Text>
            <Text style={styles.notesText}>{s(invoice.notes)}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            صُنعت هذه الفاتورة بواسطة منصة بيلفورة - النظام المعتمد
            لإصدار الفواتير الاحترافية.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ------- Page component ----------

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("invoices")
          .select(`
            *,
            client:clients(*),
            items:invoice_items(*)
          `)
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
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const taxRate = Number(invoice?.tax_rate || 0);
  const subtotal = items.reduce(
    (sum: number, it: any) =>
      sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );
  const vat = subtotal * (taxRate / 100);
  const total = subtotal + vat;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
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
            <h1 className="text-2xl md:text-3xl font-bold text-[#012d46]">
              فاتورة #{invoice.invoice_number || invoice.id}
            </h1>
            <div className="flex gap-3">
              <PDFDownloadLink
                document={<InvoicePDF invoice={invoice} client={client} items={items} />}
                fileName={`invoice-${invoice.invoice_number || invoice.id}.pdf`}
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
            </div>
          </div>
        </div>
        
        {/* Print Header */}
        <div className="print-header mb-6">
          <h1 className="text-2xl font-bold text-[#012d46] text-center mb-4">
            فاتورة #{invoice.invoice_number || invoice.id}
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
                  <span className="font-medium">رقم الفاتورة:</span>{" "}
                  {invoice.invoice_number || invoice.id}
                </p>
                <p>
                  <span className="font-medium">تاريخ الإصدار:</span>{" "}
                  {formatDate(invoice.issue_date)}
                </p>
                <p>
                  <span className="font-medium">تاريخ الاستحقاق:</span>{" "}
                  {formatDate(invoice.due_date)}
                </p>
                <p>
                  <span className="font-medium">الحالة:</span>{" "}
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
                <p className="font-medium text-[#012d46]">{client?.name || "-"}</p>
                {client?.company_name && <p>الشركة: {client.company_name}</p>}
                {client?.email && <p>البريد: {client.email}</p>}
                {client?.phone && <p>الهاتف: {client.phone}</p>}
                {client?.tax_number && <p>الرقم الضريبي: {client.tax_number}</p>}
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
                    <th className="p-3 text-right text-sm font-semibold">#</th>
                    <th className="p-3 text-right text-sm font-semibold">الوصف</th>
                    <th className="p-3 text-center text-sm font-semibold">الكمية</th>
                    <th className="p-3 text-left text-sm font-semibold">سعر الوحدة</th>
                    <th className="p-3 text-center text-sm font-semibold">نسبة الضريبة</th>
                    <th className="p-3 text-left text-sm font-semibold">مبلغ الضريبة</th>
                    <th className="p-3 text-left text-sm font-semibold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => {
                    const qty = Number(item.quantity) || 0;
                    const unit = Number(item.unit_price) || 0;
                    const lineNet = qty * unit;
                    const lineVat = lineNet * (taxRate / 100);
                    const lineTotal = lineNet + lineVat;

                    return (
                      <tr
                        key={item.id || index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-3 text-right text-sm">{index + 1}</td>
                        <td className="p-3 text-right text-sm">{item.description || "-"}</td>
                        <td className="p-3 text-center text-sm">{qty}</td>
                        <td className="p-3 text-left text-sm">{formatCurrency(unit)}</td>
                        <td className="p-3 text-center text-sm">{taxRate}%</td>
                        <td className="p-3 text-left text-sm">{formatCurrency(lineVat)}</td>
                        <td className="p-3 text-left text-sm font-medium">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="totals-section w-full md:w-96 space-y-2 p-4 rounded-lg">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي (بدون ضريبة):</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>مجموع الضريبة ({taxRate}%):</span>
                <span className="font-medium">{formatCurrency(vat)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-[#012d46]">
                  <span>الإجمالي المستحق:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">ملاحظات:</h4>
              <p className="text-yellow-800 text-sm">{invoice.notes}</p>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </>
  );
}