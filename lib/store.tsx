"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Customer,
  CustomChannel,
  CustomCategory,
  Expense,
  FulfillmentStatus,
  Order,
  OrderItem,
  OrderLog,
  Payment,
  PaymentMethod,
  Product,
  Shop,
  ShopMember,
  UserAccount,
  UserRole,
} from "./types";
import { INITIAL_MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_PRODUCTS, MOCK_SHOP } from "./mock-data";
import { CentralAlertModal, FeedbackModalData, FeedbackType } from "@/components/ui/CentralAlertModal";

export const INITIAL_USERS: UserAccount[] = [];

export const DEFAULT_CHANNELS: CustomChannel[] = [
  { id: "walk_in", label: "หน้าร้าน (Walk-in)", badge: "bg-amber-100 text-amber-800" },
  { id: "line", label: "LINE Official", badge: "bg-emerald-100 text-emerald-800" },
  { id: "facebook", label: "Facebook Page", badge: "bg-blue-100 text-blue-800" },
  { id: "instagram", label: "Instagram DM", badge: "bg-pink-100 text-pink-800" },
  { id: "phone", label: "โทรศัพท์สั่งซื้อ", badge: "bg-indigo-100 text-indigo-800" },
  { id: "tiktok", label: "TikTok Shop", badge: "bg-purple-100 text-purple-800" },
  { id: "other", label: "อื่นๆ / ลูกค้าประจำ", badge: "bg-slate-100 text-slate-800" },
];

interface StoreContextType {
  currentUser: UserAccount | null;
  role: UserRole;
  shop: Shop;
  users: UserAccount[];
  shopMembers: ShopMember[];
  orders: Order[];
  products: Product[];
  customers: Customer[];
  expenses: Expense[];
  channels: CustomChannel[];
  categories: CustomCategory[];
  hasOwner: boolean;
  
  // Auth & Account
  login: (codeOrEmail: string, password?: string) => { success: boolean; message?: string };
  register: (data: { name: string; email: string; role: UserRole; phone?: string; password?: string }) => UserAccount;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  addStaffByUserIdCode: (userIdCode: string) => { success: boolean; message: string; member?: ShopMember };
  removeStaffMember: (userId: string) => void;

  // Custom channels, categories & products (Owner only)
  addCustomChannel: (name: string) => { success: boolean; message: string };
  addCategory: (category: Omit<CustomCategory, "id">) => CustomCategory;
  removeCategory: (categoryId: string) => void;
  addProduct: (product: Omit<Product, "id">) => Product;
  deleteProduct: (productId: string) => void;

  // Orders & Billing
  addOrder: (order: Omit<Order, "id" | "order_no" | "created_at">) => Order;
  deleteOrder: (orderId: string, hardDelete?: boolean, reason?: string) => { success: boolean; message: string };
  restoreOrder: (orderId: string) => { success: boolean; message: string };
  updateFulfillmentStatus: (orderId: string, status: FulfillmentStatus, note?: string) => void;
  addPayment: (orderId: string, amount: number, method: PaymentMethod, note?: string) => void;
  addExpense: (expense: Omit<Expense, "id" | "spent_at">) => void;
  getOrderById: (orderId: string) => Order | undefined;
  resetAllUsers: () => void;
  resetToSampleData: () => void;
  showFeedback: (options: FeedbackModalData) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_ORDERS = "flower_shop_orders_v3";
const STORAGE_KEY_USER = "flower_shop_user_v3";
const STORAGE_KEY_USERS_LIST = "flower_shop_users_list_v3";
const STORAGE_KEY_MEMBERS = "flower_shop_members_v3";
const STORAGE_KEY_CHANNELS = "flower_shop_channels_v3";
const STORAGE_KEY_PRODUCTS = "flower_shop_products_v3";
const STORAGE_KEY_EXPENSES = "flower_shop_expenses_v3";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [shop] = useState<Shop>(MOCK_SHOP);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null); // ต้องลงทะเบียน/ล็อกอินก่อนเข้าใช้งาน
  const [role, setRoleState] = useState<UserRole>("owner");
  const [shopMembers, setShopMembers] = useState<ShopMember[]>([]); // สะอาด 0 คน พร้อมให้ลงทะเบียนใหม่
  const [orders, setOrders] = useState<Order[]>(INITIAL_MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [channels, setChannels] = useState<CustomChannel[]>(DEFAULT_CHANNELS);
  const [categories, setCategories] = useState<CustomCategory[]>([
    { id: "cat-1", name: "ช่อดอกไม้สด", type: "bouquet", unit: "ช่อ" },
    { id: "cat-2", name: "ดอกไม้สดแบ่งขาย", type: "fresh_flower", unit: "ดอก/ก้าน" },
    { id: "cat-3", name: "แจกันและกระเช้า", type: "bouquet", unit: "แจกัน" },
    { id: "cat-4", name: "อุปกรณ์เสริมและการ์ด", type: "accessory", unit: "ชิ้น" },
  ]);

  // Central Alert Modal State
  const [feedbackData, setFeedbackData] = useState<FeedbackModalData | null>(null);

  const showFeedback = (options: FeedbackModalData) => {
    setFeedbackData(options);
  };

  // Load from LocalStorage
  useEffect(() => {
    try {
      // ล้างข้อมูลผู้ใช้เก่าเวอร์ชันทดลองทั้งหมด (v1, v2)
      localStorage.removeItem("flower_shop_user_v2");
      localStorage.removeItem("flower_shop_users_list_v2");
      localStorage.removeItem("flower_shop_members_v2");
      localStorage.removeItem("flower_shop_user");
      localStorage.removeItem("flower_shop_users_list");
      localStorage.removeItem("flower_shop_members");

      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setRoleState(u.role);
        try {
          document.cookie = `flower_pos_user=${encodeURIComponent(JSON.stringify({ id: u.id, role: u.role, code: u.userIdCode }))}; path=/; max-age=2592000`;
        } catch {}
      } else {
        // หากไม่มีเซสชัน v3 ให้ล้างคุกกี้เพื่อความปลอดภัย
        document.cookie = "flower_pos_user=; path=/; max-age=0";
      }

      const savedUsersList = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (savedUsersList) {
        setUsers(JSON.parse(savedUsersList));
      }

      const savedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (savedMembers) {
        setShopMembers(JSON.parse(savedMembers));
      }

      const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }

      const savedChannels = localStorage.getItem(STORAGE_KEY_CHANNELS);
      if (savedChannels) {
        setChannels(JSON.parse(savedChannels));
      }

      const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }

      const savedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch {}
  }, []);

  const persistUser = (u: UserAccount | null) => {
    setCurrentUser(u);
    if (u) {
      setRoleState(u.role);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
        document.cookie = `flower_pos_user=${encodeURIComponent(JSON.stringify({ id: u.id, role: u.role, code: u.userIdCode }))}; path=/; max-age=2592000`;
      } catch {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
        document.cookie = "flower_pos_user=; path=/; max-age=0";
      } catch {}
    }
  };

  const persistOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(newOrders));
    } catch {}
  };

  const persistMembers = (members: ShopMember[]) => {
    setShopMembers(members);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    } catch {}
  };

  const persistUsers = (allUsers: UserAccount[]) => {
    setUsers(allUsers);
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(allUsers));
    } catch {}
  };

  const persistChannels = (chs: CustomChannel[]) => {
    setChannels(chs);
    try {
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(chs));
    } catch {}
  };

  const persistProducts = (prods: Product[]) => {
    setProducts(prods);
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(prods));
    } catch {}
  };

  const persistExpenses = (exps: Expense[]) => {
    setExpenses(exps);
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(exps));
    } catch {}
  };

  // Auth Operations
  const login = (codeOrEmail: string, passwordInput?: string) => {
    // Read the most up-to-date user list directly from localStorage to ensure cross-page synchronization
    let currentUsersList = users;
    try {
      const fromStorage = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (fromStorage) {
        currentUsersList = JSON.parse(fromStorage);
        setUsers(currentUsersList);
      }
    } catch {}

    const term = codeOrEmail.trim().toLowerCase();
    const cleanPhoneTerm = term.replace(/[^0-9]/g, "");

    const found = currentUsersList.find((u) => {
      const uCode = (u.userIdCode || "").toLowerCase();
      const uEmail = (u.email || "").toLowerCase();
      const uName = (u.name || "").toLowerCase();
      const uPhone = (u.phone || "").replace(/[^0-9]/g, "");

      return (
        uCode === term ||
        uEmail === term ||
        (cleanPhoneTerm && uPhone && uPhone === cleanPhoneTerm) ||
        uName === term
      );
    });

    if (!found) {
      return { success: false, message: "ไม่พบบัญชีผู้ใช้ที่มีรหัส, อีเมล หรือเบอร์โทรนี้ในระบบ" };
    }

    // Verify Password if the account has a password
    if (found.password) {
      if (!passwordInput || !passwordInput.trim()) {
        return { success: false, message: "กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบ" };
      }
      if (found.password !== passwordInput) {
        return { success: false, message: "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง" };
      }
    }

    persistUser(found);
    return { success: true };
  };

  const register = (data: { name: string; email: string; role: UserRole; phone?: string; password?: string }) => {
    // Reload users list from localStorage first to prevent overwriting
    let currentUsersList = users;
    try {
      const fromStorage = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (fromStorage) {
        currentUsersList = JSON.parse(fromStorage);
      }
    } catch {}

    // 1 ร้านมีเจ้าของได้เพียง 1 คนเท่านั้น
    if (data.role === "owner") {
      const activeOwner = shopMembers.find((m) => m.role === "owner" && m.is_active);
      if (activeOwner) {
        throw new Error(
          `ร้านค้านี้มีเจ้าของร้านเรียบร้อยแล้ว (${activeOwner.display_name}) โดย 1 ร้านค้าจำกัดเจ้าของได้เพียง 1 คนเท่านั้น หากคุณเป็นทีมงาน กรุณาเลือกประเภท "พนักงาน"`
        );
      }
    }

    const rolePrefix = data.role === "owner" ? "OWN" : "EMP";
    const nextNum = currentUsersList.filter((u) => u.role === data.role).length + 101;
    const userIdCode = `${rolePrefix}-${nextNum}`;

    const newUser: UserAccount = {
      id: "usr-" + Date.now(),
      userIdCode,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      shop_id: data.role === "owner" ? MOCK_SHOP.id : undefined,
      created_at: new Date().toISOString(),
    };

    const updatedUsers = [...currentUsersList, newUser];
    persistUsers(updatedUsers);

    // If owner, automatically add as owner member
    if (data.role === "owner") {
      const newMember: ShopMember = {
        id: "mem-" + Date.now(),
        shop_id: MOCK_SHOP.id,
        user_id: newUser.id,
        userIdCode: newUser.userIdCode,
        role: "owner",
        display_name: newUser.name,
        is_active: true,
      };
      persistMembers([...shopMembers, newMember]);
    }

    persistUser(newUser);
    return newUser;
  };

  const logout = () => {
    persistUser(null);
  };

  const switchRole = (_newRole: UserRole) => {
    // ในระบบจริง สิทธิ์จะถูกกำหนดตามบัญชีผู้ใช้งานที่ลงทะเบียนและเข้าสู่ระบบจริง ไม่สามารถสลับเองได้
  };

  // Staff Management by User ID Code (e.g. EMP-103)
  const addStaffByUserIdCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const targetUser = users.find((u) => u.userIdCode.toUpperCase() === formatted);

    if (!targetUser) {
      return {
        success: false,
        message: `ไม่พบผู้ใช้งานรหัส "${formatted}" ในระบบ กรุณาตรวจสอบรหัส User ID`,
      };
    }

    if (shopMembers.some((m) => m.user_id === targetUser.id && m.is_active)) {
      return {
        success: false,
        message: `ผู้ใช้ "${targetUser.name}" (${formatted}) อยู่ในสังกัดร้านค้านี้เรียบร้อยแล้ว`,
      };
    }

    const newMember: ShopMember = {
      id: "mem-" + Date.now(),
      shop_id: MOCK_SHOP.id,
      user_id: targetUser.id,
      userIdCode: targetUser.userIdCode,
      role: targetUser.role,
      display_name: targetUser.name,
      is_active: true,
    };

    const updatedMembers = [...shopMembers, newMember];
    persistMembers(updatedMembers);

    // Update user's shop_id
    const updatedUsers = users.map((u) => (u.id === targetUser.id ? { ...u, shop_id: MOCK_SHOP.id } : u));
    persistUsers(updatedUsers);

    return {
      success: true,
      message: `ดึง "${targetUser.name}" (${formatted}) เข้าร่วมจัดการร้านค้าสำเร็จ!`,
      member: newMember,
    };
  };

  const removeStaffMember = (userId: string) => {
    // ลบพนักงานออกจากรายชื่อสมาชิกของร้าน
    const updatedMembers = shopMembers.filter((m) => m.user_id !== userId);
    persistMembers(updatedMembers);
    // ปลด shop_id ของผู้ใช้คนนั้นให้เป็น undefined เพื่อให้สถานะกลับเป็นรอดึงเข้าสังกัด
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, shop_id: undefined } : u));
    persistUsers(updatedUsers);
  };

  // Custom channels, categories & products
  const addCustomChannel = (label: string) => {
    const cleanLabel = label.trim();
    if (!cleanLabel) return { success: false, message: "กรุณาระบุชื่อช่องทาง" };

    const id = "ch_" + Date.now();
    const badges = [
      "bg-purple-100 text-purple-800",
      "bg-teal-100 text-teal-800",
      "bg-rose-100 text-rose-800",
      "bg-amber-100 text-amber-800",
      "bg-cyan-100 text-cyan-800",
    ];
    const badge = badges[channels.length % badges.length];

    const newChannel: CustomChannel = { id, label: cleanLabel, badge, is_custom: true };
    persistChannels([...channels, newChannel]);
    return { success: true, message: `เพิ่มช่องทาง "${cleanLabel}" เรียบร้อยแล้ว` };
  };

  const addCategory = (categoryData: Omit<CustomCategory, "id">) => {
    const newCategory: CustomCategory = {
      ...categoryData,
      id: "cat-" + Date.now(),
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    try {
      localStorage.setItem("flower_shop_categories_v3", JSON.stringify(updated));
    } catch {}
    return newCategory;
  };

  const removeCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    try {
      localStorage.setItem("flower_shop_categories_v3", JSON.stringify(updated));
    } catch {}
  };

  const addProduct = (pData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...pData,
      id: "prod-" + Date.now(),
    };
    persistProducts([...products, newProduct]);
    return newProduct;
  };

  const deleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    persistProducts(updated);
  };

  const deleteOrder = (orderId: string, hardDelete: boolean = false, reason: string = "ยกเลิกโดยเจ้าของร้าน") => {
    if (hardDelete) {
      const updated = orders.filter((o) => o.id !== orderId);
      persistOrders(updated);
      return { success: true, message: "ลบรายการออเดอร์ออกจากระบบถาวรเรียบร้อยแล้ว" };
    } else {
      const target = orders.find((o) => o.id === orderId);
      if (!target) return { success: false, message: "ไม่พบออเดอร์" };
      const cancelLog: OrderLog = {
        id: "log-" + Date.now(),
        order_id: orderId,
        action: "cancelled",
        actor_id: currentUser?.id,
        actor_name: currentUser?.name || (role === "owner" ? "เจ้าของร้าน" : "พนักงาน"),
        created_at: new Date().toISOString(),
        note: `ยกเลิกบิล: ${reason}`,
      };
      const updated = orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              fulfillment_status: "cancelled" as FulfillmentStatus,
              is_cancelled: true,
              cancelled_at: new Date().toISOString(),
              cancelled_by: currentUser?.id,
              cancelled_by_name: currentUser?.name || (role === "owner" ? "เจ้าของร้าน" : "พนักงาน"),
              cancellation_reason: reason,
              logs: [cancelLog, ...(o.logs || [])],
            }
          : o
      );
      persistOrders(updated);
      return { success: true, message: "ยกเลิกบิลและบันทึกประวัติการยกเลิกเรียบร้อยแล้ว" };
    }
  };

  const restoreOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { success: false, message: "ไม่พบออเดอร์" };
    const restoreLog: OrderLog = {
      id: "log-" + Date.now(),
      order_id: orderId,
      action: "restored",
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || (role === "owner" ? "เจ้าของร้าน" : "พนักงาน"),
      created_at: new Date().toISOString(),
      note: "กู้คืนบิลกลับสู่ระบบการขาย",
    };
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            fulfillment_status: "new" as FulfillmentStatus,
            is_cancelled: false,
            cancelled_at: undefined,
            cancelled_by: undefined,
            cancelled_by_name: undefined,
            cancellation_reason: undefined,
            logs: [restoreLog, ...(o.logs || [])],
          }
        : o
    );
    persistOrders(updated);
    return { success: true, message: "กู้คืนบิลกลับสู่ระบบเรียบร้อยแล้ว" };
  };

  // Orders Management & Logs
  const addOrder = (orderData: Omit<Order, "id" | "order_no" | "created_at">): Order => {
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, "0");
    const dd = today.getDate().toString().padStart(2, "0");
    const prefix = `${yy}${mm}${dd}`;

    const todayCount = orders.filter((o) => o.order_no.startsWith(prefix)).length + 1;
    const order_no = `${prefix}-${todayCount.toString().padStart(3, "0")}`;

    const creationLog: OrderLog = {
      id: "log-" + Date.now(),
      order_id: "",
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || "ระบบ",
      action: "order_created",
      to_value: orderData.fulfillment_status,
      note: `เปิดบิลออเดอร์ใหม่ #${order_no} (ช่องทาง: ${orderData.channel})`,
      created_at: new Date().toISOString(),
    };

    const newOrder: Order = {
      ...orderData,
      id: "ord-" + Date.now(),
      order_no,
      created_by: currentUser?.id,
      created_by_name: currentUser?.name,
      created_at: new Date().toISOString(),
      logs: [creationLog],
    };

    const updated = [newOrder, ...orders];
    persistOrders(updated);
    return newOrder;
  };

  const updateFulfillmentStatus = (orderId: string, status: FulfillmentStatus, note?: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const oldStatus = o.fulfillment_status;
        const newLog: OrderLog = {
          id: "log-" + Date.now(),
          order_id: o.id,
          actor_id: currentUser?.id,
          actor_name: currentUser?.name || "พนักงาน",
          action: "status_changed",
          from_value: oldStatus,
          to_value: status,
          note: note || `เปลี่ยนสถานะเป็น "${status === "done" ? "ส่งมอบแล้ว" : status === "ready" ? "พร้อมส่ง/รอส่ง" : status === "arranging" ? "กำลังจัด" : status}"`,
          created_at: new Date().toISOString(),
        };

        return {
          ...o,
          fulfillment_status: status,
          arranged_by_name: status === "arranging" ? currentUser?.name || o.arranged_by_name : o.arranged_by_name,
          delivered_by_name: status === "done" ? currentUser?.name || o.delivered_by_name : o.delivered_by_name,
          logs: [newLog, ...(o.logs || [])],
        };
      }
      return o;
    });
    persistOrders(updated);
  };

  const addPayment = (orderId: string, amount: number, method: PaymentMethod, note?: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const newPayment: Payment = {
          id: "pay-" + Date.now(),
          shop_id: o.shop_id,
          order_id: o.id,
          amount,
          method,
          paid_at: new Date().toISOString(),
          received_by: currentUser?.id,
          received_by_name: currentUser?.name || "ผู้รับเงิน",
          note,
        };

        const existingPayments = o.payments || [];
        const allPayments = [...existingPayments, newPayment];
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

        let newPaymentStatus = o.payment_status;
        if (totalPaid >= o.total) {
          newPaymentStatus = "paid";
        } else if (totalPaid > 0) {
          newPaymentStatus = "partial";
        }

        const paymentLog: OrderLog = {
          id: "log-" + Date.now(),
          order_id: o.id,
          actor_id: currentUser?.id,
          actor_name: currentUser?.name || "พนักงาน",
          action: "payment_received",
          to_value: amount.toString(),
          note: `รับเงิน ฿${amount.toLocaleString()} ผ่าน ${method} (${note || "บันทึกชำระ"})`,
          created_at: new Date().toISOString(),
        };

        return {
          ...o,
          payment_status: newPaymentStatus,
          payments: allPayments,
          logs: [paymentLog, ...(o.logs || [])],
        };
      }
      return o;
    });
    persistOrders(updated);
  };

  const addExpense = (expenseData: Omit<Expense, "id" | "spent_at">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: "exp-" + Date.now(),
      created_by: currentUser?.id,
      spent_at: new Date().toISOString(),
    };
    persistExpenses([newExpense, ...expenses]);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  const resetAllUsers = () => {
    setCurrentUser(null);
    setUsers([]);
    setShopMembers([]);
    setRoleState("owner");
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_USERS_LIST);
      localStorage.removeItem(STORAGE_KEY_MEMBERS);
      localStorage.removeItem("flower_shop_user_v2");
      localStorage.removeItem("flower_shop_users_list_v2");
      localStorage.removeItem("flower_shop_members_v2");
      localStorage.removeItem("flower_shop_user");
      localStorage.removeItem("flower_shop_users_list");
      localStorage.removeItem("flower_shop_members");
      document.cookie = "flower_pos_user=; path=/; max-age=0";
    } catch {}
  };

  const resetToSampleData = () => {
    setOrders(INITIAL_MOCK_ORDERS);
    setUsers([]);
    setCurrentUser(null);
    setRoleState("owner");
    setShopMembers([]);
    setChannels(DEFAULT_CHANNELS);
    setProducts(MOCK_PRODUCTS);
    try {
      localStorage.clear();
      document.cookie = "flower_pos_user=; path=/; max-age=0";
    } catch {}
  };

  const hasOwner = shopMembers.some((m) => m.role === "owner" && m.is_active);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        role,
        shop,
        users,
        shopMembers,
        orders,
        products,
        customers,
        expenses,
        channels,
        categories,
        hasOwner,
        login,
        register,
        logout,
        switchRole,
        addStaffByUserIdCode,
        removeStaffMember,
        addCustomChannel,
        addCategory,
        removeCategory,
        addProduct,
        deleteProduct,
        addOrder,
        deleteOrder,
        restoreOrder,
        updateFulfillmentStatus,
        addPayment,
        addExpense,
        getOrderById,
        resetAllUsers,
        resetToSampleData,
        showFeedback,
      }}
    >
      {children}
      <CentralAlertModal data={feedbackData} onClose={() => setFeedbackData(null)} />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
