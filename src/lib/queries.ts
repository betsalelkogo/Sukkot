import { asc, desc, eq } from "drizzle-orm";
import { DEFAULT_CONTENT, SAMPLE_PRODUCTS } from "./defaults";
import { getDb } from "./db";
import { orderItems, orders, products, siteContent } from "./schema";

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  fabricShape: string;
  priceLargeAgorot: number | null;
  priceSmallAgorot: number | null;
  priceSquareAgorot: number | null;
  priceLaminatedAgorot: number;
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
};

function asRecord(
  product: Omit<ProductRecord, "id" | "inStock"> & { id?: string; inStock?: boolean },
  index: number,
): ProductRecord {
  return {
    ...product,
    id: product.id ?? `sample-${index + 1}`,
    inStock: product.inStock ?? true,
  };
}

export async function getContent() {
  const db = getDb();
  if (!db) {
    return DEFAULT_CONTENT;
  }
  try {
    const rows = await db.select().from(siteContent);
    const map = { ...DEFAULT_CONTENT };
    for (const row of rows) {
      if (row.key in map) {
        map[row.key as keyof typeof map] = row.value;
      }
    }
    return map;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function getProducts(options?: { inStockOnly?: boolean }): Promise<ProductRecord[]> {
  const db = getDb();
  if (!db) {
    return SAMPLE_PRODUCTS.map((product, index) => asRecord(product, index));
  }
  try {
    const rows = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.name));
    return options?.inStockOnly ? rows.filter((row) => row.inStock) : rows;
  } catch {
    return SAMPLE_PRODUCTS.map((product, index) => asRecord(product, index));
  }
}

export async function getProductBySlug(slug: string) {
  const all = await getProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ?? null;
}

export async function getOrders() {
  const db = getDb();
  if (!db) {
    return [];
  }
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderWithItems(id: string) {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) {
    return null;
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { ...order, items };
}
