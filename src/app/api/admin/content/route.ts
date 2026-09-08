import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { siteContent } from "@/lib/schema";
import { contentSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const parsed = contentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const entries = Object.entries(parsed.data);
    for (const [key, value] of entries) {
      await db
        .insert(siteContent)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteContent.key,
          set: { value, updatedAt: new Date() },
        });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}
