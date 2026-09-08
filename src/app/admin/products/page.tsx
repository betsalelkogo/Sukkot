import Link from "next/link";
import { formatIls } from "@/lib/money";
import { priceForVariant, stockForVariant, type ProductVariant } from "@/lib/pricing";
import { getProducts } from "@/lib/queries";

function stockSummary(product: Awaited<ReturnType<typeof getProducts>>[number]) {
  const parts = (
    [
      ["fabric_large", "גדול"],
      ["fabric_small", "קטן"],
      ["fabric_square", "50×50"],
      ["laminated", "A3"],
    ] as const
  )
    .filter(([variant]) => priceForVariant(product, variant as ProductVariant))
    .map(([variant, label]) => `${label} ${stockForVariant(product, variant)}`);
  return parts.length ? parts.join(" · ") : "אזל";
}

export default async function AdminProductsPage() {
  const productList = await getProducts();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">מוצרים</h1>
        <Link href="/admin/products/new" className="btn-primary">
          מוצר חדש
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-[var(--paper)]">
            <tr>
              <th className="p-3">תמונה</th>
              <th className="p-3">שם</th>
              <th className="p-3">בד גדול</th>
              <th className="p-3">מנויילן</th>
              <th className="p-3">מלאי</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => (
              <tr key={product.id} className="border-t border-[var(--line)]">
                <td className="p-3">
                  <img src={product.imageUrl} alt="" className="h-14 w-14 rounded object-contain bg-[var(--paper)]" />
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">
                  {product.priceLargeAgorot
                    ? formatIls(product.priceLargeAgorot)
                    : product.priceSquareAgorot
                      ? formatIls(product.priceSquareAgorot)
                      : "-"}
                </td>
                <td className="p-3">{formatIls(product.priceLaminatedAgorot)}</td>
                <td className="p-3">{stockSummary(product)}</td>
                <td className="p-3">
                  <Link href={`/admin/products/${product.id}`} className="text-[var(--teal)]">
                    עריכה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
