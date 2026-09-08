import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { shekelsToAgorot } from "@/lib/money";
import { products } from "@/lib/schema";
import { productSchema } from "@/lib/validations";

function toAgorot(value: number) {
  return value > 0 ? shekelsToAgorot(value) : null;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const values = parsed.data;
    const [row] = await db
      .insert(products)
      .values({
        name: values.name,
        slug: values.slug,
        description: values.description,
        imageUrl: values.imageUrl,
        galleryUrls: JSON.stringify(values.galleryUrls),
        fabricShape: values.fabricShape,
        priceLargeAgorot: toAgorot(values.priceLargeShekels),
        priceSmallAgorot: toAgorot(values.priceSmallShekels),
        priceSquareAgorot: toAgorot(values.priceSquareShekels),
        priceLaminatedAgorot: shekelsToAgorot(values.laminatedA3Price),
        inStock: values.inStock,
        featured: values.featured,
        sortOrder: values.sortOrder,
      })
      .returning();
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}
