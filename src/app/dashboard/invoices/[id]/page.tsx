import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import InvoiceDetailClient from "./InvoiceDetailClient";
import { getInvoiceSettings } from "@/features/settings/data/settings.repo";
import type { Client, InvoiceItem, InvoiceWithClientAndItems } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";

export default async function InvoiceDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		notFound();
	}

	const { data: invoiceData, error } = await supabase
		.from("invoices")
		.select(
			`
            *,
            client:clients(*),
            items:invoice_items(*)
      `,
		)
		.eq("id", params.id)
		.eq("user_id", user.id)
		.single();

	if (error || !invoiceData) {
		notFound();
	}

	const invoice: InvoiceWithClientAndItems & { client: Client | null; items: InvoiceItem[] } = {
		...(invoiceData as InvoiceWithClientAndItems),
		client: (invoiceData as { client?: Client | null }).client ?? null,
		items: (invoiceData as { items?: InvoiceItem[] }).items ?? [],
	};

	const invoiceSettings: InvoiceSettings | null = await getInvoiceSettings(supabase, user.id);

	const isSettingsReady =
		Boolean(invoiceSettings?.seller_name) &&
		Boolean(invoiceSettings?.vat_number);

	return (
		<InvoiceDetailClient
			invoice={invoice}
			client={invoice.client}
			items={invoice.items}
			invoiceSettings={invoiceSettings}
			isSettingsReady={isSettingsReady}
		/>
	);
}
