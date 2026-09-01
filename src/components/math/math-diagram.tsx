"use client";

import React from "react";

interface MathDiagramProps {
  type: "triangle_count" | "balance_scale" | "pattern_grid" | "clock_time" | "fraction_pie";
  className?: string;
}

export function MathDiagram({ type, className = "" }: MathDiagramProps) {
  if (type === "triangle_count") {
    return (
      <div className={`my-4 flex flex-col items-center justify-center rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 p-6 ${className}`}>
        <svg viewBox="0 0 280 200" className="h-44 w-auto max-w-full drop-shadow-sm">
          {/* Large Outer Triangle */}
          <polygon
            points="140,20 20,180 260,180"
            fill="#e0e7ff"
            stroke="#4338ca"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner median lines dividing into 4 smaller triangles */}
          <line x1="140" y1="20" x2="140" y2="180" stroke="#4338ca" strokeWidth="2.5" strokeDasharray="5,3" />
          <line x1="80" y1="100" x2="200" y2="100" stroke="#4338ca" strokeWidth="2.5" />
          
          {/* Labels for small triangles */}
          <circle cx="110" cy="80" r="14" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="110" y="85" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3730a3">①</text>
          
          <circle cx="170" cy="80" r="14" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="170" y="85" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3730a3">②</text>
          
          <circle cx="85" cy="145" r="14" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="85" y="150" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3730a3">③</text>
          
          <circle cx="195" cy="145" r="14" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="195" y="150" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3730a3">④</text>
        </svg>
        <span className="mt-2 text-xs font-semibold text-indigo-700">Hình minh họa: Đếm hình tam giác</span>
      </div>
    );
  }

  if (type === "balance_scale") {
    return (
      <div className={`my-4 flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 p-6 ${className}`}>
        <svg viewBox="0 0 340 170" className="h-40 w-auto max-w-full drop-shadow-sm">
          {/* Scale Base */}
          <polygon points="170,80 145,150 195,150" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <rect x="120" y="150" width="100" height="12" rx="4" fill="#334155" />
          
          {/* Scale Beam */}
          <line x1="40" y1="80" x2="300" y2="80" stroke="#047857" strokeWidth="6" strokeLinecap="round" />
          <circle cx="170" cy="80" r="8" fill="#10b981" stroke="#065f46" strokeWidth="2" />
          
          {/* Left Pan */}
          <line x1="50" y1="80" x2="30" y2="120" stroke="#059669" strokeWidth="2" />
          <line x1="90" y1="80" x2="110" y2="120" stroke="#059669" strokeWidth="2" />
          <path d="M 20 120 Q 70 140 120 120 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
          
          {/* Left Item (1 Watermelon) */}
          <circle cx="70" cy="110" r="18" fill="#15803d" stroke="#14532d" strokeWidth="2" />
          <path d="M 56 100 Q 70 120 84 100" stroke="#86efac" strokeWidth="2" fill="none" />
          <text x="70" y="114" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">Dưa</text>
          
          {/* Right Pan */}
          <line x1="250" y1="80" x2="230" y2="120" stroke="#059669" strokeWidth="2" />
          <line x1="290" y1="80" x2="310" y2="120" stroke="#059669" strokeWidth="2" />
          <path d="M 220 120 Q 270 140 320 120 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
          
          {/* Right Items (2 Pineapples) */}
          <rect x="240" y="96" width="22" height="24" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
          <polygon points="251,90 245,96 257,96" fill="#16a34a" />
          <rect x="275" y="96" width="22" height="24" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
          <polygon points="286,90 280,96 292,96" fill="#16a34a" />
        </svg>
        <span className="mt-2 text-xs font-semibold text-emerald-800">Cân đĩa thăng bằng: 1 quả dưa hấu = 2 quả dứa</span>
      </div>
    );
  }

  if (type === "clock_time") {
    return (
      <div className={`my-4 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-100 bg-amber-50/50 p-6 ${className}`}>
        <svg viewBox="0 0 180 180" className="h-40 w-auto max-w-full drop-shadow-sm">
          {/* Outer Ring */}
          <circle cx="90" cy="90" r="80" fill="#ffffff" stroke="#d97706" strokeWidth="6" />
          <circle cx="90" cy="90" r="72" fill="#fffbeb" />
          
          {/* Numbers 12, 3, 6, 9 */}
          <text x="90" y="32" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">12</text>
          <text x="150" y="95" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">3</text>
          <text x="90" y="158" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">6</text>
          <text x="30" y="95" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">9</text>
          
          {/* Center Dot */}
          <circle cx="90" cy="90" r="5" fill="#b45309" />
          
          {/* Hour Hand (pointing at 3:15 -> ~100 deg) */}
          <line x1="90" y1="90" x2="130" y2="98" stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
          
          {/* Minute Hand (pointing at 3 -> 15 min) */}
          <line x1="90" y1="90" x2="148" y2="90" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="mt-2 text-xs font-semibold text-amber-800">Đồng hồ hiện tại: 3 giờ 15 phút</span>
      </div>
    );
  }

  return null;
}
