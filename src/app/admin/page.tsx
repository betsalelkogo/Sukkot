import Link from "next/link";
import { getOrders, getProducts } from "@/lib/queries";
import { isMorningConfigured } from "@/lib/morning";
import { formatIls } from "@/lib/money";

export default async function AdminHomePage() {
  const [productList, orderList] = await Promise.all([getProducts(), getOrders()]);
  const paid = orderList.filter((order) => order.status === "paid");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">סקירה</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="מוצרים" value={String(productList.length)} />
        <Stat label="הזמנות ששולמו" value={String(paid.length)} />
        <Stat
          label="הכנסות ששולמו"
          value={formatIls(paid.reduce((sum, order) => sum + order.totalAgorot, 0))}
        />
      </div>
      <div className="rounded-lg border border-[var(--line)] bg-white p-5 text-sm leading-7">
        <p>
          מסד נתונים: {process.env.DATABASE_URL ? "מחובר" : "חסר DATABASE_URL"}
        </p>
        <p>
          סליקה Morning: {isMorningConfigured() ? "מוגדרת" : "חסרים מפתחות"}
          {process.env.MORNING_ENV ? ` · ${process.env.MORNING_ENV}` : ""}
          {process.env.MORNING_PLUGIN_ID
            ? ` · פלאגין …${process.env.MORNING_PLUGIN_ID.slice(-6)}`
            : ""}
        </p>
        <p>כתובת האתר לתשלום: {process.env.NEXT_PUBLIC_SITE_URL ? "מוגדרת" : "חסרה"}</p>
      </div>
      <div className="flex gap-3">
        <Link href="/admin/products/new" className="btn-primary">
          מוצר חדש
        </Link>
        <Link href="/admin/orders" className="rounded-md border border-[var(--line)] px-4 py-3">
          לכל ההזמנות
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
