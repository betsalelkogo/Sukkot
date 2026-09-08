import Link from "next/link";
import { formatIls } from "@/lib/money";
import { getOrders, getPickupPoints } from "@/lib/queries";

const statusLabel: Record<string, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  failed: "נכשל",
  expired: "פג תוקף",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ pickup?: string }>;
}) {
  const { pickup = "" } = await searchParams;
  const [orderList, points] = await Promise.all([getOrders(), getPickupPoints()]);
  const pointOptions = new Map(points.map((point) => [point.id, point.name]));
  for (const order of orderList) {
    if (order.pickupPointId && order.pickupPointName && !pointOptions.has(order.pickupPointId)) {
      pointOptions.set(order.pickupPointId, order.pickupPointName);
    }
  }

  const filtered = orderList.filter((order) => {
    if (!pickup) {
      return true;
    }
    if (pickup === "none") {
      return !order.pickupPointId;
    }
    return order.pickupPointId === pickup;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">הזמנות</h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="block space-y-1">
          <span className="text-sm">סינון לפי נקודת איסוף</span>
          <select
            name="pickup"
            defaultValue={pickup}
            className="rounded-md border border-[var(--line)] bg-white px-3 py-2"
          >
            <option value="">כל הנקודות</option>
            <option value="none">ללא נקודת איסוף</option>
            {[...pointOptions.entries()].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary">
          סינון
        </button>
      </form>
      <p className="text-sm text-[var(--muted)]">
        {filtered.length} מתוך {orderList.length} הזמנות
      </p>
      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-[var(--paper)]">
            <tr>
              <th className="p-3">תאריך</th>
              <th className="p-3">לקוח</th>
              <th className="p-3">איסוף</th>
              <th className="p-3">סכום</th>
              <th className="p-3">סטטוס</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-[var(--muted)]" colSpan={6}>
                  אין הזמנות בסינון הזה.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-t border-[var(--line)]">
                  <td className="p-3">{order.createdAt.toLocaleString("he-IL")}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">{order.pickupPointName || "-"}</td>
                  <td className="p-3">{formatIls(order.totalAgorot)}</td>
                  <td className="p-3">{statusLabel[order.status] ?? order.status}</td>
                  <td className="p-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-[var(--teal)]">
                      פירוט
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
