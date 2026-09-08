"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatIls } from "@/lib/money";
import { priceForVariant, VARIANT_LABEL, type ProductVariant } from "@/lib/pricing";
import type { ProductRecord } from "@/lib/queries";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: ProductRecord }) {
  const { addItem } = useCart();
  const router = useRouter();
  const options = (["fabric_large", "fabric_small", "fabric_square", "laminated"] as const).filter(
    (variant) => priceForVariant(product, variant),
  );
  const [variant, setVariant] = useState<ProductVariant>(options[0] ?? "laminated");
  const price = priceForVariant(product, variant) ?? 0;

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
      <button
        type="button"
        className="btn-primary w-full"
        disabled={!product.inStock || !price}
        onClick={() => {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl,
            variant,
            unitPriceAgorot: price,
          });
          router.push("/cart");
        }}
      >
        {product.inStock ? "הוספה לסל" : "אזל מהמלאי"}
      </button>
    </div>
  );
}
