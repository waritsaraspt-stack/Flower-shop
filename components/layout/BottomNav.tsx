"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Calendar, ListOrdered, Plus, BarChart3, Settings, Lock } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { role, currentUser, showFeedback } = useStore();

  // ไม่แสดงแถบเมนูด้านล่างในหน้า Login, Register หรือเมื่อยังไม่ได้เข้าสู่ระบบ
  if (pathname === "/login" || pathname === "/register" || !currentUser) {
    return null;
  }

  const isToday = pathname === "/" || pathname === "/today";
  const isOrders = pathname === "/orders";
  const isNew = pathname === "/orders/new";
  const isAccounting = pathname.startsWith("/accounting");
  const isSettings = pathname.startsWith("/settings");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-stone-200/90 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* แท็บ วันนี้ */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isToday ? "text-rose-600 font-semibold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">วันนี้</span>
        </Link>

        {/* แท็บ ออเดอร์ทั้งหมด */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isOrders ? "text-rose-600 font-semibold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <ListOrdered className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">ออเดอร์</span>
        </Link>

        {/* ปุ่มสร้างออเดอร์ใหม่ (FAB ตรงกลางโดดเด่น) */}
        <div className="flex-1 flex justify-center -mt-6">
          <Link
            href="/orders/new"
            aria-label="สร้างออเดอร์ใหม่"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all p-3"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>

        {/* แท็บ บัญชี (เจ้าของร้านเท่านั้น) */}
        <Link
          href={role === "owner" ? "/accounting" : "#"}
          onClick={(e) => {
            if (role !== "owner") {
              e.preventDefault();
              showFeedback({
                type: "warning",
                title: "จำกัดสิทธิ์เฉพาะเจ้าของร้าน",
                message: "หน้านี้สำหรับเจ้าของร้าน (Owner) เท่านั้น พนักงานทั่วไปไม่มีสิทธิ์เข้าถึงข้อมูลบัญชีและผลกำไร",
              });
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
            isAccounting
              ? "text-rose-600 font-semibold"
              : role === "owner"
              ? "text-stone-500 hover:text-stone-800"
              : "text-stone-300 cursor-not-allowed"
          }`}
        >
          <div className="relative">
            <BarChart3 className="w-5 h-5 mb-0.5" />
            {role !== "owner" && (
              <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-stone-400" />
            )}
          </div>
          <span className="text-[11px] leading-tight">บัญชีร้าน</span>
        </Link>

        {/* แท็บ สินค้า & แคตตาล็อก */}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isSettings ? "text-rose-600 font-semibold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">ตั้งค่า</span>
        </Link>
      </div>
    </nav>
  );
}
