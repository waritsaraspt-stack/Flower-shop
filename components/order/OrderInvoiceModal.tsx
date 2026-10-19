"use client";

import React from "react";
import { Order, Shop } from "@/lib/types";
import { formatCurrency, formatThaiDate } from "@/lib/utils";
import { Printer, X, CheckCircle, QrCode } from "lucide-react";

interface OrderInvoiceModalProps {
  order: Order;
  shop: Shop;
  onClose: () => void;
}

export function OrderInvoiceModal({ order, shop, onClose }: OrderInvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, order.total - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-stone-200">
        
        {/* Modal Controls (Hidden when printing) */}
        <div className="no-print bg-stone-100/80 px-5 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 text-sm">ใบเสร็จรับเงิน / ใบส่งสินค้า</span>
            <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
              #{order.order_no}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์บิล / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printableInvoice" className="p-6 sm:p-8 space-y-5 text-stone-800 text-xs bg-white">
          
          {/* Shop Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-4 gap-4">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-stone-900 leading-tight">
                {shop.name}
              </h2>
              <p className="text-[11px] text-stone-500 mt-1 max-w-xs leading-relaxed">
                {shop.address || "123/45 ซอยสุขุมวิท 21 เขตคลองเตย กรุงเทพฯ 10110"}
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5 font-medium">
                โทร: {shop.phone || "081-234-5678"} • พร้อมเพย์: {shop.promptpay_number || "0812345678"}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block font-extrabold text-sm sm:text-base text-rose-600 uppercase tracking-wide">
                ใบเสร็จรับเงิน
              </span>
              <p className="text-[10px] text-stone-400">RECEIPT / DELIVERY ORDER</p>
              <p className="font-bold text-stone-900 text-xs mt-1">เลขที่ #{order.order_no}</p>
              <p className="text-[10px] text-stone-500">{formatThaiDate(order.created_at)}</p>
            </div>
          </div>

          {/* Customer & Recipient Grid */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50/70 p-3 rounded-xl border border-stone-100 text-[11px]">
            <div className="space-y-0.5">
              <span className="text-stone-400 block font-semibold">ข้อมูลลูกค้า (ผู้สั่ง)</span>
              <p className="font-bold text-stone-800 text-xs">{order.customer?.name || "ลูกค้าทั่วไป"}</p>
              <p className="text-stone-600">โทร: {order.customer?.phone || "-"}</p>
              <p className="text-stone-500">ช่องทาง: {order.channel}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-stone-400 block font-semibold">ผู้รับ & สถานที่ส่งมอบ</span>
              <p className="font-bold text-stone-800 text-xs">{order.recipient_name || order.customer?.name || "-"}</p>
              <p className="text-stone-600">โทร: {order.recipient_phone || "-"}</p>
              <p className="text-stone-600 leading-tight">
                {order.fulfillment_type === "delivery" ? order.address || "จัดส่งตามที่อยู่" : "รับเองหน้าร้าน"}
              </p>
              <p className="text-rose-600 font-medium">กำหนดส่งมอบ: {formatThaiDate(order.due_at)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-2 px-3 w-8 text-center">#</th>
                  <th className="py-2 px-3">รายการดอกไม้ / สินค้า</th>
                  <th className="py-2 px-3 text-center w-14">จำนวน</th>
                  <th className="py-2 px-3 text-right w-20">ราคา/หน่วย</th>
                  <th className="py-2 px-3 text-right w-20">รวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 text-center text-stone-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-stone-800">
                      <div>{item.name_snapshot}</div>
                      {item.note && <div className="text-[10px] text-stone-400 font-normal">{item.note}</div>}
                    </td>
                    <td className="py-2 px-3 text-center text-stone-600">{item.qty}</td>
                    <td className="py-2 px-3 text-right text-stone-600">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 px-3 text-right font-bold text-stone-900">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="flex justify-between items-start pt-1 gap-4">
            {/* Card Greeting Note if available */}
            <div className="flex-1 max-w-xs space-y-1">
              {order.card_message && (
                <div className="bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl text-[10px] text-amber-950">
                  <span className="font-bold block text-amber-800">💌 ข้อความแนบการ์ดอวยพร:</span>
                  <p className="italic mt-0.5">"{order.card_message}"</p>
                </div>
              )}
              {order.note && (
                <p className="text-[10px] text-stone-500">
                  <span className="font-medium text-stone-700">หมายเหตุ:</span> {order.note}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="w-48 space-y-1 text-right text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>ราคารวมสินค้า:</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>ส่วนลด:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>ค่าจัดส่ง:</span>
                  <span>+{formatCurrency(order.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-1 text-sm">
                <span>ยอดสุทธิ:</span>
                <span className="text-rose-600">{formatCurrency(order.total)}</span>
              </div>

              {/* Payment status badge */}
              <div className="pt-2 text-right">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                  {order.payment_status === "paid" ? "ชำระเงินครบถ้วนแล้ว" : order.payment_status === "partial" ? `มัดจำแล้ว (ค้าง ${formatCurrency(remaining)})` : "ยังไม่ชำระเงิน"}
                </span>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {(order.payments || []).length > 0 ? `วิธี: ${(order.payments || [])[0].method}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Footer & Signature lines */}
          <div className="pt-4 border-t border-dashed border-stone-300 grid grid-cols-2 text-center text-[10px] text-stone-500 gap-8">
            <div className="space-y-6">
              <p>ผู้ส่งมอบ / ช่างจัดดอกไม้</p>
              <div className="border-b border-stone-300 w-32 mx-auto"></div>
              <p>วันที่ .... / .... / ........</p>
            </div>
            <div className="space-y-6">
              <p>ผู้รับสินค้า / ลูกค้า</p>
              <div className="border-b border-stone-300 w-32 mx-auto"></div>
              <p>วันที่ .... / .... / ........</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-400 pt-1">
            🌸 ขอบพระคุณที่ไว้วางใจใช้บริการ {shop.name} 🌸
          </div>
        </div>
      </div>
    </div>
  );
}
