import { asc, desc, eq, inArray } from "drizzle-orm";
import { DEFAULT_CONTENT, SAMPLE_PRODUCTS } from "./defaults";
import { getDb } from "./db";
import { parseGallery } from "./images";
import { hasAnyStock } from "./pricing";
import { orderItems, orders, pickupPoints, products, siteContent } from "./schema";

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  fabricShape: string;
  customFabricSize: string | null;
  customLaminatedSize: string | null;
  priceLargeAgorot: number | null;
  priceSmallAgorot: number | null;
  priceSquareAgorot: number | null;
  priceLaminatedAgorot: number;
  stockLarge: number;
  stockSmall: number;
  stockSquare: number;
  stockLaminated: number;
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
};

function asRecord(
  product: Omit<
    ProductRecord,
    | "id"
    | "inStock"
    | "galleryUrls"
    | "stockLarge"
    | "stockSmall"
    | "stockSquare"
    | "stockLaminated"
    | "customFabricSize"
    | "customLaminatedSize"
  > & {
    id?: string;
    inStock?: boolean;
    galleryUrls?: string[];
    stockLarge?: number;
    stockSmall?: number;
    stockSquare?: number;
    stockLaminated?: number;
    customFabricSize?: string | null;
    customLaminatedSize?: string | null;
  },
  index: number,
): ProductRecord {
  const stockLarge = product.stockLarge ?? (product.fabricShape === "square" ? 0 : 10);
  const stockSmall = product.stockSmall ?? (product.fabricShape === "square" || product.fabricShape === "custom" ? 0 : 10);
  const stockSquare = product.stockSquare ?? (product.fabricShape === "square" ? 10 : 0);
  const stockLaminated = product.stockLaminated ?? 10;
  const record = {
    ...product,
    id: product.id ?? `sample-${index + 1}`,
    customFabricSize: product.customFabricSize ?? null,
    customLaminatedSize: product.customLaminatedSize ?? null,
    stockLarge,
    stockSmall,
    stockSquare,
    stockLaminated,
    galleryUrls: product.galleryUrls ?? [],
    inStock: false,
  };
  return { ...record, inStock: hasAnyStock(record) };
}

function fromRow(row: typeof products.$inferSelect): ProductRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    galleryUrls: parseGallery(row.galleryUrls),
    fabricShape: row.fabricShape,
    customFabricSize: row.customFabricSize,
    customLaminatedSize: row.customLaminatedSize,
    priceLargeAgorot: row.priceLargeAgorot,
    priceSmallAgorot: row.priceSmallAgorot,
    priceSquareAgorot: row.priceSquareAgorot,
    priceLaminatedAgorot: row.priceLaminatedAgorot,
    stockLarge: row.stockLarge,
    stockSmall: row.stockSmall,
    stockSquare: row.stockSquare,
    stockLaminated: row.stockLaminated,
    inStock: hasAnyStock(row),
    featured: row.featured,
    sortOrder: row.sortOrder,
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
    const mapped = rows.map(fromRow);
    return options?.inStockOnly ? mapped.filter((row) => row.inStock) : mapped;
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
  return row ? fromRow(row) : null;
}

export type PickupPointRecord = {
  id: string;
  name: string;
  details: string;
  hours: string | null;
  sortOrder: number;
  active: boolean;
};

export async function getPickupPoints(options?: { activeOnly?: boolean }): Promise<PickupPointRecord[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  try {
    const rows = await db.select().from(pickupPoints);
    return rows
      .filter((row) => (options?.activeOnly ? row.active : true))
      .map((row) => ({
        id: row.id,
        name: row.name,
        details: row.details,
        hours: row.hours,
        sortOrder: row.sortOrder,
        active: row.active,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  } catch {
    return [];
  }
}

export async function getOrders() {
  const db = getDb();
  if (!db) {
    return [];
  }
  return db.select().from(orders).where(eq(orders.status, "paid")).orderBy(desc(orders.createdAt));
}

export async function getPaidOrdersWithItems() {
  const list = await getOrders();
  const db = getDb();
  if (!db || list.length === 0) {
    return list.map((order) => ({ ...order, items: [] as (typeof orderItems.$inferSelect)[] }));
  }
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        list.map((order) => order.id),
      ),
    );
  const byOrder = new Map<string, typeof items>();
  for (const item of items) {
    const current = byOrder.get(item.orderId) ?? [];
    current.push(item);
    byOrder.set(item.orderId, current);
  }
  return list.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }));
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
