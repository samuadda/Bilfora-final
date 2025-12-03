"use client";

import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import { InvoicePDF_Tax } from "./InvoicePDF_Tax";
import { InvoicePDF_Simplified } from "./InvoicePDF_Simplified";
import { InvoicePDF_Regular } from "./InvoicePDF_Regular";
import { InvoicePDF_CreditNote } from "./InvoicePDF_CreditNote";

interface SellerInfo {
	name: string;
	crNumber: string;
	vatNumber: string;
	address: string;
}

interface InvoicePDFRendererProps {
	invoice: InvoiceWithClientAndItems;
	client: Client | null;
	items: InvoiceItem[];
	qrDataUrl?: string | null;
	sellerInfo: SellerInfo;
}

export function InvoicePDFRenderer({
	invoice,
	client,
	items,
	qrDataUrl,
	sellerInfo,
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
				sellerInfo={sellerInfo}
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
				sellerInfo={sellerInfo}
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
				sellerInfo={sellerInfo}
			/>
		);
	}

	// Regular (non-tax) invoice
	return (
		<InvoicePDF_Regular
			invoice={invoice}
			client={client}
			items={items}
			sellerInfo={sellerInfo}
		/>
	);
}

