import { eq } from "drizzle-orm";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { fulfillPaidCheckout } from "@/lib/checkout-session";
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

  const sessionId = readField(raw, [
    "custom",
    "external_data",
    "externalData",
    "externalId",
    "more_info",
    "moreInfo",
  ]);
  const documentId = readField(raw, ["documentId", "document_id", "docId", "doc_id"]);

  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    console.error("morning_webhook_missing_session", { keys: Object.keys(raw) });
    return NextResponse.json({ ok: true });
  }

  if (documentId) {
    const document = await getMorningDocument(documentId);
    if (!document?.id) {
      console.error("morning_webhook_document_unverified");
    }
  }

  const db = requireDb();
  try {
    const created = await fulfillPaidCheckout(db, sessionId, documentId);
    if (!created) {
      const [order] = await db.select().from(orders).where(eq(orders.id, sessionId)).limit(1);
      if (order && order.status !== "paid") {
        await db
          .update(orders)
          .set({
            status: "paid",
            morningDocumentId: documentId || order.morningDocumentId,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, sessionId));
      }
    }
  } catch {
    console.error("checkout_fulfill_failed");
    return NextResponse.json({ error: "Unable to save order" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
