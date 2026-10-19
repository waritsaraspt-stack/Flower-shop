"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  formatCurrency,
  formatThaiDate,
  FULFILLMENT_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  CHANNEL_MAP,
} from "@/lib/utils";
import { OrderInvoiceModal } from "@/components/order/OrderInvoiceModal";
import { DeleteOrderModal } from "@/components/order/DeleteOrderModal";
import { Search, Plus, Filter, Calendar, ChevronRight, FileText, History, Trash2, RotateCcw, Ban, AlertTriangle } from "lucide-react";

export default function OrdersListPage() {
  const { orders, shop, role, deleteOrder, restoreOrder, showFeedback } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterFulfillment, setFilterFulfillment] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const cancelledOrders = orders.filter((o) => o.is_cancelled || o.fulfillment_status === "cancelled");
  const activeOrders = orders.filter((o) => !o.is_cancelled && o.fulfillment_status !== "cancelled");

  const baseList = filterDateRange === "cancelled" ? cancelledOrders : activeOrders;

  const filtered = baseList.filter((o) => {
    // Search
    const matchesSearch =
      o.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.recipient_name && o.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.recipient_phone && o.recipient_phone.includes(searchTerm));

    // Date Range History
    let matchesDate = true;
    if (filterDateRange === "today") {
      matchesDate = o.created_at.startsWith(todayStr);
    } else if (filterDateRange === "month") {
      const thisMonth = now.toISOString().slice(0, 7);
      matchesDate = o.created_at.startsWith(thisMonth);
    }

    // Status
    const matchesFulfillment =
      filterFulfillment === "all" || o.fulfillment_status === filterFulfillment;

    const matchesPayment = filterPayment === "all" || o.payment_status === filterPayment;

    return matchesSearch && matchesDate && matchesFulfillment && matchesPayment;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>ประวัติออเดอร์และการซื้อขาย</span>
            <span className="text-xs bg-stone-100 text-stone-700 font-semibold px-2.5 py-0.5 rounded-full">
              {filtered.length} บิล
            </span>
          </h1>
          <p className="text-xs text-stone-500">
            ดูประวัติย้อนหลัง, ตรวจสอบสถานะการส่งมอบ และออกบิลใบเสร็จ
          </p>
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เปิดบิลใหม่</span>
        </Link>
      </div>

      {/* Date Range Tabs for History */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: "all", label: "ประวัติทั้งหมด" },
          { id: "today", label: "เฉพาะวันนี้" },
          { id: "month", label: "เดือนนี้" },
          { id: "cancelled", label: `บิลที่ยกเลิกแล้ว (${cancelledOrders.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterDateRange(tab.id)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterDateRange === tab.id
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="ค้นหาด้วยเลขที่บิล, ชื่อลูกค้า, หรือเบอร์โทร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filterFulfillment}
            onChange={(e) => setFilterFulfillment(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
          >
            <option value="all">สถานะส่งมอบทั้งหมด</option>
            <option value="done">ส่งแล้ว</option>
            <option value="ready">รอส่ง / พร้อมรับ</option>
            <option value="arranging">กำลังจัดช่อ</option>
            <option value="new">ออเดอร์ใหม่</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
          >
            <option value="all">สถานะเงินทั้งหมด</option>
            <option value="paid">จ่ายแล้ว</option>
            <option value="partial">มัดจำแล้ว</option>
            <option value="unpaid">ยังไม่จ่าย</option>
          </select>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-xs">
            ไม่พบออเดอร์ที่ตรงกับเงื่อนไขค้นหา
          </div>
        ) : (
          filtered.map((order) => {
            const fStatus = FULFILLMENT_STATUS_MAP[order.fulfillment_status] || FULFILLMENT_STATUS_MAP.new;
            const pStatus = PAYMENT_STATUS_MAP[order.payment_status] || PAYMENT_STATUS_MAP.unpaid;
            const channel = CHANNEL_MAP[order.channel] || { label: order.channel, badge: "bg-stone-100 text-stone-800" };

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 hover:border-rose-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-bold text-stone-900 hover:text-rose-600 transition-colors text-sm"
                    >
                      #{order.order_no}
                    </Link>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${channel.badge}`}>
                      {channel.label}
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {order.recipient_name || order.customer?.name}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-stone-400">
                      <Calendar className="w-3.5 h-3.5" />
                      เปิดบิล: {formatThaiDate(order.created_at)}
                    </span>
                    <span>•</span>
                    <span className="text-rose-600 font-medium">
                      นัดส่ง: {formatThaiDate(order.due_at)}
                    </span>
                  </div>

                  {/* Summary of items in order */}
                  <div className="text-xs text-stone-600">
                    {order.items?.map((i) => `${i.name_snapshot} (x${i.qty})`).join(", ")}
                  </div>

                  {/* Audit cancellation info banner */}
                  {(order.is_cancelled || order.fulfillment_status === "cancelled") && (
                    <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded text-[10px]">
                          บิลถูกยกเลิก
                        </span>
                        <span>
                          <strong>ผู้ยกเลิก:</strong> {order.cancelled_by_name || "เจ้าของร้าน"}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>เหตุผล:</strong> {order.cancellation_reason || "ยกเลิกออเดอร์"}
                        </span>
                      </div>

                      {role === "owner" && (
                        <button
                          type="button"
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
                          className="px-2 py-0.5 bg-white border border-rose-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-lg font-bold text-[10px] text-stone-700 shrink-0 flex items-center gap-1 shadow-2xs transition-all"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-600" />
                          <span>กู้คืนบิล</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-stone-900 text-sm block">
                      {formatCurrency(order.total)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pStatus.bg} ${pStatus.text} ${pStatus.border}`}>
                        {pStatus.label}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${fStatus.bg} ${fStatus.text} ${fStatus.border}`}>
                        {order.fulfillment_status === "done" ? "ส่งแล้ว" : order.fulfillment_status === "ready" ? "รอส่ง" : fStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ปุ่มออกบิล / ใบเสร็จ */}
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1 transition-all"
                      title="ออกบิล / พิมพ์ใบเสร็จ"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>ออกบิล</span>
                    </button>

                    {role === "owner" && (
                      <button
                        onClick={() => setOrderToDelete(order)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="ลบบิล / ยกเลิกออเดอร์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <Link
                      href={`/orders/${order.id}`}
                      className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-50"
                      title="ดูรายละเอียด"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          shop={shop}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Delete / Cancel Order Modal */}
      {orderToDelete && (
        <DeleteOrderModal
          order={orderToDelete}
          isOpen={!!orderToDelete}
          onClose={() => setOrderToDelete(null)}
          onConfirmCancel={(id, hard, reason) => {
            const res = deleteOrder(id, hard, reason);
            showFeedback({
              type: "danger",
              title: hard ? "ลบบิลถาวรสำเร็จ" : "ยกเลิกบิลเรียบร้อย",
              message: res.message,
            });
          }}
        />
      )}
    </div>
  );
}
