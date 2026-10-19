"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertOctagon, AlertTriangle, X } from "lucide-react";

export type FeedbackType = "success" | "danger" | "warning";

export interface FeedbackModalData {
  type: FeedbackType;
  title: string;
  message: string;
  buttonText?: string;
  autoCloseMs?: number;
  onConfirm?: () => void;
}

interface CentralAlertModalProps {
  data: FeedbackModalData | null;
  onClose: () => void;
}

export function CentralAlertModal({ data, onClose }: CentralAlertModalProps) {
  useEffect(() => {
    if (!data) return;

    if (data.autoCloseMs && data.autoCloseMs > 0) {
      const timer = setTimeout(() => {
        handleConfirm();
      }, data.autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) return null;

  const handleConfirm = () => {
    if (data.onConfirm) {
      data.onConfirm();
    }
    onClose();
  };

  const isSuccess = data.type === "success";
  const isDanger = data.type === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-100 space-y-4 animate-in zoom-in-95 duration-200 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button top-right */}
        <button
          onClick={handleConfirm}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dynamic Center Icon */}
        <div className="flex justify-center pt-2">
          {isSuccess && (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>
          )}

          {isDanger && (
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-4 ring-rose-50 animate-in zoom-in-75 duration-300">
              <AlertOctagon className="w-9 h-9 stroke-[2.2]" />
            </div>
          )}

          {!isSuccess && !isDanger && (
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-4 ring-amber-50 animate-in zoom-in-75 duration-300">
              <AlertTriangle className="w-9 h-9 stroke-[2.2]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5 px-2">
          <h3
            className={`text-base sm:text-lg font-bold tracking-tight ${
              isSuccess ? "text-emerald-950" : isDanger ? "text-rose-950" : "text-amber-950"
            }`}
          >
            {data.title}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
            {data.message}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            autoFocus
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 text-white ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                : isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"
            }`}
          >
            <span>{data.buttonText || "ตกลง"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
