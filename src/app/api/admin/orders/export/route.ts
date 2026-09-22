import { NextResponse } from "next/server";
import { formatIsraelDateTime } from "@/lib/datetime";
import { formatIls } from "@/lib/money";
import { type ProductLabelInfo, type ProductVariant } from "@/lib/pricing";
import { getPaidOrdersWithItems, getProducts } from "@/lib/queries";

const STATUS_LABEL: Record<string, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  failed: "נכשל",
  expired: "פג תוקף",
};

const SIZE_RANK: Record<string, number> = {
  fabric_large: 10,
  fabric_square: 20,
  fabric_small: 30,
  laminated: 40,
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function excelPhone(value: string) {
  const phone = value.replace(/\s/g, "");
  return phone ? `="${phone}"` : "";
}

function packingType(variant: string) {
  return variant === "laminated" ? "מנויילן" : "בד";
}

function packingSize(variant: string, product?: ProductLabelInfo | null) {
  if (variant === "fabric_large") {
    if (product?.fabricShape === "custom" && product.customFabricSize) {
      return product.customFabricSize;
    }
    return "50×70";
  }
  if (variant === "fabric_square") {
    return "50×50";
  }
  if (variant === "fabric_small") {
    return "35×50";
  }
  if (product?.fabricShape === "square") {
    return "30×30";
  }
  if (product?.fabricShape === "custom" && product.customLaminatedSize) {
    return product.customLaminatedSize;
  }
  return "A3";
}

function sizeRank(variant: string, product?: ProductLabelInfo | null) {
  if (variant === "laminated" && product?.fabricShape === "square") {
    return 50;
  }
  return SIZE_RANK[variant] ?? 99;
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
    "סוג",
    "גודל",
    "קישוט",
    "כמות",
    "לקוח",
    "טלפון",
    "אימייל",
    "נקודת איסוף",
    "כתובת",
    "תאריך",
    "סטטוס",
    "נארז",
    "נשלח",
    "הערות",
    "סה\"כ הזמנה",
  ];

  const lines = filtered.flatMap((order) =>
    order.items.map((item) => {
      const product = item.productId ? productsById.get(item.productId) : undefined;
      const variant = item.variant as ProductVariant;
      return {
        type: packingType(variant),
        size: packingSize(variant, product),
        rank: sizeRank(variant, product),
        productName: item.productName,
        quantity: item.quantity,
        customerName: order.customerName,
        phone: excelPhone(order.customerPhone),
        email: order.customerEmail,
        pickup: order.pickupPointName || "",
        address: [order.address, order.city].filter(Boolean).join(" · "),
        date: formatIsraelDateTime(order.createdAt),
        status: STATUS_LABEL[order.status] ?? order.status,
        packed: order.packed ? "כן" : "לא",
        shipped: order.shipped ? "כן" : "לא",
        notes: order.notes || "",
        total: formatIls(order.totalAgorot),
      };
    }),
  );

  lines.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    const typeCmp = a.type.localeCompare(b.type, "he");
    if (typeCmp) {
      return typeCmp;
    }
    const sizeCmp = a.size.localeCompare(b.size, "he");
    if (sizeCmp) {
      return sizeCmp;
    }
    const productCmp = a.productName.localeCompare(b.productName, "he");
    if (productCmp) {
      return productCmp;
    }
    return a.customerName.localeCompare(b.customerName, "he");
  });

  const rows = lines.map((line) =>
    [
      line.type,
      line.size,
      line.productName,
      String(line.quantity),
      line.customerName,
      line.phone,
      line.email,
      line.pickup,
      line.address,
      line.date,
      line.status,
      line.packed,
      line.shipped,
      line.notes,
      line.total,
    ].map(csvCell),
  );

  const csv = `\uFEFF${[header.map(csvCell).join(","), ...rows.map((row) => row.join(","))].join("\r\n")}`;
  const stamp = formatIsraelDateTime(new Date()).slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
