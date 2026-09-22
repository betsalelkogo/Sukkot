import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderFulfillmentChecks } from "@/components/admin/OrderFulfillmentChecks";
import { OrderNavList } from "@/components/admin/OrderNavList";
import { formatIsraelDateTime } from "@/lib/datetime";
import { formatIls } from "@/lib/money";
import { variantLabel, VARIANT_LABEL, type ProductVariant } from "@/lib/pricing";
import { getOrderWithItems, getOrders, getProducts } from "@/lib/queries";

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pickup?: string }>;
}) {
  const { id } = await params;
  const { pickup = "" } = await searchParams;
  const [order, catalog, orderList] = await Promise.all([
    getOrderWithItems(id),
    getProducts(),
    getOrders(),
  ]);
  if (!order) {
    notFound();
  }
  const productsById = new Map(catalog.map((product) => [product.id, product]));
  const filtered = orderList.filter((entry) => {
    if (!pickup) {
      return true;
    }
    if (pickup === "none") {
      return !entry.pickupPointId;
    }
    return entry.pickupPointId === pickup;
  });
  const navOrders = (filtered.some((entry) => entry.id === id) ? filtered : orderList).map((entry) => ({
    id: entry.id,
    name: entry.customerName,
    meta: [formatIsraelDateTime(entry.createdAt), entry.pickupPointName || "ללא נקודת איסוף"]
      .filter(Boolean)
      .join(" · "),
  }));
  const index = navOrders.findIndex((entry) => entry.id === id);
  const previous = index > 0 ? navOrders[index - 1] : null;
  const next = index >= 0 && index < navOrders.length - 1 ? navOrders[index + 1] : null;
  const query = pickup ? `?pickup=${encodeURIComponent(pickup)}` : "";
  const listHref = pickup ? `/admin/orders?pickup=${encodeURIComponent(pickup)}#order-${id}` : `/admin/orders#order-${id}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
      <aside className="rounded-lg border border-[var(--line)] bg-white">
        <div className="border-b border-[var(--line)] px-3 py-3">
          <p className="font-semibold">הזמנות</p>
          <Link href={listHref} className="text-sm text-[var(--teal)]">
            חזרה לרשימה המלאה
          </Link>
        </div>
        <OrderNavList orders={navOrders} currentId={id} pickup={pickup || undefined} />
      </aside>
      <div className="max-w-2xl space-y-5 rounded-lg border border-[var(--line)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">הזמנה</h1>
          <div className="flex gap-3 text-sm">
            {previous ? (
              <Link href={`/admin/orders/${previous.id}${query}`} className="text-[var(--teal)]">
                הקודמת
              </Link>
            ) : (
              <span className="text-[var(--muted)]">הקודמת</span>
            )}
            {next ? (
              <Link href={`/admin/orders/${next.id}${query}`} className="text-[var(--teal)]">
                הבאה
              </Link>
            ) : (
              <span className="text-[var(--muted)]">הבאה</span>
            )}
          </div>
        </div>
        <p>תאריך: {formatIsraelDateTime(order.createdAt)}</p>
        <p>שם: {order.customerName}</p>
        <p>אימייל: {order.customerEmail}</p>
        <p>טלפון: {order.customerPhone}</p>
        <p>
          {order.pickupPointName
            ? `נקודת איסוף: ${order.pickupPointName}${order.address && order.address !== order.pickupPointName ? ` · ${order.address}` : ""}`
            : `כתובת: ${order.address}, ${order.city}`}
        </p>
        <p>הערות: {order.notes || "אין"}</p>
        <p>סטטוס: {order.status}</p>
        <OrderFulfillmentChecks orderId={order.id} packed={order.packed} shipped={order.shipped} />
        <p>סה״כ: {formatIls(order.totalAgorot)}</p>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.productName} —{" "}
              {item.productId
                ? variantLabel(item.variant as ProductVariant, productsById.get(item.productId))
                : VARIANT_LABEL[item.variant as ProductVariant] ?? item.variant}{" "}
              × {item.quantity} ({formatIls(item.unitPriceAgorot)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
