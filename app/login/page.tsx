"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Sparkles,
  KeyRound,
  Lock,
  ArrowRight,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!identifier.trim()) {
      setLoginError("กรุณากรอกรหัสผู้ใช้, อีเมล หรือเบอร์โทรศัพท์");
      return;
    }

    if (!password.trim()) {
      setLoginError("กรุณากรอกรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    const res = login(identifier.trim(), password);
    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setLoginError(res.message || "ไม่พบบัญชีผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            เข้าสู่ระบบ Bloom<span className="text-rose-500">POS</span>
          </h1>
          <p className="text-xs text-stone-500">
            กรอกข้อมูลเพื่อเข้าสู่ระบบบริหารจัดการร้านดอกไม้
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Identifier Input */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700 block">
              รหัสประจำตัว (User ID), อีเมล หรือ เบอร์โทรศัพท์
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (loginError) setLoginError("");
                }}
                placeholder="เช่น OWN-101, EMP-101, อีเมล หรือ เบอร์โทร"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700 block">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError("");
                }}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full pl-9 pr-10 py-2.5 text-xs font-medium border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-stone-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all mt-2"
          >
            <span>{isLoading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Register - only shown as an action button to open registration */}
        <div className="pt-4 border-t border-stone-100 text-center space-y-3">
          <span className="text-xs text-stone-500 block">ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?</span>
          <Link
            href="/register"
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-rose-500" />
            <span>สร้างบัญชีใหม่</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
