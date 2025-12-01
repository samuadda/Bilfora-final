-- Add optional category and sku fields to products
alter table products
  add column if not exists category text null,
  add column if not exists sku text null;


