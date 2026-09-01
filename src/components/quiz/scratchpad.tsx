"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Highlighter,
  Eraser,
  RotateCcw,
  Trash2,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  isDocked?: boolean;
  onToggleDock?: () => void;
}

type ToolMode = "pen" | "highlighter" | "eraser";

const PALETTE = [
  { name: "Blue", color: "#2563eb" },
  { name: "Red", color: "#ef4444" },
  { name: "Green", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Slate", color: "#1e293b" },
];

const STROKE_SIZES = [
  { label: "Mảnh", size: 3 },
  { label: "Vừa", size: 6 },
  { label: "Dày", size: 12 },
];

export function Scratchpad({
  isOpen,
  onClose,
  isDocked = false,
  onToggleDock,
}: ScratchpadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<ToolMode>("pen");
  const [color, setColor] = useState<string>("#2563eb");
  const [size, setSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Setup Canvas Resolution & Resize
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save existing contents if resizing
    const ctx = canvas.getContext("2d");
    let prevData: ImageData | null = null;
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      try {
        prevData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        // ignore on init
      }
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (prevData) {
        ctx.putImageData(prevData, 0, 0);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(initCanvas, 100);
      window.addEventListener("resize", initCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", initCanvas);
      };
    }
  }, [isOpen, isDocked, initCanvas]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), state]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    const previousState = newHistory.pop();
    setHistory(newHistory);

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveHistoryState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Drawing Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveHistoryState();
    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = size * 3;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `${color}40`; // 25% opacity
      ctx.lineWidth = size * 3.5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.closePath();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border-2 border-slate-300/80 bg-white shadow-2xl transition-all duration-200 ${
        isDocked
          ? "h-full w-full"
          : "fixed inset-x-3 bottom-3 top-20 z-50 md:inset-auto md:bottom-8 md:right-8 md:top-24 md:h-[600px] md:w-[500px]"
      }`}
    >
      {/* Top Bar / Tools header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/90 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Pencil className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-slate-800">
            Bảng nháp tính toán
          </span>
          <span className="hidden text-xs text-slate-500 sm:inline">
            (Dùng bút/ngón tay trên iPad)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleDock && (
            <button
              onClick={onToggleDock}
              title={isDocked ? "Thu nhỏ cửa sổ" : "Ghim sang bên cạnh"}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 active:bg-slate-300"
            >
              {isDocked ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            title="Đóng bảng nháp"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-rose-100 hover:text-rose-700 active:bg-rose-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-2 text-xs">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTool("pen")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
              tool === "pen"
                ? "bg-white text-blue-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Bút viết</span>
          </button>
          <button
            onClick={() => setTool("highlighter")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
              tool === "highlighter"
                ? "bg-white text-amber-600 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span>Dạ quang</span>
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
              tool === "eraser"
                ? "bg-white text-rose-600 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Tẩy xoá</span>
          </button>
        </div>

        {/* Color Palette (when not erasing) */}
        {tool !== "eraser" && (
          <div className="flex items-center gap-1.5">
            {PALETTE.map((p) => (
              <button
                key={p.color}
                onClick={() => setColor(p.color)}
                style={{ backgroundColor: p.color }}
                title={p.name}
                className={`h-6 w-6 rounded-full transition-transform ${
                  color === p.color
                    ? "scale-110 ring-2 ring-blue-500 ring-offset-2"
                    : "opacity-80 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        )}

        {/* Stroke Sizes */}
        <div className="flex items-center gap-1">
          {STROKE_SIZES.map((s) => (
            <button
              key={s.size}
              onClick={() => setSize(s.size)}
              className={`rounded-lg px-2 py-1 text-xs font-medium ${
                size === s.size
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-300 font-bold"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Action buttons: Undo & Clear */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Hoàn tác nét vẽ"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hoàn tác</span>
          </button>
          <button
            onClick={handleClear}
            title="Xóa hết nét vẽ"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Xóa hết</span>
          </button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 cursor-crosshair touch-none bg-[#fdfdfd] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="drawing-canvas absolute inset-0 block h-full w-full"
        />
      </div>
    </div>
  );
}
