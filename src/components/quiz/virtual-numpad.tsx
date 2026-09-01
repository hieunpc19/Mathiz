"use client";

import React from "react";
import { Delete, CornerDownLeft, XCircle } from "lucide-react";

interface VirtualNumpadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onClose?: () => void;
  className?: string;
}

export function VirtualNumpad({
  value,
  onChange,
  onSubmit,
  onClose,
  className = "",
}: VirtualNumpadProps) {
  const handleKey = (key: string) => {
    if (key === "backspace") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "clear") {
      onChange("");
      return;
    }
    if (key === "+/-") {
      if (value.startsWith("-")) {
        onChange(value.slice(1));
      } else if (value.length > 0) {
        onChange("-" + value);
      }
      return;
    }
    if (key === ".") {
      if (!value.includes(".")) {
        onChange(value + ".");
      }
      return;
    }
    // Append number (max length 10 digits for primary school math)
    if (value.length < 10) {
      onChange(value + key);
    }
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "+/-"],
  ];

  return (
    <div
      className={`rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 shadow-xl select-none ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Bàn phím số cảm ứng
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Đóng
          </button>
        )}
      </div>

      {/* Grid of Keys */}
      <div className="grid grid-cols-4 gap-2">
        {/* Numbers column 1-3 */}
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {keys.flat().map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKey(k)}
              className="tactile-btn flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 active:scale-95 transition-transform"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Action column (Clear, Backspace, Enter) */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleKey("clear")}
            title="Xóa trắng"
            className="tactile-btn flex h-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-600 hover:bg-rose-100 active:scale-95"
          >
            <XCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleKey("backspace")}
            title="Xóa 1 ký tự"
            className="tactile-btn flex h-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-sm font-bold text-amber-700 hover:bg-amber-100 active:scale-95"
          >
            <Delete className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onSubmit}
            title="Xác nhận"
            className="tactile-btn flex flex-1 flex-col items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95"
          >
            <CornerDownLeft className="h-5 w-5" />
            <span className="mt-1 text-[11px]">Xong</span>
          </button>
        </div>
      </div>
    </div>
  );
}
