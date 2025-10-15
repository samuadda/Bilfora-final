-- Products / Services table and policies
-- Enable the uuid-ossp extension if it isn't already
 create extension if not exists "uuid-ossp";
 create extension if not exists "pgcrypto";

 create table if not exists products (
   id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text null,
  unit text null,
  unit_price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_user_id on products(user_id);
create index if not exists idx_products_active on products(active);

-- keep updated_at fresh
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_products_updated_at on products;
create trigger update_products_updated_at
before update on products
for each row execute function update_updated_at_column();

alter table products enable row level security;

do $$
begin
  if not exists(select 1 from pg_policies where tablename='products' and policyname='View own products') then
    create policy "View own products" on products for select using (auth.uid() = user_id);
  end if;

  if not exists(select 1 from pg_policies where tablename='products' and policyname='Insert own products') then
    create policy "Insert own products" on products for insert with check (auth.uid() = user_id);
  end if;

  if not exists(select 1 from pg_policies where tablename='products' and policyname='Update own products') then
    create policy "Update own products" on products for update using (auth.uid() = user_id);
  end if;

  if not exists(select 1 from pg_policies where tablename='products' and policyname='Delete own products') then
    create policy "Delete own products" on products for delete using (auth.uid() = user_id);
  end if;
end $$;


