import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { shekelsToAgorot } from "@/lib/money";
import { hasAnyStock } from "@/lib/pricing";
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
        customFabricSize: values.fabricShape === "custom" ? values.customFabricSize || null : null,
        customLaminatedSize: values.fabricShape === "custom" ? values.customLaminatedSize || null : null,
        priceLargeAgorot: values.fabricShape === "square" ? null : toAgorot(values.priceLargeShekels),
        priceSmallAgorot: values.fabricShape === "standard" ? toAgorot(values.priceSmallShekels) : null,
        priceSquareAgorot: values.fabricShape === "square" ? toAgorot(values.priceSquareShekels) : null,
        priceLaminatedAgorot: toAgorot(values.laminatedA3Price) ?? 0,
        stockLarge: values.stockLarge,
        stockSmall: values.stockSmall,
        stockSquare: values.stockSquare,
        stockLaminated: values.stockLaminated,
        inStock: hasAnyStock({
          priceLargeAgorot: values.fabricShape === "square" ? null : toAgorot(values.priceLargeShekels),
          priceSmallAgorot: values.fabricShape === "standard" ? toAgorot(values.priceSmallShekels) : null,
          priceSquareAgorot: values.fabricShape === "square" ? toAgorot(values.priceSquareShekels) : null,
          priceLaminatedAgorot: toAgorot(values.laminatedA3Price) ?? 0,
          stockLarge: values.stockLarge,
          stockSmall: values.stockSmall,
          stockSquare: values.stockSquare,
          stockLaminated: values.stockLaminated,
        }),
        featured: values.featured,
        sortOrder: values.sortOrder,
      })
      .returning();
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}
