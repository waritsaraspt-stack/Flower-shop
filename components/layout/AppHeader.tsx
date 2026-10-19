"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatThaiDate } from "@/lib/utils";
import { Sparkles, Shield, User, Store, RefreshCw, LogIn, LogOut } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const { currentUser, role, logout } = useStore();
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(formatThaiDate(new Date(), false));
    const timer = setInterval(() => {
      setCurrentDate(formatThaiDate(new Date(), false));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // ซ่อน Header ในหน้า Login และ Register เพื่อความสะอาดและโฟกัสที่การลงทะเบียน
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 glass-header border-b border-stone-200/80 px-4 py-3 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 leading-tight">
                  Bloom<span className="text-rose-500">POS</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200/60">
                  ระบบร้านดอกไม้
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {currentDate || "กำลังโหลด..."} • <span className="text-emerald-600 font-semibold">● ซิงค์สด</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Current User Info & Action */}
        <div className="flex items-center gap-2">
          {!currentUser ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          ) : (
            <>
              {/* User Account Pill */}
              <div
                className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs shadow-xs"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-xs ${
                    role === "owner" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  title={role === "owner" ? "เจ้าของร้าน" : "พนักงาน"}
                >
                  {role === "owner" ? "👑" : "🧑‍💼"}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-stone-800 text-[11px] block leading-tight">
                    {currentUser.name}
                  </span>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-[10px] text-stone-400 font-mono">
                      ID: {currentUser.userIdCode}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        role === "owner"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {role === "owner" ? "เจ้าของร้าน" : "พนักงาน"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => logout()}
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
