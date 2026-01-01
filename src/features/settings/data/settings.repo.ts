import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  invoiceSettingsInputSchema,
  invoiceSettingsSchema,
  InvoiceSettings,
  InvoiceSettingsInput,
} from '../schemas/invoiceSettings.schema';

type DbClient = SupabaseClient<Database>;
const TABLE = 'invoice_settings';

export async function getInvoiceSettings(
  supabase: DbClient,
  userId: string,
): Promise<InvoiceSettings | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return invoiceSettingsSchema.parse(data);
}

export async function upsertInvoiceSettings(
  supabase: DbClient,
  userId: string,
  payload: InvoiceSettingsInput,
): Promise<InvoiceSettings> {
  const validated = invoiceSettingsInputSchema.parse(payload);

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { ...validated, user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) throw error;
  return invoiceSettingsSchema.parse(data);
}

