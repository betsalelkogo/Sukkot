import { and, eq, gte, inArray, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { orderItems, products } from "./schema";
import type * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

function asCount(value: number) {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

export function quantitiesByProduct(items: { productId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const quantity = asCount(item.quantity);
    if (!item.productId || !quantity) {
      continue;
    }
    map.set(item.productId, (map.get(item.productId) ?? 0) + quantity);
  }
  return map;
}

export async function reserveStock(db: Db, items: { productId: string; quantity: number }[]) {
  const reserved: { productId: string; quantity: number }[] = [];
  for (const [productId, quantity] of quantitiesByProduct(items)) {
    const [row] = await db
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} - ${quantity}`,
        inStock: sql`(${products.stockQuantity} - ${quantity}) > 0`,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), gte(products.stockQuantity, quantity)))
      .returning({ id: products.id });
    if (!row) {
      await releaseStock(db, reserved);
      return false;
    }
    reserved.push({ productId, quantity });
  }
  return true;
}

export async function releaseStock(db: Db, items: { productId: string; quantity: number }[]) {
  for (const [productId, quantity] of quantitiesByProduct(items)) {
    await db
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} + ${quantity}`,
        inStock: true,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  }
}

export async function releaseOrdersStock(db: Db, orderIds: string[]) {
  if (orderIds.length === 0) {
    return;
  }
  const items = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));
  await releaseStock(
    db,
    items.flatMap((item) =>
      item.productId ? [{ productId: item.productId, quantity: item.quantity }] : [],
    ),
  );
}
