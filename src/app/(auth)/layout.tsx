import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
      {children}
    </div>
  );
}
