import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { pickupPoints } from "@/lib/schema";
import { pickupPointSchema } from "@/lib/validations";

function isUuid(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const parsed = pickupPointSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const values = parsed.data;
    await db
      .update(pickupPoints)
      .set({
        name: values.name,
        details: values.details || "",
        hours: values.hours || null,
        sortOrder: values.sortOrder,
        active: values.active,
        updatedAt: new Date(),
      })
      .where(eq(pickupPoints.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  try {
    const db = requireDb();
    await db.delete(pickupPoints).where(eq(pickupPoints.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete" }, { status: 500 });
  }
}
