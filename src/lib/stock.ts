import { and, eq, gte, inArray, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { VARIANTS, type ProductVariant } from "./pricing";
import { orderItems, products } from "./schema";
import type * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;
type StockItem = { productId: string; variant: ProductVariant; quantity: number };

function asCount(value: number) {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function asVariant(value: string): ProductVariant | null {
  return VARIANTS.includes(value as ProductVariant) ? (value as ProductVariant) : null;
}

function stockColumn(variant: ProductVariant) {
  if (variant === "fabric_large") return products.stockLarge;
  if (variant === "fabric_small") return products.stockSmall;
  if (variant === "fabric_square") return products.stockSquare;
  return products.stockLaminated;
}

function inStockAfter(variant: ProductVariant, quantity: number, direction: "reserve" | "release") {
  const delta = direction === "reserve" ? -quantity : quantity;
  const large = variant === "fabric_large" ? sql`${products.stockLarge} + ${delta}` : products.stockLarge;
  const small = variant === "fabric_small" ? sql`${products.stockSmall} + ${delta}` : products.stockSmall;
  const square = variant === "fabric_square" ? sql`${products.stockSquare} + ${delta}` : products.stockSquare;
  const laminated = variant === "laminated" ? sql`${products.stockLaminated} + ${delta}` : products.stockLaminated;
  return sql`${large} > 0 OR ${small} > 0 OR ${square} > 0 OR ${laminated} > 0`;
}

function stockPatch(variant: ProductVariant, quantity: number, direction: "reserve" | "release") {
  const delta = direction === "reserve" ? -quantity : quantity;
  const inStock = inStockAfter(variant, quantity, direction);
  const updatedAt = new Date();
  if (variant === "fabric_large") {
    return { stockLarge: sql`${products.stockLarge} + ${delta}`, inStock, updatedAt };
  }
  if (variant === "fabric_small") {
    return { stockSmall: sql`${products.stockSmall} + ${delta}`, inStock, updatedAt };
  }
  if (variant === "fabric_square") {
    return { stockSquare: sql`${products.stockSquare} + ${delta}`, inStock, updatedAt };
  }
  return { stockLaminated: sql`${products.stockLaminated} + ${delta}`, inStock, updatedAt };
}

export function quantitiesBySku(items: StockItem[]) {
  const map = new Map<string, StockItem>();
  for (const item of items) {
    const quantity = asCount(item.quantity);
    if (!item.productId || !quantity) {
      continue;
    }
    const key = `${item.productId}:${item.variant}`;
    const current = map.get(key);
    if (current) {
      current.quantity += quantity;
    } else {
      map.set(key, { productId: item.productId, variant: item.variant, quantity });
    }
  }
  return [...map.values()];
}

export async function reserveStock(db: Db, items: StockItem[]) {
  const reserved: StockItem[] = [];
  for (const item of quantitiesBySku(items)) {
    const [row] = await db
      .update(products)
      .set(stockPatch(item.variant, item.quantity, "reserve"))
      .where(and(eq(products.id, item.productId), gte(stockColumn(item.variant), item.quantity)))
      .returning({ id: products.id });
    if (!row) {
      await releaseStock(db, reserved);
      return false;
    }
    reserved.push(item);
  }
  return true;
}

export async function releaseStock(db: Db, items: StockItem[]) {
  for (const item of quantitiesBySku(items)) {
    await db
      .update(products)
      .set(stockPatch(item.variant, item.quantity, "release"))
      .where(eq(products.id, item.productId));
  }
}

export async function releaseOrdersStock(db: Db, orderIds: string[]) {
  if (orderIds.length === 0) {
    return;
  }
  const items = await db
    .select({
      productId: orderItems.productId,
      variant: orderItems.variant,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));
  await releaseStock(
    db,
    items.flatMap((item) => {
      const variant = asVariant(item.variant);
      if (!item.productId || !variant) {
        return [];
      }
      return [{ productId: item.productId, variant, quantity: item.quantity }];
    }),
  );
}
