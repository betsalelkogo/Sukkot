import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { VARIANTS, type ProductVariant } from "./pricing";
import { checkoutSessions, orderItems, orders } from "./schema";
import { releaseStock } from "./stock";
import type * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export const checkoutItemSnapshotSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(120),
  variant: z.enum(VARIANTS),
  quantity: z.number().int().min(1).max(99),
  unitPriceAgorot: z.number().int().positive(),
});

export type CheckoutItemSnapshot = z.infer<typeof checkoutItemSnapshotSchema>;

function parseItems(raw: string): CheckoutItemSnapshot[] {
  return z.array(checkoutItemSnapshotSchema).parse(JSON.parse(raw));
}

function stockFromItems(items: CheckoutItemSnapshot[]) {
  return items.map((item) => ({
    productId: item.productId,
    variant: item.variant as ProductVariant,
    quantity: item.quantity,
  }));
}

export async function createCheckoutSession(
  db: Db,
  input: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    pickupPointId: string;
    pickupPointName: string;
    notes: string | null;
    totalAgorot: number;
    items: CheckoutItemSnapshot[];
  },
) {
  const [session] = await db
    .insert(checkoutSessions)
    .values({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      address: input.address,
      city: input.city,
      pickupPointId: input.pickupPointId,
      pickupPointName: input.pickupPointName,
      notes: input.notes,
      totalAgorot: input.totalAgorot,
      itemsJson: JSON.stringify(input.items),
      status: "open",
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .returning();
  return session;
}

export async function abandonCheckoutSession(db: Db, sessionId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return false;
  }
  const [session] = await db
    .update(checkoutSessions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(checkoutSessions.id, sessionId), eq(checkoutSessions.status, "open")))
    .returning();
  if (!session) {
    return false;
  }
  await releaseStock(db, stockFromItems(parseItems(session.itemsJson)));
  return true;
}

export async function fulfillPaidCheckout(
  db: Db,
  sessionId: string,
  documentId: string,
) {
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.id, sessionId))
    .limit(1);
  if (!session) {
    return false;
  }
  if (session.status === "paid" && session.orderId) {
    return true;
  }
  if (session.status !== "open") {
    return false;
  }

  const items = parseItems(session.itemsJson);
  const [existing] = await db.select().from(orders).where(eq(orders.id, session.id)).limit(1);
  const orderId = existing?.id ?? session.id;

  if (!existing) {
    await db.insert(orders).values({
      id: session.id,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      customerPhone: session.customerPhone,
      address: session.address,
      city: session.city,
      pickupPointId: session.pickupPointId,
      pickupPointName: session.pickupPointName,
      notes: session.notes,
      status: "paid",
      totalAgorot: session.totalAgorot,
      morningDocumentId: documentId || null,
    });
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId,
        productId: item.productId,
        productName: item.productName,
        variant: item.variant,
        quantity: item.quantity,
        unitPriceAgorot: item.unitPriceAgorot,
      })),
    );
  } else if (existing.status !== "paid") {
    await db
      .update(orders)
      .set({
        status: "paid",
        morningDocumentId: documentId || existing.morningDocumentId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, existing.id));
  }

  await db
    .update(checkoutSessions)
    .set({ status: "paid", orderId, updatedAt: new Date() })
    .where(eq(checkoutSessions.id, sessionId));
  return true;
}

export async function expireOpenCheckoutSessions(db: Db) {
  const expired = await db
    .update(checkoutSessions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(checkoutSessions.status, "open"), lt(checkoutSessions.expiresAt, new Date())))
    .returning();

  for (const session of expired) {
    await releaseStock(db, stockFromItems(parseItems(session.itemsJson)));
  }
  return expired.length;
}
