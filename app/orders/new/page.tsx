"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { ChannelType, FulfillmentStatus, FulfillmentType, OrderType, PaymentMethod } from "@/lib/types";
import { OrderInvoiceModal } from "@/components/order/OrderInvoiceModal";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  HeartHandshake,
  DollarSign,
  QrCode,
  CreditCard,
  CheckCircle,
  Zap,
  Printer,
  PackageCheck,
  Send,
} from "lucide-react";

export default function NewOrderPage() {
  const router = useRouter();
  const { shop, products, customers, channels, addOrder, addCustomChannel, role, showFeedback } = useStore();

  // Mode: standard wizard (3 steps) vs quick sale (ขายด่วนหน้าร้าน/ดอกไม้สด)
  const [isQuickSale, setIsQuickSale] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State: Step 1 (Customer & Items)
  const [channel, setChannel] = useState<string>("walk_in");
  const [showAddChannelInline, setShowAddChannelInline] = useState<boolean>(false);
  const [newInlineChannel, setNewInlineChannel] = useState<string>("");

  const [orderType, setOrderType] = useState<OrderType>("walk_in");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  const [selectedItems, setSelectedItems] = useState<
    Array<{
      product_id?: string;
      name_snapshot: string;
      qty: number;
      unit_price: number;
      note?: string;
    }>
  >([]);

  // Custom Item Inputs
  const [customItemName, setCustomItemName] = useState<string>("");
  const [customItemPrice, setCustomItemPrice] = useState<number>(0);

  // Form State: Step 2 (Fulfillment & Card)
  // เริ่มต้นสถานะเป็น "ready" (รอส่ง) หรือ "done" (ส่งแล้ว) ตามความต้องการของผู้ใช้
  const [initialStatus, setInitialStatus] = useState<FulfillmentStatus>("ready");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup");
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [dueTime, setDueTime] = useState<string>("14:00");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [cardMessage, setCardMessage] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");

  // Form State: Step 3 (Pricing & Payment)
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "unpaid">("full");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("promptpay");

  // Post-submit Invoice preview
  const [createdOrderForInvoice, setCreatedOrderForInvoice] = useState<any | null>(null);

  // Calculations
  const subtotal = selectedItems.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
  const total = Math.max(0, subtotal - discount + deliveryFee);

  // Customer Autofill
  const filteredCustomers = customerSearch.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          (c.phone && c.phone.includes(customerSearch))
      )
    : [];

  const handleSelectCustomer = (c: any) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone || "");
    setRecipientName(c.name);
    setRecipientPhone(c.phone || "");
    setCustomerSearch("");
  };

  const handleAddProduct = (product: any) => {
    const existing = selectedItems.find((i) => i.product_id === product.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          product_id: product.id,
          name_snapshot: `${product.name} ${product.size ? `(${product.size})` : ""}`,
          qty: 1,
          unit_price: product.price,
        },
      ]);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim() || customItemPrice <= 0) return;
    setSelectedItems([
      ...selectedItems,
      {
        name_snapshot: customItemName.trim(),
        qty: 1,
        unit_price: customItemPrice,
      },
    ]);
    setCustomItemName("");
    setCustomItemPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  const handleCreateInlineChannel = () => {
    if (!newInlineChannel.trim()) return;
    addCustomChannel(newInlineChannel.trim());
    setChannel(newInlineChannel.trim().toLowerCase());
    setNewInlineChannel("");
    setShowAddChannelInline(false);
  };

  const handleSubmitOrder = (andPrintBill = false) => {
    if (selectedItems.length === 0) {
      showFeedback({
        type: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณาเลือกรายการสินค้าหรือดอกไม้อย่างน้อย 1 รายการ",
      });
      return;
    }

    const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);

    let finalPaymentStatus: "unpaid" | "partial" | "paid" = "unpaid";
    let paymentsList: any[] = [];

    const actualPaid =
      paymentOption === "full"
        ? total
        : paymentOption === "deposit"
        ? Math.min(paidAmount, total)
        : 0;

    if (actualPaid >= total && total > 0) {
      finalPaymentStatus = "paid";
    } else if (actualPaid > 0) {
      finalPaymentStatus = "partial";
    }

    if (actualPaid > 0) {
      paymentsList.push({
        id: "pay-" + Date.now(),
        shop_id: shop.id,
        amount: actualPaid,
        method: paymentMethod,
        paid_at: new Date().toISOString(),
        note: isQuickSale ? "ขายด่วนหน้าร้าน/ดอกไม้สด" : undefined,
      });
    }

    // กำหนดสถานะออเดอร์: ถ้าเป็นขายด่วนหน้าร้านจะตั้งเป็น 'done' (ส่งแล้ว) ทันที
    // หากเป็นออเดอร์ทั่วไปจะใช้ค่า initialStatus ที่เลือกไว้ ('ready' = รอส่ง, 'done' = ส่งแล้ว)
    const finalFulfillmentStatus = isQuickSale ? "done" : initialStatus;

    const newOrder = addOrder({
      shop_id: shop.id,
      customer_id: selectedCustomerId || undefined,
      customer: {
        id: selectedCustomerId || "c-" + Date.now(),
        shop_id: shop.id,
        name: customerName || "ลูกค้าทั่วไป",
        phone: customerPhone,
        created_at: new Date().toISOString(),
      },
      channel,
      order_type: orderType,
      fulfillment_type: fulfillmentType,
      fulfillment_status: finalFulfillmentStatus,
      payment_status: finalPaymentStatus,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      total,
      due_at: dueDateTime.toISOString(),
      recipient_name: recipientName || customerName,
      recipient_phone: recipientPhone || customerPhone,
      address: fulfillmentType === "delivery" ? address : "รับเองที่ร้าน",
      card_message: cardMessage,
      note: orderNote,
      items: selectedItems.map((item, idx) => ({
        id: "item-" + Date.now() + "-" + idx,
        order_id: "",
        name_snapshot: item.name_snapshot,
        qty: item.qty,
        unit_price: item.unit_price,
        total_price: item.qty * item.unit_price,
        note: item.note,
      })),
      payments: paymentsList,
    });

    showFeedback({
      type: "success",
      title: "เปิดบิลสำเร็จ",
      message: `เปิดบิล #${newOrder.order_no} ยอด ${newOrder.total.toLocaleString()} บาท เรียบร้อยแล้ว`,
      onConfirm: () => {
        if (andPrintBill) {
          setCreatedOrderForInvoice(newOrder);
        } else {
          router.push(`/orders/${newOrder.id}`);
        }
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      {/* Header & Back */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium py-1 px-2 rounded-lg hover:bg-stone-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับ</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-stone-900">
          {isQuickSale ? "⚡ ขายด่วน / ดอกไม้สด (ออกบิลทันที)" : "เปิดบิลออเดอร์ใหม่"}
        </h1>

        {/* Quick Sale Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsQuickSale(!isQuickSale);
            if (!isQuickSale) {
              setFulfillmentType("pickup");
              setPaymentOption("full");
              setInitialStatus("done");
            }
          }}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
            isQuickSale
              ? "bg-amber-100 text-amber-800 border-amber-300 font-semibold"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>{isQuickSale ? "โหมดด่วนเปิดอยู่" : "ขายด่วน"}</span>
        </button>
      </div>

      {/* Step Indicator (สำหรับโหมดปกติ) */}
      {!isQuickSale && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
          {[
            { step: 1, label: "1. ลูกค้า & สินค้า" },
            { step: 2, label: "2. จัดส่ง & การ์ด" },
            { step: 3, label: "3. สรุป & ออกบิล" },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`py-2 rounded-xl transition-all ${
                currentStep === s.step
                  ? "bg-rose-600 text-white font-semibold shadow-sm"
                  : currentStep > s.step
                  ? "bg-rose-50 text-rose-700 font-medium"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* STEP 1: ลูกค้า และ รายการสินค้า */}
      {(isQuickSale || currentStep === 1) && (
        <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm">
          {/* ช่องทาง & ประเภทการสั่ง (เจ้าของร้านจัดการเพิ่มประเภทได้เอง) */}
          {!isQuickSale && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-stone-700">ช่องทางรับออเดอร์</label>
                    {role === "owner" && (
                      <button
                        type="button"
                        onClick={() => setShowAddChannelInline(!showAddChannelInline)}
                        className="text-[10px] text-rose-600 font-bold hover:underline"
                      >
                        + เพิ่มช่องทาง
                      </button>
                    )}
                  </div>
                  <select
                    value={channel}
                    onChange={(e) => {
                      const ch = e.target.value;
                      setChannel(ch);
                      setOrderType(ch === "walk_in" ? "walk_in" : "chat");
                    }}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">การส่งมอบ</label>
                  <select
                    value={fulfillmentType}
                    onChange={(e) => setFulfillmentType(e.target.value as FulfillmentType)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="pickup">ลูกค้ามารับเองที่ร้าน</option>
                    <option value="delivery">บริการจัดส่ง (Delivery)</option>
                  </select>
                </div>
              </div>

              {/* Inline Add Channel for Owner */}
              {showAddChannelInline && (
                <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อช่องทางใหม่ เช่น TikTok Shop"
                    value={newInlineChannel}
                    onChange={(e) => setNewInlineChannel(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineChannel}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold"
                  >
                    บันทึก
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ค้นหาและกรอกข้อมูลลูกค้า */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <label className="font-semibold text-xs text-stone-700">ข้อมูลลูกค้า</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="ค้นหาลูกค้าเก่าด้วยชื่อ หรือ เบอร์โทร..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
              {filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="p-2.5 text-xs hover:bg-rose-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                    >
                      <span className="font-semibold text-stone-800">{c.name}</span>
                      <span className="text-stone-500">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="ชื่อลูกค้า (เช่น คุณมินต์)"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (!recipientName) setRecipientName(e.target.value);
                }}
                className="px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="เบอร์โทรศัพท์ (ถ้ามี)"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (!recipientPhone) setRecipientPhone(e.target.value);
                }}
                className="px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* เลือกสินค้าจากแคตตาล็อก */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="font-semibold text-xs text-stone-700">เลือกสินค้า/ดอกไม้สด</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddProduct(p)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-left transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] text-rose-600 font-semibold block">
                      {p.type === "bouquet" ? "💐 ช่อ" : "🌸 ดอกเดี่ยว"}
                    </span>
                    <span className="text-xs font-semibold text-stone-800 line-clamp-1">
                      {p.name}
                    </span>
                    {p.size && (
                      <span className="text-[10px] text-stone-400 block">{p.size}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-stone-900 mt-1">
                    {formatCurrency(p.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* สินค้าแบบกำหนดเอง */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-700">หรือระบุรายการตามใจชอบ</span>
            <div className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="ชื่อรายการ (เช่น ดอกกุหลาบ 10 ก้าน)"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="flex-1 px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="ราคา (บาท)"
                value={customItemPrice || ""}
                onChange={(e) => setCustomItemPrice(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="px-3 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800"
              >
                เพิ่ม
              </button>
            </div>
          </div>

          {/* รายการที่เลือกแล้ว */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
              <span>รายการที่เลือก ({selectedItems.length})</span>
              <span>รวม {formatCurrency(subtotal)}</span>
            </div>

            {selectedItems.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2 text-center bg-stone-50 rounded-xl">
                ยังไม่ได้เลือกสินค้า
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-stone-800 block">
                        {item.name_snapshot}
                      </span>
                      <span className="text-stone-500">
                        {formatCurrency(item.unit_price)} × {item.qty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">
                        {formatCurrency(item.unit_price * item.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isQuickSale && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-rose-600 disabled:bg-stone-300 text-white font-semibold rounded-xl text-sm shadow-sm"
              >
                ต่อไป: จัดส่ง & กำหนดสถานะ
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: การจัดส่ง, สถานะ และ ข้อความการ์ด */}
      {!isQuickSale && currentStep === 2 && (
        <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm">
          {/* กำหนดสถานะเมื่อเปิดออเดอร์: ให้เป็นสถานะส่ง หรือ ส่งแล้ว ได้ทันที */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-stone-800 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-rose-600" />
              <span>สถานะออเดอร์เริ่มต้น (เลือกสถานะส่ง / ส่งแล้ว ได้ทันที)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInitialStatus("ready")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  initialStatus === "ready"
                    ? "bg-blue-50 border-blue-400 text-blue-700 font-bold ring-2 ring-blue-300/30"
                    : "border-stone-200 text-stone-600"
                }`}
              >
                📦 รอส่ง / พร้อมรับ
              </button>
              <button
                type="button"
                onClick={() => setInitialStatus("done")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  initialStatus === "done"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold ring-2 ring-emerald-300/30"
                    : "border-stone-200 text-stone-600"
                }`}
              >
                ✅ ส่งมอบแล้ว
              </button>
              <button
                type="button"
                onClick={() => setInitialStatus("arranging")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  initialStatus === "arranging"
                    ? "bg-purple-50 border-purple-400 text-purple-700 font-bold ring-2 ring-purple-300/30"
                    : "border-stone-200 text-stone-600"
                }`}
              >
                💐 กำลังจัดช่อ
              </button>
            </div>
          </div>

          {/* วันและเวลานัดหมาย */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-stone-100">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>วันที่นัดส่ง/รับ</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>เวลานัดหมาย</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* ข้อมูลผู้รับและที่อยู่จัดส่ง */}
          {fulfillmentType === "delivery" && (
            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <label className="font-semibold text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>ข้อมูลปลายทางจัดส่ง</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อผู้รับ"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="เบอร์โทรผู้รับ"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <textarea
                placeholder="ที่อยู่จัดส่งโดยละเอียด (ชื่ออาคาร/หมู่บ้าน, ซอย, ชั้น, เลขห้อง)"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* ข้อความในการ์ดอวยพร */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
            <label className="font-semibold text-stone-700 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>ข้อความในการ์ดอวยพร (ถ้ามี)</span>
            </label>
            <textarea
              placeholder="เช่น Happy Birthday นะคะ ขอให้มีความสุขมากๆ..."
              rows={2}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              className="w-full px-3 py-2 border border-amber-200 bg-amber-50/40 rounded-xl focus:ring-2 focus:ring-amber-500 text-amber-950"
            />
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 text-xs font-semibold"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl text-sm shadow-sm"
            >
              ต่อไป: สรุป & ออกบิล
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: สรุปยอด, ชำระเงิน และ ออกบิล */}
      {(isQuickSale || currentStep === 3) && (
        <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>ราคารวมสินค้า</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-stone-600">ส่วนลด</span>
              <div className="flex items-center gap-1">
                <span className="text-stone-400">฿</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={discount || ""}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-stone-200 rounded-lg text-right font-medium"
                />
              </div>
            </div>

            {fulfillmentType === "delivery" && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-600">ค่าจัดส่ง</span>
                <div className="flex items-center gap-1">
                  <span className="text-stone-400">฿</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={deliveryFee || ""}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-stone-200 rounded-lg text-right font-medium"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-bold text-sm text-stone-900">ยอดสุทธิ</span>
              <span className="text-xl font-bold text-rose-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* การชำระเงิน */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
            <label className="font-semibold text-stone-700">การรับชำระเงิน</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "full", label: "จ่ายครบเต็มจำนวน" },
                { id: "deposit", label: "มัดจำบางส่วน" },
                { id: "unpaid", label: "ยังไม่จ่าย" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPaymentOption(opt.id as any);
                    if (opt.id === "full") setPaidAmount(total);
                    if (opt.id === "deposit") setPaidAmount(Math.round(total / 2));
                  }}
                  className={`py-2 px-1 rounded-xl border font-semibold text-center transition-all ${
                    paymentOption === opt.id
                      ? "bg-rose-50 border-rose-400 text-rose-700"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {paymentOption !== "unpaid" && (
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-stone-700">วิธีชำระ</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "promptpay", label: "พร้อมเพย์ QR", icon: QrCode },
                    { id: "cash", label: "เงินสด", icon: DollarSign },
                    { id: "transfer", label: "โอนเงิน", icon: CreditCard },
                    { id: "card", label: "บัตรเครดิต", icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
                          paymentMethod === m.id
                            ? "bg-rose-50 border-rose-400 text-rose-700 font-semibold"
                            : "border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Save & Print Bill */}
          <div className="pt-3 flex flex-col sm:flex-row gap-2">
            {!isQuickSale && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-4 border border-stone-200 rounded-xl text-stone-600 text-xs font-semibold"
              >
                ย้อนกลับ
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmitOrder(false)}
              className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{isQuickSale ? "บันทึกการขาย" : "บันทึกออเดอร์"}</span>
            </button>

            {/* ออกบิล / พิมพ์ใบเสร็จทันที */}
            <button
              type="button"
              onClick={() => handleSubmitOrder(true)}
              className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>บันทึก & ออกบิลใบเสร็จ</span>
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal if triggered */}
      {createdOrderForInvoice && (
        <OrderInvoiceModal
          order={createdOrderForInvoice}
          shop={shop}
          onClose={() => router.push(`/orders/${createdOrderForInvoice.id}`)}
        />
      )}
    </div>
  );
}
