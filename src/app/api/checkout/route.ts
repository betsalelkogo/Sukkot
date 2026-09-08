import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { createPaymentForm, isMorningConfigured } from "@/lib/morning";
import { agorotToShekels } from "@/lib/money";
import { dealDiscountAgorot, priceForVariant, stockForVariant, variantLabel, type ProductVariant } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { orderItems, orders, pickupPoints, products } from "@/lib/schema";
import { releaseStock, reserveStock } from "@/lib/stock";
import { checkoutSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "נסו שוב בעוד כמה דקות." }, { status: 429 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "מערכת ההזמנות עדיין לא מחוברת." }, { status: 503 });
  }
  if (!isMorningConfigured() || !process.env.NEXT_PUBLIC_SITE_URL || !process.env.MORNING_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "מערכת התשלומים עדיין לא הוגדרה." }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "בדקו את הפרטים ונסו שוב." }, { status: 400 });
  }

  const input = parsed.data;
  const db = requireDb();
  const [pickup] = await db
    .select()
    .from(pickupPoints)
    .where(eq(pickupPoints.id, input.pickupPointId))
    .limit(1);
  if (!pickup || !pickup.active) {
    return NextResponse.json({ error: "יש לבחור נקודת איסוף זמינה." }, { status: 400 });
  }
  const ids = [...new Set(input.items.map((item) => item.productId))];
  const catalog = await db.select().from(products).where(inArray(products.id, ids));

  if (catalog.length !== ids.length) {
    return NextResponse.json({ error: "אחד המוצרים אינו זמין." }, { status: 400 });
  }

  try {
    const pricedItems = input.items.map((item) => {
      const product = catalog.find((row) => row.id === item.productId);
      const variant = item.variant as ProductVariant;
      if (!product) {
        throw new Error("UNAVAILABLE");
      }
      const unitPriceAgorot = priceForVariant(product, variant);
      if (!unitPriceAgorot || stockForVariant(product, variant) < item.quantity) {
        throw new Error("UNAVAILABLE");
      }
      return {
        product,
        variant,
        quantity: item.quantity,
        unitPriceAgorot,
      };
    });

    const subtotalAgorot = pricedItems.reduce(
      (sum, item) => sum + item.unitPriceAgorot * item.quantity,
      0,
    );
    const discountAgorot = dealDiscountAgorot(pricedItems);
    const totalAgorot = subtotalAgorot - discountAgorot;

    const reservation = pricedItems.map((item) => ({
      productId: item.product.id,
      variant: item.variant,
      quantity: item.quantity,
    }));
    const reserved = await reserveStock(db, reservation);
    if (!reserved) {
      return NextResponse.json({ error: "אין מספיק מלאי לאחד המוצרים." }, { status: 409 });
    }

    let createdOrderId: string | undefined;
    try {
      const [order] = await db
        .insert(orders)
        .values({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          address: pickup.details || pickup.name,
          city: pickup.name,
          pickupPointId: pickup.id,
          pickupPointName: pickup.name,
          notes: input.notes || null,
          status: "pending",
          totalAgorot,
        })
        .returning();
      createdOrderId = order.id;

      await db.insert(orderItems).values(
        pricedItems.map((item) => ({
          orderId: order.id,
          productId: item.product.id,
          productName: item.product.name,
          variant: item.variant,
          quantity: item.quantity,
          unitPriceAgorot: item.unitPriceAgorot,
        })),
      );

      const income = pricedItems.map((item) => ({
        description: `${item.product.name} — ${variantLabel(item.variant, item.product)}`,
        quantity: item.quantity,
        price: agorotToShekels(item.unitPriceAgorot),
        currency: "ILS" as const,
        vatType: 1 as const,
      }));
      if (discountAgorot > 0) {
        income.push({
          description: "הנחת מבצע זוגות",
          quantity: 1,
          price: -agorotToShekels(discountAgorot),
          currency: "ILS",
          vatType: 1,
        });
      }

      const paymentUrl = await createPaymentForm({
        orderId: order.id,
        description: `הזמנה ${order.id.slice(0, 8)}`,
        amount: agorotToShekels(totalAgorot),
        clientName: input.customerName,
        clientEmail: input.customerEmail,
        clientPhone: input.customerPhone,
        income,
      });

      return NextResponse.json({ url: paymentUrl });
    } catch {
      await releaseStock(db, reservation);
      if (createdOrderId) {
        await db
          .update(orders)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(orders.id, createdOrderId));
      }
      throw new Error("CHECKOUT");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UNAVAILABLE") {
      return NextResponse.json({ error: "אחד המוצרים אינו זמין." }, { status: 400 });
    }
    console.error("checkout_failed");
    return NextResponse.json({ error: "לא ניתן להשלים את ההזמנה כרגע." }, { status: 500 });
  }
}
