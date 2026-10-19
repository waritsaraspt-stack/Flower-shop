"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  formatCurrency,
  formatThaiDate,
  FULFILLMENT_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  CHANNEL_MAP,
} from "@/lib/utils";
import { FulfillmentStatus, PaymentMethod } from "@/lib/types";
import { OrderInvoiceModal } from "@/components/order/OrderInvoiceModal";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  HeartHandshake,
  DollarSign,
  QrCode,
  CreditCard,
  X,
  Printer,
  History,
  Check,
  UserCheck,
  FileText,
  User,
  Trash2,
  RotateCcw,
  Ban,
} from "lucide-react";
import { DeleteOrderModal } from "@/components/order/DeleteOrderModal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { getOrderById, updateFulfillmentStatus, addPayment, shop, role, deleteOrder, restoreOrder, showFeedback } = useStore();

  const order = getOrderById(orderId);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("promptpay");
  const [paymentNote, setPaymentNote] = useState<string>("");

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-stone-500 text-sm">ไม่พบข้อมูลออเดอร์นี้ในระบบ</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const fStatus = FULFILLMENT_STATUS_MAP[order.fulfillment_status] || FULFILLMENT_STATUS_MAP.new;
  const pStatus = PAYMENT_STATUS_MAP[order.payment_status] || PAYMENT_STATUS_MAP.unpaid;
  const channel = CHANNEL_MAP[order.channel] || { label: order.channel, badge: "bg-stone-100 text-stone-800" };

  const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, order.total - totalPaid);

  const handleOpenPayment = () => {
    setPaymentAmount(remaining);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (paymentAmount <= 0) return;
    addPayment(order.id, paymentAmount, paymentMethod, paymentNote);
    setPaymentModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      {/* Top Bar with Print Bill action */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium py-1 px-2 rounded-lg hover:bg-stone-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้ารายการ</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-900">#{order.order_no}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${channel.badge}`}>
            {channel.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* ปุ่มออกบิล / พิมพ์ใบเสร็จ */}
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ออกบิล / พิมพ์ใบเสร็จ</span>
          </button>

          {role === "owner" && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs"
              title="ลบบิล / ยกเลิกรายการ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบบิล</span>
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Banner */}
      {(order.is_cancelled || order.fulfillment_status === "cancelled") && (
        <div className="bg-rose-50 border border-rose-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-rose-900 block">ออเดอร์นี้ถูกยกเลิกแล้ว</span>
              <span className="text-rose-700 text-[11px]">
                ผู้ยกเลิก: <strong>{order.cancelled_by_name || "เจ้าของร้าน"}</strong> • เหตุผล: <strong>{order.cancellation_reason || "ยกเลิกออเดอร์"}</strong>
              </span>
            </div>
          </div>

          {role === "owner" && (
            <button
              onClick={() => {
                if (confirm(`ต้องการกู้คืนบิล #${order.order_no} กลับสู่ระบบหรือไม่?`)) {
                  const res = restoreOrder(order.id);
                  showFeedback({
                    type: "success",
                    title: "กู้คืนบิลสำเร็จ",
                    message: res.message,
                  });
                }
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>กู้คืนบิลกลับมาใช้งาน</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Large 2-Row Touch Status Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        {/* Row 1: ขั้นตอนการจัดดอกไม้ / ส่งมอบ */}
        <div>
          <span className="text-xs font-semibold text-stone-500 block mb-2">
            1. ขั้นตอนการส่งมอบ (กดเปลี่ยนสถานะได้ทันที)
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {[
              { id: "new", label: "ออเดอร์ใหม่", icon: Clock },
              { id: "arranging", label: "กำลังจัดช่อ", icon: Sparkles },
              { id: "ready", label: "พร้อมรับ/รอส่ง", icon: PackageCheck },
              { id: "done", label: "ส่งมอบแล้ว", icon: CheckCircle2 },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = order.fulfillment_status === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => updateFulfillmentStatus(order.id, step.id as FulfillmentStatus)}
                  className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isActive
                      ? "bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm ring-2 ring-rose-300/30"
                      : "border-stone-200 hover:bg-stone-50 text-stone-600 font-medium"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] sm:text-xs text-center leading-tight">
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: สถานะการชำระเงิน */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs font-semibold text-stone-500 block">
              2. สถานะการชำระเงิน
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${pStatus.bg} ${pStatus.text} ${pStatus.border}`}
              >
                {pStatus.label}
              </span>
              <span className="text-xs text-stone-500">
                รับแล้ว {formatCurrency(totalPaid)} / ยอดสุทธิ {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {order.payment_status !== "paid" && (
            <button
              onClick={handleOpenPayment}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>รับเงินเพิ่ม {formatCurrency(remaining)}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Customer & Delivery Info */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-stone-900 flex items-center justify-between">
          <span>ข้อมูลลูกค้านัดหมาย</span>
          <span className="text-xs font-normal text-rose-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatThaiDate(order.due_at)}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
            <span className="text-stone-400 block font-medium">ผู้สั่งซื้อ</span>
            <span className="font-semibold text-stone-900 block text-sm">
              {order.customer?.name || "ลูกค้าทั่วไป"}
            </span>
            {order.customer?.phone && (
              <a
                href={`tel:${order.customer.phone}`}
                className="inline-flex items-center gap-1 text-emerald-600 font-medium"
              >
                <Phone className="w-3 h-3" />
                {order.customer.phone}
              </a>
            )}
          </div>

          <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
            <span className="text-stone-400 block font-medium">
              ผู้รับ ({order.fulfillment_type === "delivery" ? "บริการส่ง" : "รับเองที่ร้าน"})
            </span>
            <span className="font-semibold text-stone-900 block text-sm">
              {order.recipient_name || order.customer?.name || "-"}
            </span>
            {order.recipient_phone && (
              <a
                href={`tel:${order.recipient_phone}`}
                className="inline-flex items-center gap-1 text-emerald-600 font-medium"
              >
                <Phone className="w-3 h-3" />
                {order.recipient_phone}
              </a>
            )}
            {order.address && (
              <p className="text-stone-500 flex items-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{order.address}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Printable Card Message Preview */}
      {order.card_message && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-5 border border-amber-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <div className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>ข้อความการ์ดอวยพร (พิมพ์ติดช่อ)</span>
            </div>
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="text-[10px] text-amber-700 font-bold hover:underline"
            >
              ดูตัวอย่างในใบเสร็จ
            </button>
          </div>

          <div className="bg-white/90 p-4 rounded-xl border border-amber-200/60 font-serif italic text-sm text-stone-800 leading-relaxed shadow-sm">
            "{order.card_message}"
          </div>
        </div>
      )}

      {/* 4. Order Items & Billing Summary */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">รายการสินค้าและดอกไม้สด</h2>
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>เปิดใบเสร็จรับเงิน</span>
          </button>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-stone-800 block text-sm">
                  {item.name_snapshot}
                </span>
                <span className="text-stone-400">
                  {formatCurrency(item.unit_price)} × {item.qty} {item.note && `• (${item.note})`}
                </span>
              </div>
              <span className="font-bold text-stone-900 text-sm">
                {formatCurrency(item.total_price)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>ราคารวมสินค้า</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>ส่วนลด</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>ค่าจัดส่ง</span>
              <span>+{formatCurrency(order.delivery_fee)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
            <span className="font-bold text-sm text-stone-900">ยอดรวมสุทธิ</span>
            <span className="text-xl font-bold text-rose-600">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Payments History */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-stone-900 flex items-center justify-between">
          <span>ประวัติการรับชำระเงิน</span>
          <span className="text-xs text-stone-500 font-normal">
            {(order.payments || []).length} รายการ
          </span>
        </h2>

        {(order.payments || []).length === 0 ? (
          <p className="text-xs text-stone-400 italic py-2 text-center bg-stone-50 rounded-xl">
            ยังไม่มีการบันทึกชำระเงิน
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {order.payments?.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-3 bg-stone-50 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                    <span>ชำระผ่าน {p.method}</span>
                    <span className="text-emerald-600 text-[11px]">✓ ยืนยันแล้ว</span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {formatThaiDate(p.paid_at)} {p.received_by_name && `• ผู้รับ: ${p.received_by_name}`} {p.note && `• ${p.note}`}
                  </span>
                </div>
                <span className="font-bold text-emerald-700 text-sm">
                  +{formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. ประวัติย้อนหลัง (Timeline Logs / Audit Trail) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
          <History className="w-4 h-4 text-stone-500" />
          <span>ประวัติการดำเนินงานย้อนหลัง (Audit Log)</span>
        </h2>

        {(!order.logs || order.logs.length === 0) ? (
          <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-xl">
            บันทึกการสร้างออเดอร์เมื่อ: {formatThaiDate(order.created_at)}
          </div>
        ) : (
          <div className="relative pl-4 border-l-2 border-stone-200 space-y-3 text-xs">
            {order.logs.map((log, idx) => (
              <div key={log.id || idx} className="relative group">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800 text-[11px]">{log.actor_name || "ระบบ"}</span>
                    <span className="text-[10px] text-stone-400">{formatThaiDate(log.created_at)}</span>
                  </div>
                  <p className="text-stone-600">{log.note || log.action}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">
                รับเงินเพิ่ม #{order.order_no}
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">จำนวนเงินที่รับ (บาท)</label>
              <input
                type="number"
                inputMode="numeric"
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-lg font-bold border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">วิธีชำระ</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "promptpay", label: "พร้อมเพย์ QR" },
                  { id: "cash", label: "เงินสด" },
                  { id: "transfer", label: "โอนเงิน" },
                  { id: "card", label: "บัตรเครดิต" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === m.id
                        ? "bg-rose-50 border-rose-400 text-rose-700 font-semibold"
                        : "border-stone-200 text-stone-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold"
              >
                บันทึกการรับเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal for Printable Receipt */}
      {invoiceModalOpen && (
        <OrderInvoiceModal
          order={order}
          shop={shop}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}

      {/* Delete / Cancel Order Modal */}
      {deleteModalOpen && (
        <DeleteOrderModal
          order={order}
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirmCancel={(id, hard, reason) => {
            const res = deleteOrder(id, hard, reason);
            showFeedback({
              type: "danger",
              title: hard ? "ลบบิลถาวรสำเร็จ" : "ยกเลิกบิลเรียบร้อย",
              message: res.message,
              onConfirm: () => router.push("/orders"),
            });
          }}
        />
      )}
    </div>
  );
}
