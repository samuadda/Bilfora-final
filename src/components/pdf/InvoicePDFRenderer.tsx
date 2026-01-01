"use client";

import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";
import { InvoicePDF_Tax } from "./InvoicePDF_Tax";
import { InvoicePDF_Simplified } from "./InvoicePDF_Simplified";
import { InvoicePDF_Regular } from "./InvoicePDF_Regular";
import { InvoicePDF_CreditNote } from "./InvoicePDF_CreditNote";

interface InvoicePDFRendererProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	invoiceSettings: InvoiceSettings;
}

export function InvoicePDFRenderer({
	invoice,
	client,
	items,
	qrDataUrl,
	invoiceSettings,
}: InvoicePDFRendererProps) {
	// Handle migration from old "type" to new "invoice_type"
	const invoiceType =
		invoice.invoice_type ||
		((invoice as any).type === "standard_tax"
			? "standard"
			: (invoice as any).type === "simplified_tax"
			? "simplified"
			: (invoice as any).type === "non_tax"
			? "regular"
			: "standard");

	const documentKind = invoice.document_kind || "invoice";

	// Determine which template to use
	if (documentKind === "credit_note") {
		return (
			<InvoicePDF_CreditNote
				invoice={invoice}
				client={client}
				items={items}
				invoiceSettings={invoiceSettings}
				relatedInvoiceNumber={
					(invoice as any).related_invoice_id || invoice.invoice_number
				}
			/>
		);
	}

	if (invoiceType === "standard") {
		return (
			<InvoicePDF_Tax
				invoice={invoice}
				client={client}
				items={items}
				qrDataUrl={qrDataUrl}
				invoiceSettings={invoiceSettings}
			/>
		);
	}

	if (invoiceType === "simplified") {
		return (
			<InvoicePDF_Simplified
				invoice={invoice}
				client={client}
				items={items}
				qrDataUrl={qrDataUrl}
				invoiceSettings={invoiceSettings}
			/>
		);
	}

	// Regular (non-tax) invoice
	return (
		<InvoicePDF_Regular
			invoice={invoice}
			client={client}
			items={items}
			invoiceSettings={invoiceSettings}
		/>
	);
}

