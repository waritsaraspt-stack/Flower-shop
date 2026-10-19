"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  formatCurrency,
  formatTimeOnly,
  formatThaiDate,
  FULFILLMENT_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  CHANNEL_MAP,
} from "@/lib/utils";
import { FulfillmentStatus, PaymentMethod } from "@/lib/types";
import { OrderInvoiceModal } from "@/components/order/OrderInvoiceModal";
import {
  Clock,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  HeartHandshake,
  DollarSign,
  Plus,
  CreditCard,
  QrCode,
  X,
  ChevronRight,
  Filter,
  Check,
  EyeOff,
  Printer,
  FileText,
} from "lucide-react";

export default function TodayPage() {
  const { role, shop, orders, updateFulfillmentStatus, addPayment } = useStore();
  const [filterTab, setFilterTab] = useState<string>("all");
  const [paymentModalOrder, setPaymentModalOrder] = useState<any | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("promptpay");
  const [paymentNote, setPaymentNote] = useState<string>("");

  // คำนวณสรุปยอดประจำวัน
  const totalOrders = orders.length;
  const unpaidOrders = orders.filter((o) => o.payment_status === "unpaid" || o.payment_status === "partial");
  const arrangingOrders = orders.filter((o) => o.fulfillment_status === "arranging");
  const readyOrders = orders.filter((o) => o.fulfillment_status === "ready");
  const doneOrders = orders.filter((o) => o.fulfillment_status === "done");

  // ยอดเงินรวมประจำวัน (เฉพาะ Owner)
  const todayRevenue = orders.reduce((sum, o) => {
    const paidInOrder = (o.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
    return sum + paidInOrder;
  }, 0);

  // กรองรายการตามแท็บ
  const filteredOrders = orders.filter((o) => {
    if (filterTab === "unpaid") return o.payment_status === "unpaid" || o.payment_status === "partial";
    if (filterTab === "arranging") return o.fulfillment_status === "arranging";
    if (filterTab === "ready") return o.fulfillment_status === "ready";
    if (filterTab === "done") return o.fulfillment_status === "done";
    return true;
  });

  const handleOpenPayment = (order: any) => {
    const alreadyPaid = (order.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    const remaining = Math.max(0, order.total - alreadyPaid);
    setPaymentModalOrder(order);
    setPaymentAmount(remaining);
    setPaymentMethod("promptpay");
    setPaymentNote("");
  };

  const handleConfirmPayment = () => {
    if (!paymentModalOrder || paymentAmount <= 0) return;
    addPayment(paymentModalOrder.id, paymentAmount, paymentMethod, paymentNote);
    setPaymentModalOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 space-y-5">
      {/* 1. Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>ภาพรวมวันนี้ (Today)</span>
            <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full">
              {totalOrders} ออเดอร์
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            คิวงานช่อดอกไม้ จัดส่ง และรายการดอกไม้สด
          </p>
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เปิดบิลใหม่</span>
        </Link>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* การ์ดยอดเงิน (แสดงเฉพาะ Owner เพื่อความปลอดภัย) */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-rose-50 to-orange-50/40 border border-rose-200/70 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
            <span>ยอดรับเงินวันนี้</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="my-1.5">
            {role === "owner" ? (
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                {formatCurrency(todayRevenue)}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-stone-400 py-1">
                <EyeOff className="w-4 h-4" />
                <span className="text-xs font-semibold">ซ่อนเฉพาะเจ้าของ</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-rose-600/80">
            {role === "owner" ? "นับรวมเงินสด & พร้อมเพย์" : "โหมดพนักงาน (ความปลอดภัย)"}
          </div>
        </div>

        {/* ยังไม่จ่าย */}
        <div
          onClick={() => setFilterTab("unpaid")}
          className={`cursor-pointer border p-3.5 rounded-2xl flex flex-col justify-between transition-all ${
            filterTab === "unpaid"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20"
              : "bg-white border-stone-200/80 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
            <span>ค้างชำระ/มัดจำ</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-1.5">
            <span className="text-xl sm:text-2xl font-bold text-rose-600">
              {unpaidOrders.length}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">รอเคลียร์ยอด</div>
        </div>

        {/* กำลังจัดช่อ */}
        <div
          onClick={() => setFilterTab("arranging")}
          className={`cursor-pointer border p-3.5 rounded-2xl flex flex-col justify-between transition-all ${
            filterTab === "arranging"
              ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20"
              : "bg-white border-stone-200/80 hover:border-purple-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-700 font-medium">
            <span>กำลังจัดช่อ</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-1.5">
            <span className="text-xl sm:text-2xl font-bold text-purple-700">
              {arrangingOrders.length}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">ช่างกำลังจัดทำ</div>
        </div>

        {/* รอส่ง / พร้อมรับ */}
        <div
          onClick={() => setFilterTab("ready")}
          className={`cursor-pointer border p-3.5 rounded-2xl flex flex-col justify-between transition-all ${
            filterTab === "ready"
              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20"
              : "bg-white border-stone-200/80 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-700 font-medium">
            <span>รอส่ง / พร้อมรับ</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-1.5">
            <span className="text-xl sm:text-2xl font-bold text-blue-700">
              {readyOrders.length}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">จัดเสร็จแล้วรอส่ง</div>
        </div>

        {/* ส่งแล้ว */}
        <div
          onClick={() => setFilterTab("done")}
          className={`cursor-pointer border p-3.5 rounded-2xl flex flex-col justify-between transition-all ${
            filterTab === "done"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20"
              : "bg-white border-stone-200/80 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>ส่งแล้ว / สำเร็จ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700">
              {doneOrders.length}
            </span>
          </div>
          <div className="text-[11px] text-stone-500">ส่งมอบเรียบร้อย</div>
        </div>
      </div>

      {/* 3. Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium no-scrollbar">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            filterTab === "all"
              ? "bg-stone-900 text-white font-semibold shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          ทั้งหมด ({totalOrders})
        </button>
        <button
          onClick={() => setFilterTab("unpaid")}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            filterTab === "unpaid"
              ? "bg-rose-600 text-white font-semibold shadow-sm"
              : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
          }`}
        >
          🚨 ยังไม่จ่าย ({unpaidOrders.length})
        </button>
        <button
          onClick={() => setFilterTab("arranging")}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            filterTab === "arranging"
              ? "bg-purple-600 text-white font-semibold shadow-sm"
              : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
          }`}
        >
          💐 กำลังจัดช่อ ({arrangingOrders.length})
        </button>
        <button
          onClick={() => setFilterTab("ready")}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            filterTab === "ready"
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
          }`}
        >
          📦 รอส่ง / พร้อมรับ ({readyOrders.length})
        </button>
        <button
          onClick={() => setFilterTab("done")}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            filterTab === "done"
              ? "bg-emerald-600 text-white font-semibold shadow-sm"
              : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          ✅ ส่งแล้ว ({doneOrders.length})
        </button>
      </div>

      {/* 4. Orders List Cards */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-700">ไม่มีออเดอร์ในหมวดนี้</p>
            <p className="text-xs text-stone-400">
              เลือกดูแท็บอื่น หรือกดปุ่ม "เปิดบิลใหม่" เพื่อเริ่มรับออเดอร์
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const fStatus = FULFILLMENT_STATUS_MAP[order.fulfillment_status] || FULFILLMENT_STATUS_MAP.new;
            const pStatus = PAYMENT_STATUS_MAP[order.payment_status] || PAYMENT_STATUS_MAP.unpaid;
            const channel = CHANNEL_MAP[order.channel] || { label: order.channel, badge: "bg-stone-100 text-stone-800" };

            const paidAmount = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
            const remainingAmount = Math.max(0, order.total - paidAmount);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Card Top: Order No, Channel, Status Badges */}
                <div className="p-4 sm:p-5 pb-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 bg-stone-50/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-bold text-stone-900 hover:text-rose-600 transition-colors text-base"
                    >
                      #{order.order_no}
                    </Link>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${channel.badge}`}>
                      {channel.label}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      นัดส่ง: {formatThaiDate(order.due_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* สถานะเงิน */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${pStatus.bg} ${pStatus.text} ${pStatus.border}`}
                    >
                      {pStatus.label}
                    </span>
                    {/* สถานะจัดส่ง */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${fStatus.bg} ${fStatus.text} ${fStatus.border}`}
                    >
                      {order.fulfillment_status === "done"
                        ? "ส่งแล้ว"
                        : order.fulfillment_status === "ready"
                        ? "รอส่ง"
                        : fStatus.label}
                    </span>
                  </div>
                </div>

                {/* Card Body: Items, Recipient, Card Message */}
                <div className="p-4 sm:p-5 space-y-3 flex-1">
                  {/* Customer & Recipient */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800">
                          {order.recipient_name || order.customer?.name || "ไม่ระบุชื่อ"}
                        </span>
                        {order.recipient_phone && (
                          <a
                            href={`tel:${order.recipient_phone}`}
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3" />
                            {order.recipient_phone}
                          </a>
                        )}
                      </div>
                      {order.address && (
                        <p className="text-xs text-stone-500 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>{order.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right sm:self-start">
                      <span className="text-xs text-stone-400 block">ยอดสุทธิ</span>
                      <span className="text-lg font-bold text-stone-900">
                        {formatCurrency(order.total)}
                      </span>
                      {order.payment_status === "partial" && (
                        <span className="text-[11px] text-amber-600 block">
                          ค้าง {formatCurrency(remainingAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/50 space-y-1.5">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-stone-800 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span>{item.name_snapshot}</span>
                          <span className="text-stone-400">x{item.qty}</span>
                        </div>
                        <span className="text-stone-600 font-medium">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Message Preview */}
                  {order.card_message && (
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 space-y-0.5">
                      <div className="flex items-center gap-1 font-semibold text-amber-800 text-[11px]">
                        <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                        <span>ข้อความการ์ดอวยพร:</span>
                      </div>
                      <p className="italic pl-1">"{order.card_message}"</p>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 py-1"
                    >
                      <span>รายละเอียด</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* ปุ่มออกบิลด่วน */}
                    <button
                      onClick={() => setInvoiceModalOrder(order)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 bg-white border border-rose-200 px-2.5 py-1 rounded-lg"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>ออกบิล</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* ปุ่มรับเงิน ถ้ายังไม่จ่ายหรือมัดจำ */}
                    {order.payment_status !== "paid" && (
                      <button
                        onClick={() => handleOpenPayment(order)}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>รับเงิน ({formatCurrency(remainingAmount)})</span>
                      </button>
                    )}

                    {/* ปุ่มสถานะ: ส่ง / ส่งแล้ว */}
                    {order.fulfillment_status === "new" && (
                      <button
                        onClick={() => updateFulfillmentStatus(order.id, "ready")}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>เตรียมส่ง</span>
                      </button>
                    )}

                    {order.fulfillment_status === "arranging" && (
                      <button
                        onClick={() => updateFulfillmentStatus(order.id, "ready")}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>จัดเสร็จ รอส่ง</span>
                      </button>
                    )}

                    {order.fulfillment_status === "ready" && (
                      <button
                        onClick={() => updateFulfillmentStatus(order.id, "done")}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ส่งแล้ว</span>
                      </button>
                    )}

                    {order.fulfillment_status === "done" && (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl">
                        <Check className="w-3.5 h-3.5" />
                        <span>ส่งแล้วเรียบร้อย</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  บันทึกรับเงิน #{paymentModalOrder.order_no}
                </h3>
                <p className="text-xs text-stone-500">
                  ยอดรวมทั้งบิล {formatCurrency(paymentModalOrder.total)}
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">จำนวนเงินที่ได้รับ (บาท)</label>
              <input
                type="number"
                inputMode="numeric"
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-lg font-bold border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">วิธีชำระเงิน</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "promptpay", label: "พร้อมเพย์ QR", icon: QrCode },
                  { id: "cash", label: "เงินสดหน้าร้าน", icon: DollarSign },
                  { id: "transfer", label: "โอนผ่านธนาคาร", icon: CreditCard },
                  { id: "card", label: "บัตรเครดิต", icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === m.id
                          ? "bg-rose-50 border-rose-400 text-rose-700 font-semibold"
                          : "border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm"
              >
                ยืนยันรับเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal for Quick Bill Printing */}
      {invoiceModalOrder && (
        <OrderInvoiceModal
          order={invoiceModalOrder}
          shop={shop}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}
    </div>
  );
}
