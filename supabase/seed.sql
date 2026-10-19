-- ==============================================================================
-- FLOWER SHOP MANAGEMENT SYSTEM (ระบบร้านดอกไม้)
-- Initial Seed Data (ข้อมูลตั้งต้นสำหรับทดสอบระบบใน Sprint 0)
-- ==============================================================================

-- 1. ข้อมูลร้านค้าตัวอย่าง
insert into public.shops (id, name, phone, promptpay_number, address)
values (
    'a0000000-0000-0000-0000-000000000001',
    'Bloom & Blossom Flower Shop (ร้านดอกไม้บลูมแอนด์บลอสซั่ม)',
    '081-234-5678',
    '0812345678',
    '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'
) on conflict (id) do nothing;

-- 2. ข้อมูลสินค้าตัวอย่าง (แคตตาล็อกดอกไม้และช่อ)
insert into public.products (shop_id, name, type, size, unit, price, is_active)
values
    -- ช่อดอกไม้จัดสำเร็จ
    ('a0000000-0000-0000-0000-000000000001', 'ช่อกุหลาบแดงคลาสสิก (Red Romance)', 'bouquet', 'S (1-3 ดอก)', 'ช่อ', 590.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ช่อกุหลาบแดงคลาสสิก (Red Romance)', 'bouquet', 'M (5-7 ดอก)', 'ช่อ', 990.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ช่อกุหลาบแดงคลาสสิก (Red Romance)', 'bouquet', 'L (10-12 ดอก)', 'ช่อ', 1590.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ช่อดอกทานตะวันสดใส (Sunny Day)', 'bouquet', 'M (3 ดอกใหญ่)', 'ช่อ', 850.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ช่อลิลลี่ขาวหรูหรา (Pure Elegance)', 'bouquet', 'L (ช่อใหญ่พรีเมียม)', 'ช่อ', 1890.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ช่อดอกไฮเดรนเยียพาสเทล (Soft Pastel)', 'bouquet', 'M', 'ช่อ', 1200.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ช่อดอกไม้รับปริญญา (Graduation Mini)', 'bouquet', 'S', 'ช่อ', 450.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'แจกันดอกไม้แสดงความยินดี (Congratulation Vase)', 'bouquet', 'L', 'แจกัน', 2200.00, true),
    
    -- ดอกไม้สดแบ่งขาย / จัดช่อตามสั่ง
    ('a0000000-0000-0000-0000-000000000001', 'ดอกกุหลาบเอกวาดอร์สีแดง', 'fresh_flower', 'Standard', 'ดอก', 80.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ดอกกุหลาบฮอลแลนด์สีขาว', 'fresh_flower', 'Standard', 'ดอก', 80.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ดอกทานตะวันนำเข้า', 'fresh_flower', 'Standard', 'ดอก', 120.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ดอกลิลลี่สีขาว (กิ่งละ 3-4 ดอก)', 'fresh_flower', 'Standard', 'ก้าน', 150.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ดอกยิปโซฟิลลา (Baby Breath)', 'fresh_flower', 'Standard', 'กำ', 150.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'ใบยูคาลิปตัสประดับ', 'fresh_flower', 'Standard', 'กำ', 100.00, true),
    
    -- อุปกรณ์ตกแต่ง / บริการเสริม
    ('a0000000-0000-0000-0000-000000000001', 'ตุ๊กตาหมีบัณฑิตขนาด 20 ซม.', 'accessory', 'One Size', 'ตัว', 190.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'กล่องอะคริลิกใสพร้อมไฟ LED', 'accessory', 'M', 'กล่อง', 350.00, true),
    ('a0000000-0000-0000-0000-000000000001', 'การ์ดอวยพรพิมพ์พิเศษพร้อมซอง', 'accessory', 'One Size', 'ใบ', 50.00, true);

-- 3. ข้อมูลลูกค้าตัวอย่าง
insert into public.customers (id, shop_id, name, phone, note)
values
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'คุณณภัทร สมบูรณ์', '089-111-2233', 'ลูกค้าประจำ ชอบโทนชมพูพาสเทล'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'คุณพิมลดา รัตนกุล', '092-444-5566', 'ชอบการ์ดเขียนด้วยลายมือ'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'คุณกิตติศักดิ์ พลอยแสง', '081-777-8899', 'สั่งช่อเซอร์ไพรส์วันครบรอบ');

-- 4. ข้อมูลออเดอร์ตัวอย่าง
-- ออเดอร์ที่ 1: จ่ายแล้ว กำลังจัดช่อ (Arranging)
insert into public.orders (
    id, shop_id, order_no, customer_id, channel, order_type,
    fulfillment_type, fulfillment_status, payment_status,
    subtotal, discount, delivery_fee, total,
    due_at, recipient_name, recipient_phone, address, card_message, note
) values (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '261015-001',
    'c0000000-0000-0000-0000-000000000001',
    'line',
    'chat',
    'delivery',
    'arranging',
    'paid',
    1590.00,
    0.00,
    100.00,
    1690.00,
    now() + interval '3 hours',
    'คุณฟ้า พิมพ์ประภา',
    '089-999-8877',
    'อาคารสุขุมวิททาวเวอร์ ชั้น 18 ซอยสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กทม.',
    'Happy Birthday นะคนเก่ง มีความสุขมากๆ ในทุกๆ วันนะค้าบ รักเสมอ ♥',
    'โทนสีแดงพรีเมียม ริบบิ้นสีทอง ไม่ใส่ดอกลิลลี่'
);

insert into public.order_items (order_id, name_snapshot, qty, unit_price, note)
values (
    'd0000000-0000-0000-0000-000000000001',
    'ช่อกุหลาบแดงคลาสสิก (Red Romance) - Size L',
    1,
    1590.00,
    'ริบบิ้นทอง กระดาษห่อดำด้าน'
);

insert into public.payments (shop_id, order_id, amount, method, paid_at, note)
values (
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    1690.00,
    'promptpay',
    now() - interval '1 hour',
    'โอนยอดเต็มจำนวนเรียบร้อย'
);

-- ออเดอร์ที่ 2: หน้าร้าน ลูกค้ารอรับ จ่ายเงินสด (Ready / Walk-in)
insert into public.orders (
    id, shop_id, order_no, customer_id, channel, order_type,
    fulfillment_type, fulfillment_status, payment_status,
    subtotal, discount, delivery_fee, total,
    due_at, recipient_name, recipient_phone, address, card_message, note
) values (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    '261015-002',
    'c0000000-0000-0000-0000-000000000002',
    'walk_in',
    'walk_in',
    'pickup',
    'ready',
    'paid',
    850.00,
    50.00,
    0.00,
    800.00,
    now() + interval '30 minutes',
    'คุณพิมลดา',
    '092-444-5566',
    'รับเองที่ร้าน',
    'ยินดีกับความสำเร็จด้วยนะ!',
    'ลูกค้าเดินเล่นรอในห้าง จะกลับมารับเวลา 12:30'
);

insert into public.order_items (order_id, name_snapshot, qty, unit_price, note)
values (
    'd0000000-0000-0000-0000-000000000002',
    'ช่อดอกทานตะวันสดใส (Sunny Day) - Size M',
    1,
    850.00,
    'กระดาษคราฟท์น้ำตาล ริบบิ้นขาว'
);

insert into public.payments (shop_id, order_id, amount, method, paid_at, note)
values (
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    800.00,
    'cash',
    now() - interval '20 minutes',
    'รับเงินสดหน้าร้าน (แบงก์ 1,000 ทอน 200)'
);

-- ออเดอร์ที่ 3: รับออเดอร์ใหม่จาก Facebook ยังไม่ชำระเงิน (New / Unpaid)
insert into public.orders (
    id, shop_id, order_no, customer_id, channel, order_type,
    fulfillment_type, fulfillment_status, payment_status,
    subtotal, discount, delivery_fee, total,
    due_at, recipient_name, recipient_phone, address, card_message, note
) values (
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    '261015-003',
    'c0000000-0000-0000-0000-000000000003',
    'facebook',
    'chat',
    'delivery',
    'new',
    'unpaid',
    1890.00,
    0.00,
    150.00,
    2040.00,
    now() + interval '6 hours',
    'คุณกิตติศักดิ์',
    '081-777-8899',
    'บ้านเลขที่ 88/12 ซอยอารีย์สัมพันธ์ 3 พญาไท กทม.',
    'Happy 3rd Anniversary! ขอบคุณที่อยู่เคียงข้างกันเสมอ',
    'ส่งช่วงเย็น 17:00-18:00 น. รอส่งสลิปชำระ'
);

insert into public.order_items (order_id, name_snapshot, qty, unit_price, note)
values (
    'd0000000-0000-0000-0000-000000000003',
    'ช่อลิลลี่ขาวหรูหรา (Pure Elegance) - Size L',
    1,
    1890.00,
    'ผูกโบว์สีขาวมุก'
);

-- 5. ตัวอย่างรายจ่ายของร้าน (Expenses)
insert into public.expenses (shop_id, category, amount, method, spent_at, note)
values
    ('a0000000-0000-0000-0000-000000000001', 'flower_stock', 3500.00, 'transfer', now() - interval '2 days', 'ซื้อดอกไม้สดรอบเช้า ปากคลองตลาด (กุหลาบ ทานตะวัน ลิลลี่ ยิปโซ)'),
    ('a0000000-0000-0000-0000-000000000001', 'accessories', 850.00, 'promptpay', now() - interval '1 day', 'ซื้อกระดาษห่อเกาหลี ริบบิ้นผ้าซาติน โอเอซิส 1 ลัง'),
    ('a0000000-0000-0000-0000-000000000001', 'transportation', 250.00, 'cash', now() - interval '5 hours', 'ค่าส่ง Grab Express จัดส่งออเดอร์เร่งด่วน'),
    ('a0000000-0000-0000-0000-000000000001', 'utilities', 450.00, 'promptpay', now() - interval '3 days', 'ค่าน้ำแข็งสำหรับแช่ดอกไม้สดประจำสัปดาห์');
