import Link from "next/link";
import { formatIls } from "@/lib/money";
import { getOrders } from "@/lib/queries";

const statusLabel: Record<string, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  failed: "נכשל",
  expired: "פג תוקף",
};

export default async function AdminOrdersPage() {
  const orderList = await getOrders();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">הזמנות</h1>
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
            {orderList.map((order) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
