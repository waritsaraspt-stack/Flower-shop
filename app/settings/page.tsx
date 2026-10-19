"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Settings,
  Flower2,
  Users,
  Store,
  Plus,
  Check,
  Shield,
  User,
  CreditCard,
  QrCode,
  FileText,
  UserPlus,
  Trash2,
  Sparkles,
  Tag,
  Share2,
} from "lucide-react";

export default function SettingsPage() {
  const {
    role,
    currentUser,
    users,
    shop,
    shopMembers,
    products,
    categories,
    channels,
    addStaffByUserIdCode,
    removeStaffMember,
    addCustomChannel,
    addCategory,
    removeCategory,
    addProduct,
    deleteProduct,
    showFeedback,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"staff" | "categories" | "products" | "channels" | "shop">("staff");

  // Staff Invite State
  const [inviteUserIdCode, setInviteUserIdCode] = useState<string>("");
  const [inviteMessage, setInviteMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Category State
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatType, setNewCatType] = useState<"bouquet" | "fresh_flower" | "custom" | "accessory" | "service">("bouquet");
  const [newCatUnit, setNewCatUnit] = useState<string>("ช่อ");

  // Custom Channel State
  const [newChannelName, setNewChannelName] = useState<string>("");

  // New Product State
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdType, setNewProdType] = useState<any>("bouquet");
  const [newProdSize, setNewProdSize] = useState<string>("M");
  const [newProdPrice, setNewProdPrice] = useState<number>(0);
  const [newProdUnit, setNewProdUnit] = useState<string>("ช่อ");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showFeedback({
        type: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกชื่อประเภทสินค้าหรือบริการ",
      });
      return;
    }
    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      unit: newCatUnit.trim() || "ชิ้น",
    });
    showFeedback({
      type: "success",
      title: "เพิ่มประเภทสำเร็จ",
      message: `เพิ่มประเภท "${newCatName}" เรียบร้อยแล้ว`,
    });
    setNewCatName("");
  };

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserIdCode.trim()) return;

    const res = addStaffByUserIdCode(inviteUserIdCode);
    setInviteMessage({ text: res.message, success: res.success });
    if (res.success) {
      setInviteUserIdCode("");
    }
  };

  const handleQuickInvite = (code: string) => {
    const res = addStaffByUserIdCode(code);
    setInviteMessage({ text: res.message, success: res.success });
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const res = addCustomChannel(newChannelName);
    showFeedback({
      type: res.success ? "success" : "warning",
      title: res.success ? "เพิ่มช่องทางสำเร็จ" : "แจ้งเตือน",
      message: res.message,
    });
    setNewChannelName("");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice <= 0) {
      showFeedback({
        type: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกชื่อและราคาสินค้า (ต้องมากกว่า 0 บาท)",
      });
      return;
    }

    addProduct({
      shop_id: shop.id,
      name: newProdName.trim(),
      type: newProdType,
      size: newProdSize,
      unit: newProdUnit,
      price: newProdPrice,
      is_active: true,
    });

    showFeedback({
      type: "success",
      title: "เพิ่มสินค้าสำเร็จ",
      message: `เพิ่มสินค้า "${newProdName}" เรียบร้อยแล้ว`,
    });
    setNewProdName("");
    setNewProdPrice(0);
  };

  // Staff waiting to be added
  const unassignedStaff = users.filter(
    (u) => !shopMembers.some((m) => m.user_id === u.id && m.is_active)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-xl font-bold text-stone-900">จัดการร้าน & สิทธิ์พนักงาน (Settings)</h1>
        <p className="text-xs text-stone-500">
          ดึงพนักงานเข้าสังกัดด้วยรหัส User ID, จัดการช่องทางการขาย และสินค้า
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === "staff"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ดึงพนักงานด้วย User ID ({shopMembers.filter((m) => m.is_active).length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === "categories"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>ประเภทสินค้า & บริการ ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("channels")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === "channels"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>ช่องทางรับออเดอร์ ({channels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === "products"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Flower2 className="w-3.5 h-3.5" />
          <span>สินค้า & ดอกไม้สด ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("shop")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === "shop"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>ข้อมูลร้าน & พร้อมเพย์</span>
        </button>
      </div>

      {/* TAB 1: บัญชีพนักงาน & ดึงเข้าด้วย User ID */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          {/* Box ดึงพนักงานด้วย User ID */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50/40 p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-rose-600" />
                <span>ดึงพนักงานเข้าสู่ร้านค้าด้วยรหัส User ID</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                ให้พนักงานสร้างบัญชีเพื่อรับรหัสประจำตัว (เช่น EMP-103) จากนั้นกรอกรหัสที่นี่เพื่อดึงเข้าร่วมจัดการร้านทันที
              </p>
            </div>

            <form onSubmit={handleInviteStaff} className="flex gap-2">
              <input
                type="text"
                placeholder="กรอกรหัสพนักงาน เช่น EMP-103"
                value={inviteUserIdCode}
                onChange={(e) => setInviteUserIdCode(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs font-mono font-bold uppercase border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
              >
                ดึงเข้าสังกัดร้าน
              </button>
            </form>

            {inviteMessage && (
              <p
                className={`text-xs font-medium p-2.5 rounded-xl border ${
                  inviteMessage.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {inviteMessage.text}
              </p>
            )}

            {/* Quick Suggestions for Testing */}
            {unassignedStaff.length > 0 && (
              <div className="pt-2 border-t border-rose-200/50 space-y-1.5">
                <span className="text-[11px] font-semibold text-rose-800 block">
                  พนักงานที่ลงทะเบียนในระบบและรอดึงเข้าสังกัดร้าน:
                </span>
                <div className="flex flex-wrap gap-2">
                  {unassignedStaff.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickInvite(u.userIdCode)}
                      className="text-xs bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-stone-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>🧑‍💼 {u.name}</span>
                      <span className="font-mono font-bold text-rose-600">({u.userIdCode})</span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">+ ดึง</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* รายชื่อพนักงานปัจจุบันในร้าน */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-stone-900">
              สมาชิกและพนักงานในร้านปัจจุบัน ({shopMembers.filter((m) => m.is_active).length} คน)
            </h2>

            <div className="divide-y divide-stone-100 text-xs">
              {shopMembers
                .filter((m) => m.is_active)
                .map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white text-xs ${
                          m.role === "owner" ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        {m.role === "owner" ? "👑" : "🧑‍💼"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{m.display_name}</span>
                          <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-bold">
                            {m.userIdCode || "EMP"}
                          </span>
                        </div>
                        <span className="text-stone-400 text-[11px]">
                          {m.role === "owner"
                            ? "เจ้าของร้าน • สิทธิ์เข้าถึงยอดขายและกำไรเต็มรูปแบบ"
                            : "พนักงาน • สิทธิ์รับออเดอร์/ส่งของ (ซ่อนตัวเลขยอดขาย)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          m.role === "owner"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {m.role === "owner" ? "Owner" : "Staff"}
                      </span>

                      {role === "owner" && m.role !== "owner" && (
                        <button
                          onClick={() => {
                            if (confirm(`ต้องการลบ/ปลดพนักงาน "${m.display_name}" (${m.userIdCode || "EMP"}) ออกจากร้านหรือไม่?\n(พนักงานจะไม่สามารถเข้าถึงข้อมูลร้านนี้ได้อีก)`)) {
                              removeStaffMember(m.user_id);
                              showFeedback({
                                type: "danger",
                                title: "ปลดพนักงานสำเร็จ",
                                message: `ปลดพนักงาน "${m.display_name}" ออกจากร้านเรียบร้อยแล้ว`,
                              });
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all shadow-xs"
                          title="ลบพนักงานออกจากร้าน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบพนักงาน</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ประเภทสินค้าและบริการ (Owner จัดการเพิ่มหรือลบประเภทได้เอง) */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-rose-600" />
                <span>เพิ่มประเภทสินค้าและบริการใหม่ในร้าน</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                เจ้าของร้านสามารถกำหนดหมวดหมู่สินค้าและบริการของร้านได้เอง เช่น ช่อดอกไม้สด, ดอกไม้แบ่งขาย, บริการจัดซุ้มแต่งงาน, ค่าบริการส่งด่วน
              </p>
            </div>

            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  ชื่อประเภทสินค้า/บริการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น บริการจัดซุ้ม, ดอกไม้แบ่งขาย"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  กลุ่มประเภทหลัก
                </label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl bg-white"
                >
                  <option value="bouquet">💐 ช่อดอกไม้จัดสำเร็จ</option>
                  <option value="fresh_flower">🌹 ดอกไม้สดแบ่งขาย</option>
                  <option value="service">🛠️ บริการจัดงาน / ส่งด่วน / ซุ้มดอกไม้</option>
                  <option value="accessory">🎀 การ์ดและอุปกรณ์ตกแต่ง</option>
                  <option value="custom">✨ สั่งทำพิเศษตามงบ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  หน่วยนับเริ่มต้น
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น ช่อ, กำ, จุด, ครั้ง"
                    value={newCatUnit}
                    onChange={(e) => setNewCatUnit(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm transition-all shrink-0"
                  >
                    + เพิ่มประเภท
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* รายการหมวดหมู่ทั้งหมด */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-stone-900">
              ประเภทสินค้าและบริการในร้านทั้งหมด ({categories.length} ประเภท)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between gap-2 hover:bg-stone-100/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-stone-800">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{c.name}</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      กลุ่ม: <span className="text-stone-600 font-medium">{c.type}</span> • หน่วย: {c.unit}
                    </div>
                  </div>

                  {role === "owner" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`ต้องการลบประเภท "${c.name}" ออกจากร้านหรือไม่?`)) {
                          removeCategory(c.id);
                          showFeedback({
                            type: "danger",
                            title: "ลบประเภทสินค้าสำเร็จ",
                            message: `ลบประเภท "${c.name}" ออกจากร้านเรียบร้อยแล้ว`,
                          });
                        }
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="ลบประเภทสินค้า/บริการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ช่องทางรับออเดอร์ (Owner สามารถเพิ่มประเภทได้เอง) */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900">เพิ่มช่องทางการรับออเดอร์ใหม่</h2>
              <p className="text-xs text-stone-500">
                เจ้าของร้านสามารถเพิ่มช่องทางสั่งซื้อเองได้ เช่น TikTok Shop, Shopee, ลูกค้าประจำ VIP, งานอีเวนต์
              </p>
            </div>

            <form onSubmit={handleAddChannel} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="ระบุชื่อช่องทางใหม่ (เช่น GrabMart, งานแต่งงาน)"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm"
              >
                + เพิ่มช่องทาง
              </button>
            </form>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-stone-900">ช่องทางการรับออเดอร์ทั้งหมด ({channels.length})</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ch.badge}`}>
                      {ch.label}
                    </span>
                    {ch.is_custom && (
                      <span className="text-[10px] text-stone-400">(กำหนดเอง)</span>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">พร้อมใช้งาน</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: สินค้า & แคตตาล็อก */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* ฟอร์มเพิ่มสินค้าใหม่ */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-stone-900">+ เพิ่มสินค้า / ดอกไม้สดเข้าสู่ระบบ</h2>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="ชื่อสินค้า/ดอกไม้สด (เช่น ช่อกุหลาบขาวพรีเมียม)"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <select
                  value={newProdType}
                  onChange={(e) => setNewProdType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                >
                  <option value="bouquet">ช่อดอกไม้จัดสำเร็จ</option>
                  <option value="fresh_flower">ดอกไม้สดแบ่งขาย</option>
                  <option value="accessory">อุปกรณ์เสริมและการ์ด</option>
                  <option value="custom">สั่งจัดพิเศษ</option>
                </select>
              </div>

              <div>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="ราคาขาย (บาท)"
                  value={newProdPrice || ""}
                  onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-bold"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  บันทึกสินค้าใหม่
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-stone-900">แคตตาล็อกสินค้าปัจจุบัน ({products.length} รายการ)</h2>

            <div className="divide-y divide-stone-100 text-xs">
              {products.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{p.name}</span>
                      {p.size && <span className="text-[10px] text-stone-400 font-normal">({p.size})</span>}
                    </div>
                    <span className="text-stone-400 text-[11px]">
                      หน่วย: {p.unit} • ประเภท: {p.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 text-sm">
                      {formatCurrency(p.price)}
                    </span>
                    {role === "owner" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`ต้องการลบสินค้า "${p.name}" ออกจากร้านหรือไม่?`)) {
                            deleteProduct(p.id);
                            showFeedback({
                              type: "danger",
                              title: "ลบสินค้าสำเร็จ",
                              message: `ลบสินค้า "${p.name}" ออกจากร้านเรียบร้อยแล้ว`,
                            });
                          }
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="ลบสินค้านี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ข้อมูลร้าน */}
      {activeTab === "shop" && (
        <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm text-xs">
          <h2 className="text-sm font-bold text-stone-900">ข้อมูลร้านค้าสำหรับพิมพ์หัวบิล</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">ชื่อร้าน (แสดงบนใบเสร็จ)</label>
              <input
                type="text"
                defaultValue={shop.name}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="text"
                defaultValue={shop.phone}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">เลขพร้อมเพย์ร้าน (PromptPay สำหรับ QR บิล)</label>
              <input
                type="text"
                defaultValue={shop.promptpay_number}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono font-bold text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">LINE Official Account</label>
              <input
                type="text"
                defaultValue="@bloomblossom"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="font-semibold text-stone-700">ที่ตั้งหน้าร้าน</label>
            <textarea
              defaultValue={shop.address}
              rows={2}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
