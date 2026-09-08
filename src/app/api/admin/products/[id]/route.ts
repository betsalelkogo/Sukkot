import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { shekelsToAgorot } from "@/lib/money";
import { hasAnyStock } from "@/lib/pricing";
import { products } from "@/lib/schema";
import { productSchema } from "@/lib/validations";

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
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const values = parsed.data;
    await db
      .update(products)
      .set({
        name: values.name,
        slug: values.slug,
        description: values.description,
        imageUrl: values.imageUrl,
        galleryUrls: JSON.stringify(values.galleryUrls),
        fabricShape: values.fabricShape,
        customFabricSize: values.fabricShape === "custom" ? values.customFabricSize || null : null,
        customLaminatedSize: values.fabricShape === "custom" ? values.customLaminatedSize || null : null,
        priceLargeAgorot: values.fabricShape === "square" || values.priceLargeShekels <= 0 ? null : shekelsToAgorot(values.priceLargeShekels),
        priceSmallAgorot: values.fabricShape !== "standard" || values.priceSmallShekels <= 0 ? null : shekelsToAgorot(values.priceSmallShekels),
        priceSquareAgorot: values.fabricShape !== "square" || values.priceSquareShekels <= 0 ? null : shekelsToAgorot(values.priceSquareShekels),
        priceLaminatedAgorot: values.laminatedA3Price > 0 ? shekelsToAgorot(values.laminatedA3Price) : 0,
        stockLarge: values.stockLarge,
        stockSmall: values.stockSmall,
        stockSquare: values.stockSquare,
        stockLaminated: values.stockLaminated,
        inStock: hasAnyStock({
          priceLargeAgorot: values.fabricShape === "square" || values.priceLargeShekels <= 0 ? null : shekelsToAgorot(values.priceLargeShekels),
          priceSmallAgorot: values.fabricShape !== "standard" || values.priceSmallShekels <= 0 ? null : shekelsToAgorot(values.priceSmallShekels),
          priceSquareAgorot: values.fabricShape !== "square" || values.priceSquareShekels <= 0 ? null : shekelsToAgorot(values.priceSquareShekels),
          priceLaminatedAgorot: values.laminatedA3Price > 0 ? shekelsToAgorot(values.laminatedA3Price) : 0,
          stockLarge: values.stockLarge,
          stockSmall: values.stockSmall,
          stockSquare: values.stockSquare,
          stockLaminated: values.stockLaminated,
        }),
        featured: values.featured,
        sortOrder: values.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
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
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete" }, { status: 500 });
  }
}
