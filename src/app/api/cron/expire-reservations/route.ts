import { and, eq, lt } from "drizzle-orm";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/schema";
import { releaseOrdersStock } from "@/lib/stock";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || expected.length < 16) {
    return false;
  }
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ expired: 0 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expired = await db
    .update(orders)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(orders.status, "pending"), lt(orders.createdAt, cutoff)))
    .returning({ id: orders.id });

  await releaseOrdersStock(
    db,
    expired.map((order) => order.id),
  );

  return NextResponse.json({ expired: expired.length });
}
