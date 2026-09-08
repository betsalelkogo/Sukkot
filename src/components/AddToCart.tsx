"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatIls } from "@/lib/money";
import { priceForVariant, VARIANT_LABEL, type ProductVariant } from "@/lib/pricing";
import type { ProductRecord } from "@/lib/queries";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: ProductRecord }) {
  const { addItem, remainingFor } = useCart();
  const router = useRouter();
  const options = (["fabric_large", "fabric_small", "fabric_square", "laminated"] as const).filter(
    (variant) => priceForVariant(product, variant),
  );
  const [variant, setVariant] = useState<ProductVariant>(options[0] ?? "laminated");
  const [quantity, setQuantity] = useState(1);
  const price = priceForVariant(product, variant) ?? 0;
  const remaining = remainingFor(product.id, product.stockQuantity);
  const canAdd = product.inStock && price > 0 && remaining > 0;

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="mb-2 font-medium">בחרו גרסה</legend>
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--line)] p-3"
          >
            <input
              type="radio"
              name="variant"
              checked={variant === option}
              onChange={() => setVariant(option)}
            />
            <span>
              <strong>{VARIANT_LABEL[option]}</strong>
            </span>
            <span className="ms-auto font-semibold">{formatIls(priceForVariant(product, option) ?? 0)}</span>
          </label>
        ))}
      </fieldset>
      <p className="text-sm text-[var(--muted)]">
        {remaining > 0 ? `נשארו ${remaining} במלאי` : "אזל מהמלאי"}
      </p>
      <label className="block space-y-1">
        <span>כמות</span>
        <input
          type="number"
          min={1}
          max={Math.max(1, remaining)}
          value={Math.min(quantity, Math.max(1, remaining))}
          disabled={!canAdd}
          onChange={(event) => setQuantity(Number(event.target.value) || 1)}
          className="w-24 rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <button
        type="button"
        className="btn-primary w-full"
        disabled={!canAdd}
        onClick={() => {
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              variant,
              unitPriceAgorot: price,
              stockQuantity: product.stockQuantity,
            },
            Math.min(quantity, remaining),
          );
          router.push("/cart");
        }}
      >
        {canAdd ? "הוספה לסל" : remaining <= 0 ? "אזל מהמלאי" : "לא זמין"}
      </button>
    </div>
  );
}
