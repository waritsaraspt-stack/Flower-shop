export type UserRole = "owner" | "staff";

export type FulfillmentStatus = "new" | "arranging" | "ready" | "done" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type PaymentMethod = "cash" | "promptpay" | "transfer" | "card" | "other";
export type ChannelType = "walk_in" | "line" | "facebook" | "instagram" | "phone" | "other" | string;
export type OrderType = "walk_in" | "chat";
export type FulfillmentType = "pickup" | "delivery";

export interface Shop {
  id: string;
  name: string;
  phone?: string;
  promptpay_number?: string;
  address?: string;
  created_at: string;
}

export interface UserAccount {
  id: string;
  userIdCode: string; // เช่น EMP-101, OWN-001 ใช้สำหรับดึงพนักงานเข้าสู่ร้าน
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  shop_id?: string;
  created_at: string;
}

export interface ShopMember {
  id: string;
  shop_id: string;
  user_id: string;
  userIdCode?: string;
  role: UserRole;
  display_name: string;
  is_active: boolean;
}

export interface CustomChannel {
  id: string;
  label: string;
  badge: string;
  is_custom?: boolean;
}

export interface CustomCategory {
  id: string;
  name: string;
  type: "bouquet" | "fresh_flower" | "custom" | "accessory" | "service";
  unit: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone?: string;
  note?: string;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  type: "bouquet" | "fresh_flower" | "custom" | "accessory" | "service";
  size?: string;
  unit: string;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  name_snapshot: string;
  qty: number;
  unit_price: number;
  total_price: number;
  note?: string;
}

export interface Payment {
  id: string;
  shop_id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  received_by?: string;
  received_by_name?: string;
  slip_url?: string;
  note?: string;
}

export interface OrderLog {
  id: string;
  order_id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  from_value?: string;
  to_value?: string;
  note?: string;
  created_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  order_no: string;
  customer_id?: string;
  customer?: Customer;
  channel: ChannelType;
  order_type: OrderType;
  fulfillment_type: FulfillmentType;
  fulfillment_status: FulfillmentStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  due_at: string;
  recipient_name?: string;
  recipient_phone?: string;
  address?: string;
  card_message?: string;
  note?: string;
  created_by?: string;
  created_by_name?: string;
  arranged_by?: string;
  arranged_by_name?: string;
  delivered_by?: string;
  delivered_by_name?: string;
  created_at: string;
  items?: OrderItem[];
  payments?: Payment[];
  logs?: OrderLog[];
  is_cancelled?: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  cancelled_by_name?: string;
  cancellation_reason?: string;
}

export interface Expense {
  id: string;
  shop_id: string;
  category: "flower_stock" | "accessories" | "packaging" | "transportation" | "utilities" | "wage" | "other";
  amount: number;
  method: PaymentMethod;
  spent_at: string;
  note?: string;
  receipt_url?: string;
  created_by?: string;
}
