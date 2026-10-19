-- ==============================================================================
-- FLOWER SHOP MANAGEMENT SYSTEM (ระบบร้านดอกไม้)
-- Initial Database Migration Schema
-- Compatible with Supabase / PostgreSQL 15+
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TABLES DEFINITION
-- ==============================================================================

-- 1.1 ร้านค้า (Shops)
create table if not exists public.shops (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text,
    promptpay_number text,
    address text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 1.2 สมาชิกและพนักงานในร้าน (Shop Members)
create table if not exists public.shop_members (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'staff')),
    display_name text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_shop_user unique (shop_id, user_id)
);

-- 1.3 ลูกค้า (Customers)
create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    name text not null,
    phone text,
    note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_customers_shop_phone on public.customers(shop_id, phone);

-- 1.4 แคตตาล็อกสินค้าและดอกไม้ (Products)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    name text not null,
    type text not null check (type in ('bouquet', 'fresh_flower', 'custom', 'accessory')),
    size text, -- S, M, L, XL, Standard
    unit text not null default 'ช่อ', -- ช่อ, ดอก, ก้าน, กำ, แจกัน, กล่อง
    price numeric(12, 2) not null check (price >= 0),
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_products_shop_active on public.products(shop_id, is_active);

-- 1.5 ออเดอร์ (Orders)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    order_no text not null, -- Format เช่น 261015-001
    customer_id uuid references public.customers(id) on delete set null,
    channel text not null check (channel in ('walk_in', 'line', 'facebook', 'instagram', 'phone', 'other')),
    order_type text not null check (order_type in ('walk_in', 'chat')),
    fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
    fulfillment_status text not null default 'new' check (fulfillment_status in ('new', 'arranging', 'ready', 'done', 'cancelled')),
    payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
    
    subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
    discount numeric(12, 2) not null default 0 check (discount >= 0),
    delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
    total numeric(12, 2) not null default 0 check (total >= 0),
    
    due_at timestamptz not null, -- วันและเวลานัดรับหรือส่ง
    recipient_name text,
    recipient_phone text,
    address text,
    card_message text, -- ข้อความในการ์ดอวยพร
    note text, -- โน้ตเพิ่มเติม เช่น โทนสี ริบบิ้น ดอกไม้ที่ห้ามใส่
    
    created_by uuid references auth.users(id) on delete set null,
    arranged_by uuid references auth.users(id) on delete set null,
    delivered_by uuid references auth.users(id) on delete set null,
    
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_shop_order_no unique (shop_id, order_no)
);
create index if not exists idx_orders_shop_due on public.orders(shop_id, due_at);
create index if not exists idx_orders_shop_status on public.orders(shop_id, fulfillment_status, payment_status);

-- 1.6 รายการสินค้าในออเดอร์ (Order Items)
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    name_snapshot text not null, -- บันทึกชื่อสินค้าตอนสั่ง ป้องกันราคา/ชื่อเปลี่ยนย้อนหลัง
    qty integer not null default 1 check (qty > 0),
    unit_price numeric(12, 2) not null check (unit_price >= 0),
    total_price numeric(12, 2) generated always as (qty * unit_price) stored,
    note text,
    created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- 1.7 เงินเข้า / การชำระเงิน (Payments)
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    amount numeric(12, 2) not null check (amount > 0),
    method text not null check (method in ('cash', 'promptpay', 'transfer', 'card', 'other')),
    paid_at timestamptz not null default now(),
    received_by uuid references auth.users(id) on delete set null,
    slip_url text,
    note text,
    created_at timestamptz not null default now()
);
create index if not exists idx_payments_shop_paid on public.payments(shop_id, paid_at);
create index if not exists idx_payments_order on public.payments(order_id);

-- 1.8 รายจ่ายของร้าน (Expenses)
create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    category text not null check (category in (
        'flower_stock',   -- ซื้อดอกไม้สด / ดอกไม้ประดิษฐ์
        'accessories',    -- กระดาษห่อ โบว์ ริบบิ้น โอเอซิส ตะกร้า แจกัน
        'packaging',      -- ถุง กล่อง การ์ด สติกเกอร์
        'transportation', -- ค่าน้ำมัน ค่าจ้างส่ง Grab/Lineman
        'utilities',      -- ค่าน้ำ ค่าไฟ ค่าเช่าที่ ค่าอินเทอร์เน็ต
        'wage',           -- ค่าจ้างพนักงานรายวัน/พิเศษ
        'other'           -- อื่นๆ
    )),
    amount numeric(12, 2) not null check (amount > 0),
    method text not null check (method in ('cash', 'promptpay', 'transfer', 'card', 'other')),
    spent_at timestamptz not null default now(),
    note text,
    receipt_url text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_expenses_shop_spent on public.expenses(shop_id, spent_at);

-- 1.9 ประวัติการเปลี่ยนแปลง (Order Logs)
create table if not exists public.order_logs (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    actor_id uuid references auth.users(id) on delete set null,
    action text not null, -- fulfillment_status, payment_status, payment_added, note_updated
    from_value text,
    to_value text,
    note text,
    created_at timestamptz not null default now()
);
create index if not exists idx_order_logs_order on public.order_logs(order_id, created_at desc);

-- 1.10 ไฟล์แนบ (Attachments)
create table if not exists public.attachments (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    kind text not null check (kind in ('bouquet_preview', 'slip', 'chat_screenshot', 'receipt', 'delivery_proof')),
    url text not null,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);
create index if not exists idx_attachments_order on public.attachments(order_id);

-- ==============================================================================
-- 2. HELPER FUNCTIONS & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- ตรวจสอบว่าเป็นสมาชิกที่ active ของร้านหรือไม่
create or replace function public.is_member(s uuid) 
returns boolean 
language sql 
security definer 
set search_path = public
as $$
    select exists(
        select 1 from public.shop_members
        where shop_id = s 
          and user_id = auth.uid() 
          and is_active = true
    );
$$;

-- ตรวจสอบว่าเป็นเจ้าของร้าน (Owner) ที่ active หรือไม่
create or replace function public.is_owner(s uuid) 
returns boolean 
language sql 
security definer 
set search_path = public
as $$
    select exists(
        select 1 from public.shop_members
        where shop_id = s 
          and user_id = auth.uid() 
          and role = 'owner'
          and is_active = true
    );
$$;

-- เปิดใช้งาน RLS บนทุกตาราง
alter table public.shops enable row level security;
alter table public.shop_members enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.order_logs enable row level security;
alter table public.attachments enable row level security;

-- 2.1 Policies: shops
create policy "member read shop" on public.shops
    for select using (public.is_member(id));

create policy "owner update shop" on public.shops
    for update using (public.is_owner(id));

-- 2.2 Policies: shop_members
create policy "member read coworkers" on public.shop_members
    for select using (public.is_member(shop_id));

create policy "owner manage members" on public.shop_members
    for all using (public.is_owner(shop_id));

-- 2.3 Policies: customers
create policy "member read customers" on public.customers
    for select using (public.is_member(shop_id));

create policy "member write customers" on public.customers
    for insert with check (public.is_member(shop_id));

create policy "member update customers" on public.customers
    for update using (public.is_member(shop_id));

create policy "owner delete customers" on public.customers
    for delete using (public.is_owner(shop_id));

-- 2.4 Policies: products
create policy "member read products" on public.products
    for select using (public.is_member(shop_id));

create policy "owner manage products" on public.products
    for all using (public.is_owner(shop_id));

-- 2.5 Policies: orders
create policy "member read orders" on public.orders
    for select using (public.is_member(shop_id));

create policy "member write orders" on public.orders
    for insert with check (public.is_member(shop_id));

create policy "member update orders" on public.orders
    for update using (public.is_member(shop_id));

create policy "owner delete orders" on public.orders
    for delete using (public.is_owner(shop_id));

-- 2.6 Policies: order_items
create policy "member read order items" on public.order_items
    for select using (
        exists (select 1 from public.orders o where o.id = order_items.order_id and public.is_member(o.shop_id))
    );

create policy "member write order items" on public.order_items
    for insert with check (
        exists (select 1 from public.orders o where o.id = order_items.order_id and public.is_member(o.shop_id))
    );

create policy "member update order items" on public.order_items
    for update using (
        exists (select 1 from public.orders o where o.id = order_items.order_id and public.is_member(o.shop_id))
    );

create policy "owner delete order items" on public.order_items
    for delete using (
        exists (select 1 from public.orders o where o.id = order_items.order_id and public.is_owner(o.shop_id))
    );

-- 2.7 Policies: payments
create policy "member read payments" on public.payments
    for select using (public.is_member(shop_id));

create policy "member write payments" on public.payments
    for insert with check (public.is_member(shop_id));

create policy "owner manage payments" on public.payments
    for update using (public.is_owner(shop_id));

create policy "owner delete payments" on public.payments
    for delete using (public.is_owner(shop_id));

-- 2.8 Policies: expenses (OWNER ONLY - พนักงานเข้าถึงไม่ได้เพื่อความปลอดภัยของข้อมูลการเงิน)
create policy "owner read expenses" on public.expenses
    for select using (public.is_owner(shop_id));

create policy "owner insert expenses" on public.expenses
    for insert with check (public.is_owner(shop_id));

create policy "owner update expenses" on public.expenses
    for update using (public.is_owner(shop_id));

create policy "owner delete expenses" on public.expenses
    for delete using (public.is_owner(shop_id));

-- 2.9 Policies: order_logs
create policy "member read order logs" on public.order_logs
    for select using (
        exists (select 1 from public.orders o where o.id = order_logs.order_id and public.is_member(o.shop_id))
    );

create policy "member write order logs" on public.order_logs
    for insert with check (
        exists (select 1 from public.orders o where o.id = order_logs.order_id and public.is_member(o.shop_id))
    );

-- 2.10 Policies: attachments
create policy "member read attachments" on public.attachments
    for select using (public.is_member(shop_id));

create policy "member write attachments" on public.attachments
    for insert with check (public.is_member(shop_id));

create policy "owner delete attachments" on public.attachments
    for delete using (public.is_owner(shop_id));

-- ==============================================================================
-- 3. TRIGGERS & AUTOMATION
-- ==============================================================================

-- 3.1 คำนวณ payment_status อัตโนมัติจากตาราง payments
create or replace function public.fn_sync_order_payment_status()
returns trigger
language plpgsql
security definer
as $$
declare
    v_order_id uuid;
    v_total_paid numeric(12, 2);
    v_order_total numeric(12, 2);
    v_new_status text;
    v_old_status text;
begin
    if tg_op = 'DELETE' then
        v_order_id := OLD.order_id;
    else
        v_order_id := NEW.order_id;
    end if;

    -- คำนวณยอดเงินรวมที่ได้รับ
    select coalesce(sum(amount), 0) into v_total_paid
    from public.payments
    where order_id = v_order_id;

    -- ดึงยอดสุทธิของออเดอร์
    select total, payment_status into v_order_total, v_old_status
    from public.orders
    where id = v_order_id;

    if not found then
        return null;
    end if;

    -- กำหนดสถานะใหม่
    if v_total_paid <= 0 then
        v_new_status := 'unpaid';
    elsif v_total_paid >= v_order_total then
        v_new_status := 'paid';
    else
        v_new_status := 'partial';
    end if;

    -- อัปเดตเมื่อสถานะเปลี่ยน
    if v_old_status is distinct from v_new_status then
        update public.orders
        set payment_status = v_new_status,
            updated_at = now()
        where id = v_order_id;
    end if;

    return null;
end;
$$;

drop trigger if exists trg_sync_payment_status on public.payments;
create trigger trg_sync_payment_status
after insert or update or delete on public.payments
for each row execute function public.fn_sync_order_payment_status();

-- 3.2 บันทึก order_logs อัตโนมัติเมื่อสถานะเปลี่ยน
create or replace function public.fn_log_order_changes()
returns trigger
language plpgsql
security definer
as $$
begin
    -- บันทึกเมื่อ fulfillment_status เปลี่ยน
    if OLD.fulfillment_status is distinct from NEW.fulfillment_status then
        insert into public.order_logs (order_id, actor_id, action, from_value, to_value, created_at)
        values (NEW.id, auth.uid(), 'fulfillment_status', OLD.fulfillment_status, NEW.fulfillment_status, now());
    end if;

    -- บันทึกเมื่อ payment_status เปลี่ยน
    if OLD.payment_status is distinct from NEW.payment_status then
        insert into public.order_logs (order_id, actor_id, action, from_value, to_value, created_at)
        values (NEW.id, auth.uid(), 'payment_status', OLD.payment_status, NEW.payment_status, now());
    end if;

    return NEW;
end;
$$;

drop trigger if exists trg_log_order_changes on public.orders;
create trigger trg_log_order_changes
after update on public.orders
for each row execute function public.fn_log_order_changes();

-- 3.3 ตารางลำดับเลขที่ออเดอร์รายวัน (Daily Order Sequence)
create table if not exists public.order_number_seq (
    shop_id uuid not null references public.shops(id) on delete cascade,
    prefix_date text not null, -- Format YYMMDD (เช่น 261015)
    last_seq integer not null default 0,
    primary key (shop_id, prefix_date)
);

create or replace function public.fn_get_next_order_no(p_shop_id uuid)
returns text
language plpgsql
security definer
as $$
declare
    v_prefix text;
    v_seq integer;
begin
    -- ดึงวันที่ปัจจุบันตามเวลาไทย (UTC+7) รูปแบบ YYMMDD
    v_prefix := to_char(now() at time zone 'Asia/Bangkok', 'YYMMDD');

    -- บันทึกหรือเพิ่มลำดับเลขที่ต่อท้าย
    insert into public.order_number_seq (shop_id, prefix_date, last_seq)
    values (p_shop_id, v_prefix, 1)
    on conflict (shop_id, prefix_date)
    do update set last_seq = public.order_number_seq.last_seq + 1
    returning last_seq into v_seq;

    return v_prefix || '-' || lpad(v_seq::text, 3, '0');
end;
$$;

-- ==============================================================================
-- 4. STORED PROCEDURES / RPC FUNCTIONS
-- ==============================================================================

-- 4.1 สร้างออเดอร์พร้อมรายการสินค้าและเงินชำระ (ถ้ามี) ใน Transaction เดียว
create or replace function public.create_order(
    p_payload jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_shop_id uuid;
    v_order_id uuid;
    v_order_no text;
    v_customer_id uuid;
    v_customer_phone text;
    v_customer_name text;
    v_item jsonb;
    v_subtotal numeric(12, 2) := 0;
    v_discount numeric(12, 2);
    v_delivery_fee numeric(12, 2);
    v_total numeric(12, 2);
    v_payment_amount numeric(12, 2);
    v_payment_method text;
    v_payment_slip text;
    v_created_order public.orders;
begin
    v_shop_id := (p_payload->>'shop_id')::uuid;

    -- ตรวจสอบสิทธิ์สมาชิก
    if not public.is_member(v_shop_id) then
        raise exception 'Unauthorized: Not a member of this shop';
    end if;

    -- จัดการลูกค้า (สร้างใหม่หรือใช้ id เดิม)
    if p_payload ? 'customer_id' and (p_payload->>'customer_id') is not null and (p_payload->>'customer_id') <> '' then
        v_customer_id := (p_payload->>'customer_id')::uuid;
    else
        v_customer_name := coalesce(p_payload->'customer'->>'name', 'ลูกค้าทั่วไป');
        v_customer_phone := p_payload->'customer'->>'phone';
        
        insert into public.customers (shop_id, name, phone, note)
        values (v_shop_id, v_customer_name, v_customer_phone, p_payload->'customer'->>'note')
        returning id into v_customer_id;
    end if;

    -- คำนวณเลขที่ออเดอร์
    v_order_no := public.fn_get_next_order_no(v_shop_id);

    -- คำนวณราคารวม
    v_discount := coalesce((p_payload->>'discount')::numeric, 0);
    v_delivery_fee := coalesce((p_payload->>'delivery_fee')::numeric, 0);

    -- สร้าง Order บันทึกเบื้องต้น
    insert into public.orders (
        shop_id,
        order_no,
        customer_id,
        channel,
        order_type,
        fulfillment_type,
        fulfillment_status,
        payment_status,
        subtotal,
        discount,
        delivery_fee,
        total,
        due_at,
        recipient_name,
        recipient_phone,
        address,
        card_message,
        note,
        created_by
    ) values (
        v_shop_id,
        v_order_no,
        v_customer_id,
        coalesce(p_payload->>'channel', 'walk_in'),
        coalesce(p_payload->>'order_type', 'walk_in'),
        coalesce(p_payload->>'fulfillment_type', 'pickup'),
        'new',
        'unpaid',
        0,
        v_discount,
        v_delivery_fee,
        0,
        (p_payload->>'due_at')::timestamptz,
        p_payload->>'recipient_name',
        p_payload->>'recipient_phone',
        p_payload->>'address',
        p_payload->>'card_message',
        p_payload->>'note',
        auth.uid()
    ) returning id into v_order_id;

    -- วนลูปบันทึก Order Items
    for v_item in select * from jsonb_array_elements(p_payload->'items')
    loop
        insert into public.order_items (
            order_id,
            product_id,
            name_snapshot,
            qty,
            unit_price,
            note
        ) values (
            v_order_id,
            case when (v_item->>'product_id') is not null and (v_item->>'product_id') <> '' then (v_item->>'product_id')::uuid else null end,
            coalesce(v_item->>'name', 'สินค้ากำหนดเอง'),
            coalesce((v_item->>'qty')::int, 1),
            coalesce((v_item->>'unit_price')::numeric, 0),
            v_item->>'note'
        );

        v_subtotal := v_subtotal + (coalesce((v_item->>'qty')::int, 1) * coalesce((v_item->>'unit_price')::numeric, 0));
    end loop;

    -- คำนวณ Total สุทธิ
    v_total := greatest(0, (v_subtotal - v_discount) + v_delivery_fee);

    update public.orders
    set subtotal = v_subtotal,
        total = v_total
    where id = v_order_id
    returning * into v_created_order;

    -- บันทึกเงินชำระทันที (ถ้ามีระบุใน payload)
    v_payment_amount := coalesce((p_payload->'payment'->>'amount')::numeric, 0);
    if v_payment_amount > 0 then
        v_payment_method := coalesce(p_payload->'payment'->>'method', 'cash');
        v_payment_slip := p_payload->'payment'->>'slip_url';

        insert into public.payments (
            shop_id,
            order_id,
            amount,
            method,
            slip_url,
            received_by
        ) values (
            v_shop_id,
            v_order_id,
            v_payment_amount,
            v_payment_method,
            v_payment_slip,
            auth.uid()
        );
    end if;

    -- บันทึก log แรก
    insert into public.order_logs (order_id, actor_id, action, to_value, note)
    values (v_order_id, auth.uid(), 'created', v_order_no, 'สร้างออเดอร์ใหม่');

    return row_to_json(v_created_order)::jsonb;
end;
$$;

-- 4.2 บันทึกการชำระเงิน (Record Payment)
create or replace function public.record_payment(
    p_shop_id uuid,
    p_order_id uuid,
    p_amount numeric,
    p_method text,
    p_slip_url text default null,
    p_note text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_payment_id uuid;
begin
    if not public.is_member(p_shop_id) then
        raise exception 'Unauthorized: Not a member of this shop';
    end if;

    insert into public.payments (
        shop_id,
        order_id,
        amount,
        method,
        slip_url,
        note,
        received_by
    ) values (
        p_shop_id,
        p_order_id,
        p_amount,
        p_method,
        p_slip_url,
        p_note,
        auth.uid()
    ) returning id into v_payment_id;

    insert into public.order_logs (order_id, actor_id, action, to_value, note)
    values (p_order_id, auth.uid(), 'payment_added', p_amount::text, 'ชำระเงินผ่าน ' || p_method);

    return jsonb_build_object('success', true, 'payment_id', v_payment_id);
end;
$$;

-- 4.3 อัปเดตสถานะการจัดส่ง / ดำเนินการ (Set Fulfillment Status)
create or replace function public.set_fulfillment(
    p_order_id uuid,
    p_status text,
    p_note text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_order public.orders;
begin
    select * into v_order from public.orders where id = p_order_id;
    if not found then
        raise exception 'Order not found';
    end if;

    if not public.is_member(v_order.shop_id) then
        raise exception 'Unauthorized';
    end if;

    update public.orders
    set fulfillment_status = p_status,
        arranged_by = case when p_status = 'arranging' then coalesce(arranged_by, auth.uid()) else arranged_by end,
        delivered_by = case when p_status = 'done' then coalesce(delivered_by, auth.uid()) else delivered_by end,
        updated_at = now()
    where id = p_order_id;

    if p_note is not null and p_note <> '' then
        insert into public.order_logs (order_id, actor_id, action, to_value, note)
        values (p_order_id, auth.uid(), 'status_note', p_status, p_note);
    end if;

    return jsonb_build_object('success', true, 'order_id', p_order_id, 'status', p_status);
end;
$$;

-- 4.4 สรุปรายงานรายรับ/รายจ่าย/กำไร (Owner Only Report Summary)
create or replace function public.report_summary(
    p_shop_id uuid,
    p_start_date timestamptz,
    p_end_date timestamptz
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_total_revenue numeric(12, 2) := 0;
    v_total_expense numeric(12, 2) := 0;
    v_net_profit numeric(12, 2) := 0;
    v_by_payment_method jsonb;
    v_by_channel jsonb;
    v_by_expense_category jsonb;
begin
    -- บังคับตรวจสอบ: เฉพาะ Owner เท่านั้นที่เรียกดูได้ พนักงานทั่วไปไม่มีสิทธิ์
    if not public.is_owner(p_shop_id) then
        raise exception 'Unauthorized: Only shop owners can view financial summary reports.';
    end if;

    -- รายรับจริงจากตาราง payments ในช่วงเวลาที่เลือก
    select coalesce(sum(amount), 0) into v_total_revenue
    from public.payments
    where shop_id = p_shop_id
      and paid_at >= p_start_date
      and paid_at <= p_end_date;

    -- รายจ่ายจริงจากตาราง expenses ในช่วงเวลาที่เลือก
    select coalesce(sum(amount), 0) into v_total_expense
    from public.expenses
    where shop_id = p_shop_id
      and spent_at >= p_start_date
      and spent_at <= p_end_date;

    -- คำนวณกำไรสุทธิ
    v_net_profit := v_total_revenue - v_total_expense;

    -- ยอดแยกตามวิธีชำระเงิน
    select coalesce(jsonb_agg(sub), '[]'::jsonb) into v_by_payment_method
    from (
        select method, sum(amount) as total_amount, count(*) as count
        from public.payments
        where shop_id = p_shop_id
          and paid_at >= p_start_date
          and paid_at <= p_end_date
        group by method
    ) sub;

    -- ยอดแยกตามช่องทางการขาย (อ้างอิงจาก orders)
    select coalesce(jsonb_agg(sub), '[]'::jsonb) into v_by_channel
    from (
        select channel, sum(total) as total_sales, count(*) as count
        from public.orders
        where shop_id = p_shop_id
          and created_at >= p_start_date
          and created_at <= p_end_date
          and fulfillment_status <> 'cancelled'
        group by channel
    ) sub;

    -- ยอดรายจ่ายแยกตามหมวดหมู่
    select coalesce(jsonb_agg(sub), '[]'::jsonb) into v_by_expense_category
    from (
        select category, sum(amount) as total_amount, count(*) as count
        from public.expenses
        where shop_id = p_shop_id
          and spent_at >= p_start_date
          and spent_at <= p_end_date
        group by category
    ) sub;

    return jsonb_build_object(
        'start_date', p_start_date,
        'end_date', p_end_date,
        'total_revenue', v_total_revenue,
        'total_expense', v_total_expense,
        'net_profit', v_net_profit,
        'by_payment_method', v_by_payment_method,
        'by_channel', v_by_channel,
        'by_expense_category', v_by_expense_category
    );
end;
$$;

-- 4.5 สรุปยอดหน้าแรกประจำวัน (Today Summary)
-- พนักงานจะเห็นเฉพาะจำนวนนับออเดอร์ (orders count) แต่จะไม่เห็นยอดเงินรวม (total revenue) ตามเงื่อนไขความปลอดภัย
create or replace function public.get_today_dashboard_summary(
    p_shop_id uuid,
    p_date date default current_date
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_is_owner boolean;
    v_total_orders integer;
    v_new_count integer;
    v_arranging_count integer;
    v_ready_count integer;
    v_done_count integer;
    v_unpaid_count integer;
    v_today_revenue numeric(12, 2) := null;
begin
    if not public.is_member(p_shop_id) then
        raise exception 'Unauthorized';
    end if;

    v_is_owner := public.is_owner(p_shop_id);

    -- นับจำนวนออเดอร์ในวันนั้น
    select 
        count(*),
        count(*) filter (where fulfillment_status = 'new'),
        count(*) filter (where fulfillment_status = 'arranging'),
        count(*) filter (where fulfillment_status = 'ready'),
        count(*) filter (where fulfillment_status = 'done'),
        count(*) filter (where payment_status in ('unpaid', 'partial'))
    into 
        v_total_orders,
        v_new_count,
        v_arranging_count,
        v_ready_count,
        v_done_count,
        v_unpaid_count
    from public.orders
    where shop_id = p_shop_id
      and date(due_at at time zone 'Asia/Bangkok') = p_date
      and fulfillment_status <> 'cancelled';

    -- คำนวณยอดเงินเฉพาะเมื่อเป็น Owner เท่านั้น
    if v_is_owner then
        select coalesce(sum(amount), 0) into v_today_revenue
        from public.payments
        where shop_id = p_shop_id
          and date(paid_at at time zone 'Asia/Bangkok') = p_date;
    end if;

    return jsonb_build_object(
        'date', p_date,
        'is_owner', v_is_owner,
        'total_orders', v_total_orders,
        'new_count', v_new_count,
        'arranging_count', v_arranging_count,
        'ready_count', v_ready_count,
        'done_count', v_done_count,
        'unpaid_count', v_unpaid_count,
        'today_revenue', v_today_revenue -- จะเป็น null ถ้าผู้เรียกคือ staff
    );
end;
$$;
