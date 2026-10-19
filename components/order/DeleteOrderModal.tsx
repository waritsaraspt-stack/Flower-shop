"use client";

import React, { useState } from "react";
import { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { X, AlertTriangle, Trash2, History, RotateCcw } from "lucide-react";

interface DeleteOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: string, hardDelete: boolean, reason: string) => void;
}

export function DeleteOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmCancel,
}: DeleteOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("ลูกค้าขอยกเลิกออเดอร์");
  const [customReason, setCustomReason] = useState<string>("");
  const [isHardDelete, setIsHardDelete] = useState<boolean>(false);

  if (!isOpen) return null;

  const finalReason = selectedReason === "อื่นๆ" ? (customReason.trim() || "ไม่ระบุเหตุผล") : selectedReason;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancel(order.id, isHardDelete, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">ยกเลิกหรือลบบิล #{order.order_no}</h3>
              <p className="text-[11px] text-stone-500">
                ยอดรวม {formatCurrency(order.total)} • ลูกค้า: {order.recipient_name || order.customer?.name || "ทั่วไป"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700 block">
              ระบุเหตุผลในการยกเลิกหรือลบรายการ <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {[
                "ลูกค้าขอยกเลิกออเดอร์",
                "คีย์ข้อมูลหรือเปิดบิลซ้ำ / ข้อมูลผิดพลาด",
                "สินค้าหมด / ดอกไม้ไม่พอจัด",
                "ลูกค้าไม่สะดวกชำระเงิน",
                "อื่นๆ",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "border-rose-400 bg-rose-50/60 font-semibold text-rose-900 ring-1 ring-rose-400/30"
                      : "border-stone-200 hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "อื่นๆ" && (
              <input
                type="text"
                placeholder="พิมพ์ระบุเหตุผลเพิ่มเติม..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs"
                autoFocus
              />
            )}
          </div>

          {/* Delete mode options */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
            <span className="font-bold text-stone-800 block text-[11px]">รูปแบบการดำเนินการ:</span>
            
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                checked={!isHardDelete}
                onChange={() => setIsHardDelete(false)}
                className="mt-0.5 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="font-semibold text-stone-900 block">
                  ยกเลิกบิลและเก็บบันทึกประวัติ (แนะนำ)
                </span>
                <span className="text-[11px] text-stone-500 block leading-tight">
                  บิลจะถูกย้ายไปอยู่ในแท็บ "บิลที่ยกเลิกแล้ว" ไม่นำมาคิดยอดขายรวม แต่ยังสามารถดูประวัติย้อนหลังและกู้คืนได้ ป้องกันการทุจริตหน้าร้าน
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer pt-1 border-t border-stone-200/60">
              <input
                type="radio"
                name="deleteMode"
                checked={isHardDelete}
                onChange={() => setIsHardDelete(true)}
                className="mt-0.5 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="font-semibold text-rose-700 block">
                  ลบออกจากระบบอย่างถาวร (Hard Delete)
                </span>
                <span className="text-[11px] text-stone-500 block leading-tight">
                  ข้อมูลบิลนี้จะถูกลบออกจากฐานข้อมูลทันที ไม่สามารถกู้คืนได้
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl font-semibold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                isHardDelete
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHardDelete ? "ยืนยันลบถาวร" : "ยืนยันยกเลิกบิล"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
