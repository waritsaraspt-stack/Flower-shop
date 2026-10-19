"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import {
  Sparkles,
  Shield,
  User,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Store,
  Phone,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, users, hasOwner, showFeedback } = useStore();

  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<UserRole>(() => (hasOwner ? "staff" : "owner"));
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [shopName, setShopName] = useState<string>("ร้านดอกไม้ของฉัน");
  
  const [createdUser, setCreatedUser] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleNextFromRole = () => {
    if (role === "owner" && hasOwner) {
      showFeedback({
        type: "warning",
        title: "จำกัดสิทธิ์เจ้าของร้าน",
        message: "ร้านนี้มีเจ้าของร้านเรียบร้อยแล้ว (จำกัด 1 ร้านต่อ 1 เจ้าของ) กรุณาเลือกบทบาท 'พนักงาน'",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showFeedback({
        type: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกชื่อ-นามสกุล หรือชื่อเล่น",
      });
      return;
    }
    if (!phone.trim() && !email.trim()) {
      showFeedback({
        type: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกเบอร์โทรศัพท์หรืออีเมลสำหรับการเข้าสู่ระบบ",
      });
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      showFeedback({
        type: "warning",
        title: "รหัสผ่านสั้นเกินไป",
        message: "กรุณากำหนดรหัสผ่านอย่างน้อย 4 ตัวอักษร เพื่อความปลอดภัย",
      });
      return;
    }

    try {
      const newUser = register({
        name: name.trim(),
        email: email.trim() || `${phone.trim()}@flowerpos.local`,
        phone: phone.trim(),
        password: password.trim(),
        role: role,
      });

      setCreatedUser(newUser);
      setStep(3);
    } catch (err: any) {
      showFeedback({
        type: "danger",
        title: "ลงทะเบียนไม่สำเร็จ",
        message: err.message || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            ลงทะเบียนเข้าใช้งาน Bloom<span className="text-rose-500">POS</span>
          </h1>
          <p className="text-xs text-stone-500">
            {step === 1 && "ขั้นตอนที่ 1: เลือกบทบาทการใช้งาน"}
            {step === 2 && "ขั้นตอนที่ 2: กรอกข้อมูลส่วนตัว"}
            {step === 3 && "ลงทะเบียนสำเร็จเรียบร้อย"}
          </p>
        </div>

        {/* STEP 1: เลือกบทบาท (Owner vs Staff) */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="text-xs font-semibold text-stone-700 block">
              กรุณาเลือกประเภทบัญชีของคุณ
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: เจ้าของร้าน */}
              <div
                onClick={() => {
                  if (hasOwner) {
                    showFeedback({
                      type: "warning",
                      title: "จำกัดสิทธิ์เจ้าของร้าน",
                      message: "ร้านค้านี้มีเจ้าของร้านเรียบร้อยแล้ว (จำกัด 1 ร้านต่อ 1 เจ้าของเท่านั้น) กรุณาเลือกบทบาท 'พนักงาน'",
                    });
                    return;
                  }
                  setRole("owner");
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  hasOwner
                    ? "opacity-60 bg-stone-50 border-stone-200 cursor-not-allowed"
                    : role === "owner"
                    ? "cursor-pointer bg-rose-50/80 border-rose-500 ring-2 ring-rose-400/30"
                    : "cursor-pointer border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    {hasOwner && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        🔒 มีเจ้าของแล้ว (จำกัด 1 คน)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-stone-900 block">
                      เจ้าของร้าน (Owner)
                    </span>
                    <span className="text-xs text-stone-500 mt-1 block leading-relaxed">
                      {hasOwner
                        ? "ร้านนี้มีเจ้าของร้านแล้ว 1 ร้านสามารถมีเจ้าของได้เพียง 1 คนเท่านั้น"
                        : "สร้างร้านค้าของตนเอง, ดูตัวเลขยอดขาย, บัญชีกำไรขาดทุน, จัดการราคา และดึงพนักงานเข้าสู่ร้าน"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-rose-200/40 flex items-center justify-between text-[11px] font-bold text-rose-600">
                  <span>รหัสประจำตัว: OWN-XXXX</span>
                  {role === "owner" && !hasOwner && <Check className="w-4 h-4 text-rose-600" />}
                </div>
              </div>

              {/* Option: พนักงาน */}
              <div
                onClick={() => setRole("staff")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  role === "staff"
                    ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400/30"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-stone-900 block">
                      พนักงาน (Staff)
                    </span>
                    <span className="text-xs text-stone-500 mt-1 block leading-relaxed">
                      รับออเดอร์หน้าร้าน/แชท, จัดช่อดอกไม้, ปรับสถานะส่งของ และออกบิลใบเสร็จ (ซ่อนตัวเลขยอดขายรวม)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-emerald-200/40 flex items-center justify-between text-[11px] font-bold text-emerald-600">
                  <span>รหัสประจำตัว: EMP-XXXX</span>
                  {role === "staff" && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextFromRole}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all mt-4"
            >
              <span>ต่อไป: กรอกข้อมูล</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: ฟอร์มกรอกข้อมูล */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-stone-500 hover:text-stone-800 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>เปลี่ยนบทบาท ({role === "owner" ? "เจ้าของร้าน" : "พนักงาน"})</span>
              </button>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  role === "owner" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {role === "owner" ? "👑 Owner" : "🧑‍💼 Staff"}
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">ชื่อ-นามสกุล หรือชื่อเล่นที่ใช้ในร้าน *</label>
              <input
                type="text"
                required
                placeholder="เช่น คุณแพรว, ช่างเต้ย"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>เบอร์โทรศัพท์มือถือ *</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="08x-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>อีเมล</span>
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>กำหนดรหัสผ่านสำหรับเข้าสู่ระบบ *</span>
                </span>
                <span className="text-[10px] text-stone-400">(ขั้นต่ำ 4 ตัวอักษร)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="กำหนดรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 pr-10 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
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

            {/* ถ้าเป็นเจ้าของร้าน: ให้ระบุชื่อร้านค้า */}
            {role === "owner" && (
              <div className="space-y-1 pt-1 border-t border-stone-100">
                <label className="font-semibold text-stone-700 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-rose-500" />
                  <span>ชื่อร้านดอกไม้ของคุณ</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น Bloom & Blossom Studio"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all mt-3"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันการลงทะเบียน</span>
            </button>
          </form>
        )}

        {/* STEP 3: ลงทะเบียนสำเร็จ พร้อมรหัส User ID */}
        {step === 3 && createdUser && (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h2 className="text-base font-bold text-stone-900">
                ลงทะเบียนสำเร็จเรียบร้อยแล้ว!
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {createdUser.role === "owner"
                  ? "คุณลงทะเบียนในฐานะเจ้าของร้าน พร้อมจัดการร้านค้าทันที"
                  : "นำรหัส User ID ด้านล่างไปแจ้งเจ้าของร้านเพื่อดึงคุณเข้าร่วมจัดการร้านค้า"}
              </p>
            </div>

            {/* Card รหัส User ID */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2 text-center">
              <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider">
                รหัสประจำตัวของคุณ (User ID Code)
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black text-rose-600 tracking-wider">
                  {createdUser.userIdCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyCode(createdUser.userIdCode)}
                  className="p-2 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 shadow-sm"
                  title="คัดลอกรหัส"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-stone-500">
                ชื่อ: <span className="font-semibold text-stone-800">{createdUser.name}</span> • บทบาท:{" "}
                <span className="font-semibold text-stone-800">
                  {createdUser.role === "owner" ? "เจ้าของร้าน" : "พนักงาน"}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        )}

        {/* Return to Login Link */}
        {step < 3 && (
          <div className="pt-3 border-t border-stone-100 text-center text-xs text-stone-500">
            <span>มีบัญชีผู้ใช้งานอยู่แล้วใช่หรือไม่? </span>
            <Link
              href="/login"
              className="font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
