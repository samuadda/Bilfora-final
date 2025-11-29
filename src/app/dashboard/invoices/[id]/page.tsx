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
