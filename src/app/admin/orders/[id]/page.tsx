import { notFound } from "next/navigation";
import { formatIls } from "@/lib/money";
import { variantLabel, VARIANT_LABEL, type ProductVariant } from "@/lib/pricing";
import { getOrderWithItems, getProducts } from "@/lib/queries";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, catalog] = await Promise.all([getOrderWithItems(id), getProducts()]);
  if (!order) {
    notFound();
  }
  const productsById = new Map(catalog.map((product) => [product.id, product]));

  return (
    <div className="max-w-2xl space-y-5 rounded-lg border border-[var(--line)] bg-white p-6">
      <h1 className="text-3xl font-bold">הזמנה</h1>
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
      <p>סה״כ: {formatIls(order.totalAgorot)}</p>
      <ul className="space-y-2">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.productName} — {item.productId
              ? variantLabel(item.variant as ProductVariant, productsById.get(item.productId))
              : VARIANT_LABEL[item.variant as ProductVariant] ?? item.variant} ×{" "}
            {item.quantity} ({formatIls(item.unitPriceAgorot)})
          </li>
        ))}
      </ul>
    </div>
  );
}
