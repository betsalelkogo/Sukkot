import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { pickupPoints } from "@/lib/schema";
import { pickupPointSchema } from "@/lib/validations";

export async function POST(request: Request) {
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
    const [row] = await db
      .insert(pickupPoints)
      .values({
        name: values.name,
        details: values.details || "",
        hours: values.hours || null,
        sortOrder: values.sortOrder,
        active: values.active,
      })
      .returning();
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}
