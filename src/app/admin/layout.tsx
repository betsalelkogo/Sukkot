"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="font-semibold text-[var(--teal)]">ניהול האתר</p>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link href="/admin">סקירה</Link>
            <Link href="/admin/products">מוצרים</Link>
            <Link href="/admin/orders">הזמנות</Link>
            <Link href="/admin/pickup-points">נקודות איסוף</Link>
            <Link href="/admin/content">תוכן</Link>
            <Link href="/">לאתר</Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="text-red-700">
                יציאה
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </div>
  );
}
