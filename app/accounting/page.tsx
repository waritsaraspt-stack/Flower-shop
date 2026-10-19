"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency, formatThaiDate } from "@/lib/utils";
import { PaymentMethod } from "@/lib/types";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Download,
  ShieldAlert,
  Calendar,
  X,
  CreditCard,
  QrCode,
  Wallet,
} from "lucide-react";

export default function AccountingPage() {
  const { role, orders, expenses, addExpense } = useStore();

  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("month");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState<any>("flower_stock");
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>("transfer");
  const [expenseNote, setExpenseNote] = useState<string>("");

  if (role !== "owner") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">เข้าถึงได้เฉพาะเจ้าของร้าน (Owner Only)</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          ตามนโยบายความปลอดภัยและสิทธิ์ RLS พนักงานทั่วไปจะไม่สามารถดูยอดบัญชี รายรับ รายจ่าย
          และกำไรสุทธิของร้านได้
        </p>
      </div>
    );
  }

  // คำนวณรายรับจริงจาก payments
  const totalRevenue = orders.reduce((sum, o) => {
    const paid = (o.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
    return sum + paid;
  }, 0);

  // คำนวณรายจ่ายจาก expenses
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // กำไรสุทธิ
  const netProfit = totalRevenue - totalExpense;

  // รายจ่ายแยกตามหมวด
  const categoryLabels: Record<string, string> = {
    flower_stock: "ซื้อดอกไม้สด (ปากคลอง/สวน)",
    accessories: "อุปกรณ์จัดช่อ (กระดาษ, ริบบิ้น, โอเอซิส)",
    packaging: "บรรจุภัณฑ์และการ์ด",
    transportation: "ค่าจัดส่ง / Grab / ค่าน้ำมัน",
    utilities: "ค่าเช่า / น้ำแข็งแช่ดอกไม้ / สาธารณูปโภค",
    wage: "ค่าจ้างรายวัน",
    other: "อื่นๆ",
  };

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSaveExpense = () => {
    if (expenseAmount <= 0) return;
    addExpense({
      shop_id: "a0000000-0000-0000-0000-000000000001",
      category: expenseCategory,
      amount: expenseAmount,
      method: expenseMethod,
      note: expenseNote,
    });
    setExpenseModalOpen(false);
    setExpenseAmount(0);
    setExpenseNote("");
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      "OrderNo,Customer,Channel,Total,PaidStatus\n" +
      orders
        .map(
          (o) =>
            `${o.order_no},"${o.recipient_name || o.customer?.name || ""}",${o.channel},${o.total},${o.payment_status}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flower_shop_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>สรุปบัญชีและกำไร (Accounting)</span>
            <span className="text-[11px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
              👑 Owner
            </span>
          </h1>
          <p className="text-xs text-stone-500">
            รายรับจริงจากเงินเข้า, บันทึกรายจ่าย และวิเคราะห์กำไร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายจ่าย</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs px-3 py-2 rounded-xl shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Big Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* รายรับ */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>รายรับรวม (เงินเข้า)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-stone-900 block">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-[11px] text-stone-400">จากตาราง payments</span>
        </div>

        {/* รายจ่าย */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
            <span>รายจ่ายรวม (ต้นทุน)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold text-rose-600 block">
            {formatCurrency(totalExpense)}
          </span>
          <span className="text-[11px] text-stone-400">จากตาราง expenses</span>
        </div>

        {/* กำไรสุทธิ */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>กำไรสุทธิ (Net Profit)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className={`text-2xl font-bold block ${netProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
            {formatCurrency(netProfit)}
          </span>
          <span className="text-[11px] text-emerald-700/80">
            อัตรากำไร ~{totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-stone-900 flex items-center justify-between">
          <span>สัดส่วนรายจ่ายแยกตามหมวดหมู่</span>
          <span className="text-xs text-stone-500 font-normal">
            {expenses.length} รายการ
          </span>
        </h2>

        <div className="space-y-2.5">
          {Object.entries(expensesByCategory).map(([catKey, catAmount]) => {
            const label = categoryLabels[catKey] || catKey;
            const percent = totalExpense > 0 ? Math.round((catAmount / totalExpense) * 100) : 0;
            return (
              <div key={catKey} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium text-stone-700">
                  <span>{label}</span>
                  <span>
                    {formatCurrency(catAmount)} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-stone-900">ประวัติบันทึกรายจ่าย</h2>

        <div className="divide-y divide-stone-100 text-xs">
          {expenses.map((e) => (
            <div key={e.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-800 block text-sm">
                  {categoryLabels[e.category] || e.category}
                </span>
                <span className="text-stone-400">
                  {formatThaiDate(e.spent_at)} • {e.method} {e.note && `• ${e.note}`}
                </span>
              </div>
              <span className="font-bold text-rose-600 text-sm">
                -{formatCurrency(e.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">บันทึกรายจ่ายร้าน</h3>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700">หมวดหมู่รายจ่าย</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
              >
                <option value="flower_stock">ซื้อดอกไม้สด (ปากคลอง/สวน)</option>
                <option value="accessories">อุปกรณ์จัดช่อ (กระดาษ, ริบบิ้น, โอเอซิส)</option>
                <option value="packaging">บรรจุภัณฑ์และการ์ด</option>
                <option value="transportation">ค่าจัดส่ง / Grab / ค่าน้ำมัน</option>
                <option value="utilities">ค่าเช่า / น้ำแข็งแช่ดอกไม้ / สาธารณูปโภค</option>
                <option value="wage">ค่าจ้างรายวัน</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700">จำนวนเงินที่จ่าย (บาท)</label>
              <input
                type="number"
                inputMode="numeric"
                value={expenseAmount || ""}
                onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-lg font-bold border border-stone-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700">ช่องทางที่จ่าย</label>
              <select
                value={expenseMethod}
                onChange={(e) => setExpenseMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
              >
                <option value="transfer">โอนเงินธนาคาร</option>
                <option value="promptpay">พร้อมเพย์</option>
                <option value="cash">เงินสด</option>
                <option value="card">บัตรเครดิต</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-stone-700">รายละเอียดเพิ่มเติม</label>
              <input
                type="text"
                placeholder="เช่น กุหลาบขาว 2 ลัง, ค่าแอร์"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setExpenseModalOpen(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-600 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveExpense}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold"
              >
                บันทึกรายจ่าย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
