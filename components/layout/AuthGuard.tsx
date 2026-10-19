"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { ShieldAlert, User, Copy, Check, LogOut, ArrowRight, Sparkles } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, shopMembers, logout } = useStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (mounted && !currentUser && !isAuthRoute) {
      router.push("/login");
    }
  }, [mounted, currentUser, isAuthRoute, router]);

  // หน้า Login และ Register ให้เข้าถึงได้โดยตรงทันที ไม่ต้องรอดักจับหรือโหลด
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">กำลังเตรียมระบบร้านดอกไม้...</p>
        </div>
      </div>
    );
  }

  // หากยังไม่ล็อกอิน
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">กรุณาเข้าสู่ระบบก่อนใช้งาน</h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              ระบบจำเป็นต้องตรวจสอบสิทธิ์และบทบาท (เจ้าของร้าน หรือ พนักงาน) เพื่อปกป้องข้อมูลการเงินของร้าน
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2 text-xs">
            <Link
              href="/login"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm transition-all"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all"
            >
              สร้างบัญชีใหม่
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // หากเป็นพนักงาน แต่ยังไม่ถูกดึงเข้าสังกัดร้านค้าใดๆ
  const isAssigned = shopMembers.some((m) => m.user_id === currentUser.id && m.is_active);

  if (currentUser.role === "staff" && !isAssigned && pathname !== "/settings") {
    const copyCode = () => {
      navigator.clipboard.writeText(currentUser.userIdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>

          <div>
            <div className="inline-block text-[11px] font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full mb-1">
              รอดึงเข้าสังกัดร้านค้า
            </div>
            <h2 className="text-base font-bold text-stone-900">
              สวัสดีคุณ {currentUser.name}
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              บัญชีพนักงานของคุณสร้างเรียบร้อยแล้ว กรุณานำรหัส User ID ด้านล่างนี้ไปแจ้งเจ้าของร้าน เพื่อให้เจ้าของร้านดึงคุณเข้าร่วมจัดการร้านค้า
            </p>
          </div>

          {/* User ID Box */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
            <span className="text-[10px] font-semibold text-stone-400 block uppercase">
              รหัสประจำตัวของคุณ (User ID Code)
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-black text-rose-600 tracking-wider">
                {currentUser.userIdCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="p-2 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 shadow-sm"
                title="คัดลอกรหัส"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              ให้เจ้าของร้านไปที่หน้า <b>"ตั้งค่า"</b> แล้วกรอกรหัสนี้ในช่อง <b>"ดึงพนักงานด้วย User ID"</b>
            </p>
          </div>

          <div className="pt-2 flex gap-2 text-xs">
            <button
              onClick={() => logout()}
              className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>สลับบัญชี</span>
            </button>
            <Link
              href="/login"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow flex items-center justify-center gap-1"
            >
              <span>ไปหน้าล็อกอิน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // หากผ่านเงื่อนไข ให้แสดงผลหน้าจอ
  return <>{children}</>;
}
