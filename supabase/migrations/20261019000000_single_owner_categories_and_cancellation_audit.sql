-- Migration: 20261019000000_single_owner_categories_and_cancellation_audit.sql
-- Description:
-- 1. Enforce strictly 1 active owner per shop (Single-Owner Governance)
-- 2. Add cancellation audit trail columns to orders (Soft-delete & reason tracking)
-- 3. Create shop_categories table for customizable product & service categories
-- 4. Set up Row Level Security (RLS) policies for owner vs staff capabilities

-- ============================================================================
-- 1. STRICT SINGLE OWNER CONSTRAINT
-- ============================================================================
-- Enforce that a shop can only have at most 1 active owner
create unique index if not exists idx_one_active_owner_per_shop
  on public.shop_members(shop_id)
  where role = 'owner' and is_active = true;

-- ============================================================================
-- 2. ORDER CANCELLATION AUDIT TRAIL
-- ============================================================================
alter table public.orders 
  add column if not exists is_cancelled boolean default false,
  add column if not exists cancelled_at timestamp with time zone,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists cancellation_reason text;

-- Index for querying active vs cancelled orders efficiently
create index if not exists idx_orders_cancellation
  on public.orders(shop_id, is_cancelled, created_at desc);

-- ============================================================================
-- 3. SHOP CATEGORIES & SERVICES (CUSTOMIZABLE)
-- ============================================================================
create table if not exists public.shop_categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  type text not null check (type in ('bouquet', 'fresh_flower', 'custom', 'accessory', 'service')),
  unit text not null default 'ชิ้น',
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create index if not exists idx_shop_categories_shop_id 
  on public.shop_categories(shop_id, is_active);

-- Enable RLS
alter table public.shop_categories enable row level security;

-- Policies for shop_categories
create policy "Staff and owners can view categories in their shop"
  on public.shop_categories for select
  using (
    exists (
      select 1 from public.shop_members
      where shop_members.shop_id = shop_categories.shop_id
        and shop_members.user_id = auth.uid()
        and shop_members.is_active = true
    )
  );

create policy "Only owners can insert/update/delete categories"
  on public.shop_categories for all
  using (
    exists (
      select 1 from public.shop_members
      where shop_members.shop_id = shop_categories.shop_id
        and shop_members.user_id = auth.uid()
        and shop_members.role = 'owner'
        and shop_members.is_active = true
    )
  );

-- ============================================================================
-- 4. ORDER DELETION / CANCELLATION RLS POLICIES
-- ============================================================================
-- Ensure that staff cannot permanently delete orders, only owner can hard delete
create policy "Only owner can hard delete orders"
  on public.orders for delete
  using (
    exists (
      select 1 from public.shop_members
      where shop_members.shop_id = orders.shop_id
        and shop_members.user_id = auth.uid()
        and shop_members.role = 'owner'
        and shop_members.is_active = true
    )
  );
