import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ฟอร์แมตจำนวนเงินไทย เช่น ฿1,250 หรือ ฿850.50
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "฿0";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * ฟอร์แมตวันที่และเวลาภาษาไทย (พ.ศ.)
 */
export function formatThaiDate(dateStr: string | Date | null | undefined, includeTime = true): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";

  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }
  return `${day} ${month} ${year} ${hours}:${minutes} น.`;
}

/**
 * ฟอร์แมตเฉพาะเวลา เช่น 14:30 น.
 */
export function formatTimeOnly(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} น.`;
}

/**
 * รายละเอียดสถานะการจัดทำ/ส่งมอบ
 */
export const FULFILLMENT_STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  new: {
    label: "ออเดอร์ใหม่",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: "Clock",
  },
  arranging: {
    label: "กำลังจัดช่อ",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    icon: "Sparkles",
  },
  ready: {
    label: "พร้อมรับ/ส่ง",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    icon: "PackageCheck",
  },
  done: {
    label: "ส่งมอบสำเร็จ",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "CheckCircle2",
  },
  cancelled: {
    label: "ยกเลิกแล้ว",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-500 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    icon: "XCircle",
  },
};

/**
 * รายละเอียดสถานะการชำระเงิน
 */
export const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  unpaid: {
    label: "ยังไม่จ่าย",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
    icon: "AlertCircle",
  },
  partial: {
    label: "มัดจำแล้ว",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: "PieChart",
  },
  paid: {
    label: "จ่ายแล้ว",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "CheckCircle",
  },
};

/**
 * ช่องทางการสั่งซื้อ
 */
export const CHANNEL_MAP: Record<string, { label: string; badge: string }> = {
  walk_in: { label: "หน้าร้าน (Walk-in)", badge: "bg-amber-100 text-amber-800" },
  line: { label: "LINE OA", badge: "bg-emerald-100 text-emerald-800" },
  facebook: { label: "Facebook Page", badge: "bg-blue-100 text-blue-800" },
  instagram: { label: "Instagram DM", badge: "bg-pink-100 text-pink-800" },
  phone: { label: "โทรศัพท์", badge: "bg-indigo-100 text-indigo-800" },
  other: { label: "อื่นๆ", badge: "bg-slate-100 text-slate-800" },
};
