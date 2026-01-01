alter table public.invoices
add column if not exists document_kind text not null default 'invoice';

alter table public.invoices
add constraint invoices_document_kind_check
check (document_kind in ('invoice', 'credit_note'));
