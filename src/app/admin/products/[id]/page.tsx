import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/queries";
import { agorotToShekels } from "@/lib/money";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id.startsWith("sample-")) {
    return (
      <p className="rounded-lg bg-white p-6">
        אלה מוצרי הדגמה. חברו את Neon והריצו seed כדי לערוך מוצרים אמיתיים.
      </p>
    );
  }
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">עריכת מוצר</h1>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          imageUrl: product.imageUrl,
          galleryUrls: product.galleryUrls,
          fabricShape: product.fabricShape === "square" ? "square" : "standard",
          priceLargeShekels: agorotToShekels(product.priceLargeAgorot ?? 0),
          priceSmallShekels: agorotToShekels(product.priceSmallAgorot ?? 0),
          priceSquareShekels: agorotToShekels(product.priceSquareAgorot ?? 0),
          laminatedA3Price: agorotToShekels(product.priceLaminatedAgorot),
          inStock: product.inStock,
          featured: product.featured,
          sortOrder: product.sortOrder,
        }}
      />
    </div>
  );
}
