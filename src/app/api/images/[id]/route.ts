import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { productImages } from "@/lib/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const [row] = await db.select().from(productImages).where(eq(productImages.id, id)).limit(1);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const bytes = Buffer.from(row.data, "base64");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": row.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
