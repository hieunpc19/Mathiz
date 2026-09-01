import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mathiz • Đấu trường & Luyện thi Toán Olympic Tiểu học",
    template: "%s | Mathiz",
  },
  description:
    "Nền tảng luyện thi Toán Olympic (TIMO, IKMC Kangaroo, SASMO, HKIMO) cho học sinh Tiểu học Lớp 1–5 với bảng nháp iPad, bàn phím số xúc giác và chấm điểm kèm lời giải chi tiết.",
  keywords: [
    "Toán Olympic",
    "Luyện thi TIMO",
    "Luyện thi Kangaroo",
    "IKMC",
    "SASMO",
    "Toán tư duy tiểu học",
    "Toán lớp 1",
    "Toán lớp 2",
    "Toán lớp 3",
    "Toán lớp 4",
    "Toán lớp 5",
    "Mathiz",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`h-full antialiased ${beVietnamPro.variable}`}>
      <body className={`flex min-h-full flex-col font-sans ${beVietnamPro.className}`}>
        {children}
      </body>
    </html>
  );
}

