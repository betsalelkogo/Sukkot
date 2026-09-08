import { notFound } from "next/navigation";
import { formatIls } from "@/lib/money";
import { VARIANT_LABEL, type ProductVariant } from "@/lib/pricing";
import { getOrderWithItems } from "@/lib/queries";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderWithItems(id);
  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-5 rounded-lg border border-[var(--line)] bg-white p-6">
      <h1 className="text-3xl font-bold">הזמנה</h1>
      <p>שם: {order.customerName}</p>
      <p>אימייל: {order.customerEmail}</p>
      <p>טלפון: {order.customerPhone}</p>
      <p>
        כתובת: {order.address}, {order.city}
      </p>
      {order.notes ? <p>הערות: {order.notes}</p> : null}
      <p>סטטוס: {order.status}</p>
      <p>סה״כ: {formatIls(order.totalAgorot)}</p>
      <ul className="space-y-2">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.productName} — {VARIANT_LABEL[item.variant as ProductVariant] ?? item.variant} ×{" "}
            {item.quantity} ({formatIls(item.unitPriceAgorot)})
          </li>
        ))}
      </ul>
    </div>
  );
}
