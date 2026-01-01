create extension if not exists "pgcrypto";

create table if not exists public.invoice_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seller_name text not null,
  vat_number text not null,
  cr_number text,
  address_line1 text,
  city text,
  logo_url text,
  iban text,
  invoice_footer text,
  default_vat_rate numeric(6,4) not null default 0.15,
  currency text not null default 'SAR',
  timezone text not null default 'Asia/Riyadh',
  numbering_prefix text not null default 'BLF-',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists invoice_settings_user_id_idx
  on public.invoice_settings(user_id);

create or replace function public.handle_invoice_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists handle_invoice_settings_updated_at on public.invoice_settings;
create trigger handle_invoice_settings_updated_at
before update on public.invoice_settings
for each row
execute procedure public.handle_invoice_settings_updated_at();

alter table public.invoice_settings enable row level security;

drop policy if exists "invoice_settings_select_own" on public.invoice_settings;
create policy "invoice_settings_select_own"
  on public.invoice_settings
  for select
  using (auth.uid() = user_id);

drop policy if exists "invoice_settings_insert_own" on public.invoice_settings;
create policy "invoice_settings_insert_own"
  on public.invoice_settings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "invoice_settings_update_own" on public.invoice_settings;
create policy "invoice_settings_update_own"
  on public.invoice_settings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "invoice_settings_delete_own" on public.invoice_settings;
create policy "invoice_settings_delete_own"
  on public.invoice_settings
  for delete
  using (auth.uid() = user_id);

