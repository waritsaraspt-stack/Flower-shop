# ข้อกำหนด API และฟังก์ชันฝั่งเซิร์ฟเวอร์ (API Specifications & RPC)
## ระบบบริหารจัดการร้านดอกไม้ (Flower Shop Management System)

เอกสารนี้ระบุรายละเอียดการเรียกใช้งาน Supabase RPC (Remote Procedure Calls), รูปแบบ Payload, ผลลัพธ์ (Response), นโยบายความปลอดภัย และการใช้งานร่วมกับ Supabase Client / TanStack Query ใน Frontend

---

### 1. รายการ RPC ทั้งหมด (Overview)

| ชื่อฟังก์ชัน RPC | สิทธิ์ที่เรียกใช้ได้ | วัตถุประสงค์ |
| :--- | :--- | :--- |
| `create_order` | `is_member` (Owner & Staff) | สร้าง Order + Order Items + Payment แรก (ถ้ามี) ภายใน Transaction เดียวแบบ Atomic |
| `record_payment` | `is_member` (Owner & Staff) | บันทึกรับเงิน/สลิปโอน และทริกเกอร์อัปเดตสถานะการชำระเงินอัตโนมัติ |
| `set_fulfillment` | `is_member` (Owner & Staff) | เปลี่ยนสถานะขั้นตอนจัดดอกไม้ / ส่งมอบ และบันทึกผู้ดำเนินการ |
| `get_today_dashboard_summary` | `is_member` (Owner & Staff) | สรุปยอดออเดอร์รายวัน (Staff ไม่เห็นยอดเงินรวม, Owner เห็นยอดเงินรวม) |
| `report_summary` | **`is_owner` (เฉพาะเจ้าของร้าน)** | สรุปรายงานรายรับ รายจ่าย กำไรสุทธิ แยกตามวิธีจ่ายและช่องทาง |

---

### 2. รายละเอียดข้อกำหนดแต่ละฟังก์ชัน (RPC Specifications)

#### 2.1 `create_order(p_payload jsonb)`
ใช้สำหรับฟอร์ม "ออเดอร์ใหม่" ทั้งแบบ Walk-in หน้าร้าน หรือลูกค้าทักสั่งทางแชท (LINE/Facebook)

**Request Payload Example:**
```json
{
  "shop_id": "a0000000-0000-0000-0000-000000000001",
  "customer": {
    "name": "คุณศิริพร บุญเกิด",
    "phone": "081-999-8877",
    "note": "ชอบดอกไม้โทนขาว-เขียว"
  },
  "channel": "line",
  "order_type": "chat",
  "fulfillment_type": "delivery",
  "due_at": "2026-10-16T14:00:00+07:00",
  "recipient_name": "คุณศิริพร",
  "recipient_phone": "081-999-8877",
  "address": "คอนโดลุมพินีเพลส สาทร ตึก A ห้อง 802",
  "card_message": "ขอแสดงความยินดีกับการเปิดคลินิกใหม่ ขอให้กิจการรุ่งเรือง เฮงๆ ปังๆ นะคะ",
  "note": "กระดาษห่อสีเขียวเซจ ผูกโบว์สีครีม",
  "discount": 100.00,
  "delivery_fee": 120.00,
  "items": [
    {
      "product_id": "b0000000-0000-0000-0000-000000000005",
      "name": "ช่อลิลลี่ขาวหรูหรา (Pure Elegance)",
      "qty": 1,
      "unit_price": 1890.00,
      "note": "เลือกดอกที่กำลังเริ่มแย้ม"
    },
    {
      "product_id": null,
      "name": "การ์ดข้อความอวยพรพรีเมียม",
      "qty": 1,
      "unit_price": 50.00,
      "note": "พิมพ์ลงการ์ดแข็ง"
    }
  ],
  "payment": {
    "amount": 1000.00,
    "method": "promptpay",
    "slip_url": "https://.../slips/slip_123.jpg"
  }
}
```

**Response Format:**
```json
{
  "id": "e4a5d3f2-1234-5678-90ab-cdef12345678",
  "shop_id": "a0000000-0000-0000-0000-000000000001",
  "order_no": "261016-001",
  "customer_id": "c7b8a910-1234-5678-90ab-cdef12345678",
  "fulfillment_status": "new",
  "payment_status": "partial",
  "subtotal": 1940.00,
  "discount": 100.00,
  "delivery_fee": 120.00,
  "total": 1960.00,
  "due_at": "2026-10-16T14:00:00+07:00",
  "created_at": "2026-10-15T11:00:00+07:00"
}
```

**ตัวอย่างการเรียกใช้จาก TypeScript / Supabase:**
```typescript
const { data, error } = await supabase.rpc('create_order', {
  p_payload: orderPayload
});
```

---

#### 2.2 `record_payment(...)`
บันทึกการรับชำระเงินเพิ่มเติม (เช่น มัดจำไว้ก่อนแล้วมาจ่ายส่วนที่เหลือหน้าร้าน หรือจ่ายเต็มจำนวน)

**Parameters:**
- `p_shop_id` (UUID) - รหัสร้าน
- `p_order_id` (UUID) - รหัสออเดอร์
- `p_amount` (NUMERIC) - ยอดเงินที่รับ
- `p_method` (TEXT) - `'cash' | 'promptpay' | 'transfer' | 'card' | 'other'`
- `p_slip_url` (TEXT, optional) - URL สลิป
- `p_note` (TEXT, optional) - หมายเหตุ

**Response Format:**
```json
{
  "success": true,
  "payment_id": "f5b6c7d8-1234-5678-90ab-cdef12345678"
}
```

*หมายเหตุ*: เมื่อเรียกฟังก์ชันนี้สำเร็จ `trg_sync_payment_status` จะทำงานอัตโนมัติ ทำให้ `payment_status` ของออเดอร์เปลี่ยนเป็น `'paid'` ทันทีหากยอดสะสมเท่ากับหรือมากกว่า `total`

---

#### 2.3 `set_fulfillment(...)`
เปลี่ยนสถานะการดำเนินงานของออเดอร์

**Parameters:**
- `p_order_id` (UUID) - รหัสออเดอร์
- `p_status` (TEXT) - `'new' | 'arranging' | 'ready' | 'done' | 'cancelled'`
- `p_note` (TEXT, optional) - บันทึกช่วยจำ เช่น ช่างที่จัด หรือสาเหตุการยกเลิก

**Response Format:**
```json
{
  "success": true,
  "order_id": "e4a5d3f2-1234-5678-90ab-cdef12345678",
  "status": "arranging"
}
```

---

#### 2.4 `get_today_dashboard_summary(...)`
ดึงข้อมูลภาพรวมของวันสำหรับหน้าแรก `/today`

**Parameters:**
- `p_shop_id` (UUID)
- `p_date` (DATE, default `current_date`)

**Response Format สำหรับพนักงาน (Staff):**
```json
{
  "date": "2026-10-15",
  "is_owner": false,
  "total_orders": 8,
  "new_count": 2,
  "arranging_count": 3,
  "ready_count": 2,
  "done_count": 1,
  "unpaid_count": 3,
  "today_revenue": null
}
```
*(สังเกตว่า `today_revenue` จะเป็น `null` เสมอ พนักงานจะไม่เห็นยอดเงินรวม)*

**Response Format สำหรับเจ้าของร้าน (Owner):**
```json
{
  "date": "2026-10-15",
  "is_owner": true,
  "total_orders": 8,
  "new_count": 2,
  "arranging_count": 3,
  "ready_count": 2,
  "done_count": 1,
  "unpaid_count": 3,
  "today_revenue": 14500.00
}
```

---

#### 2.5 `report_summary(...)` (Owner Only)
สรุปข้อมูลทางบัญชี การเงิน กำไรสุทธิ และสถิติการขายในช่วงเวลาที่ต้องการ

**Parameters:**
- `p_shop_id` (UUID)
- `p_start_date` (TIMESTAMPTZ)
- `p_end_date` (TIMESTAMPTZ)

**Response Format:**
```json
{
  "start_date": "2026-10-01T00:00:00Z",
  "end_date": "2026-10-31T23:59:59Z",
  "total_revenue": 85400.00,
  "total_expense": 32150.00,
  "net_profit": 53250.00,
  "by_payment_method": [
    { "method": "promptpay", "total_amount": 54200.00, "count": 38 },
    { "method": "cash", "total_amount": 21200.00, "count": 19 },
    { "method": "transfer", "total_amount": 10000.00, "count": 5 }
  ],
  "by_channel": [
    { "channel": "line", "total_sales": 48000.00, "count": 32 },
    { "channel": "walk_in", "total_sales": 26400.00, "count": 24 },
    { "channel": "facebook", "total_sales": 11000.00, "count": 6 }
  ],
  "by_expense_category": [
    { "category": "flower_stock", "total_amount": 22000.00, "count": 8 },
    { "category": "accessories", "total_amount": 4500.00, "count": 3 },
    { "category": "transportation", "total_amount": 1650.00, "count": 12 },
    { "category": "utilities", "total_amount": 4000.00, "count": 2 }
  ]
}
```

---

### 3. การรับส่งข้อมูล Realtime ระหว่างพนักงานในร้าน (Supabase Realtime)

ระบบรองรับการเปิดใช้งานพร้อมกัน 2-3 คน (เช่น หน้าร้านเปิดรับออเดอร์ ช่างหลังร้านดูคิวจัดดอกไม้ เจ้าของร้านตรวจยอด) เมื่อมีการเปิดบิลใหม่หรือเปลี่ยนสถานะ หน้าจอของทุกคนจะอัปเดตทันทีโดยไม่ต้องกดรีเฟรช

**โค้ดตัวอย่างการ Subscribe บน Next.js (TanStack Query Invalidation):**
```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useOrdersRealtime(shopId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel(`shop_orders_${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `shop_id=eq.${shopId}`
        },
        () => {
          // รีเฟรช cache ของรายการออเดอร์และสรุปหน้าร้านทันที
          queryClient.invalidateQueries({ queryKey: ['orders', shopId] });
          queryClient.invalidateQueries({ queryKey: ['today_summary', shopId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `shop_id=eq.${shopId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', shopId] });
          queryClient.invalidateQueries({ queryKey: ['today_summary', shopId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, queryClient]);
}
```
