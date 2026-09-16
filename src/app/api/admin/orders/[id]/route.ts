import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { orders } from "@/lib/schema";
import { orderFulfillmentSchema } from "@/lib/validations";

function isUuid(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const parsed = orderFulfillmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const [updated] = await db
      .update(orders)
      .set({
        packed: parsed.data.packed,
        shipped: parsed.data.shipped,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning({ id: orders.id });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}
