import { NextResponse } from "next/server";
import { formatIls } from "@/lib/money";
import { VARIANT_LABEL, variantLabel, type ProductVariant } from "@/lib/pricing";
import { getPaidOrdersWithItems, getProducts } from "@/lib/queries";

const STATUS_LABEL: Record<string, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  failed: "נכשל",
  expired: "פג תוקף",
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function excelPhone(value: string) {
  const phone = value.replace(/\s/g, "");
  return phone ? `="${phone}"` : "";
}

export async function GET(request: Request) {
  const pickup = new URL(request.url).searchParams.get("pickup") ?? "";
  const [orders, catalog] = await Promise.all([getPaidOrdersWithItems(), getProducts()]);
  const productsById = new Map(catalog.map((product) => [product.id, product]));

  const filtered = orders.filter((order) => {
    if (!pickup) {
      return true;
    }
    if (pickup === "none") {
      return !order.pickupPointId;
    }
    return order.pickupPointId === pickup;
  });

  const header = [
    "תאריך",
    "שם",
    "טלפון",
    "אימייל",
    "נקודת איסוף",
    "כתובת",
    "פריטים",
    "סה\"כ",
    "סטטוס",
    "הערות",
  ];

  const rows = filtered.map((order) => {
    const items = order.items
      .map((item) => {
        const label = item.productId
          ? variantLabel(item.variant as ProductVariant, productsById.get(item.productId))
          : VARIANT_LABEL[item.variant as ProductVariant] ?? item.variant;
        return `${item.productName} — ${label} × ${item.quantity}`;
      })
      .join(" | ");
    return [
      order.createdAt.toLocaleString("he-IL"),
      order.customerName,
      excelPhone(order.customerPhone),
      order.customerEmail,
      order.pickupPointName || "",
      [order.address, order.city].filter(Boolean).join(" · "),
      items,
      formatIls(order.totalAgorot),
      STATUS_LABEL[order.status] ?? order.status,
      order.notes || "",
    ].map(csvCell);
  });

  const csv = `\uFEFF${[header.map(csvCell).join(","), ...rows.map((row) => row.join(","))].join("\r\n")}`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
