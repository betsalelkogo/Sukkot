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
    const data = { ...parsed.data };
    if (data.terms_title || data.terms_body) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      data.terms_updated = `${dd}.${mm}.${now.getFullYear()}`;
    }
    const entries = Object.entries(data).filter((entry): entry is [string, string] => typeof entry[1] === "string");
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
