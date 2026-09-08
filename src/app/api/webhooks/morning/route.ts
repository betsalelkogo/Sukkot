import { eq } from "drizzle-orm";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { getMorningDocument } from "@/lib/morning";
import { orders } from "@/lib/schema";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function readField(body: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    if (body[key]) {
      return body[key];
    }
  }
  return "";
}

export async function POST(request: Request) {
  const expected = process.env.MORNING_WEBHOOK_TOKEN;
  const url = new URL(request.url);
  const provided = url.searchParams.get("token") ?? "";
  if (!expected || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let raw: Record<string, string> = {};
  try {
    if (contentType.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      raw = Object.fromEntries(
        Object.entries(json).map(([key, value]) => [key, String(value ?? "")]),
      );
    } else {
      const text = await request.text();
      raw = Object.fromEntries(new URLSearchParams(text));
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const orderId = readField(raw, ["custom", "external_data", "externalData", "externalId"]);
  const documentId = readField(raw, ["documentId", "document_id", "id"]);

  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ ok: true });
  }

  const db = requireDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ ok: true });
  }

  if (documentId) {
    const document = await getMorningDocument(documentId);
    if (!document?.id) {
      return NextResponse.json({ error: "Unverified" }, { status: 400 });
    }
  }

  if (order.status !== "paid") {
    await db
      .update(orders)
      .set({
        status: "paid",
        morningDocumentId: documentId || order.morningDocumentId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }

  return NextResponse.json({ ok: true });
}
