"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DealPopup } from "@/components/DealPopup";
import { SalePrice } from "@/components/SalePrice";
import { DEAL_GROUP, offeredVariants, priceForVariant, stockForVariant, variantLabel, type ProductVariant } from "@/lib/pricing";
import type { ProductRecord } from "@/lib/queries";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: ProductRecord }) {
  const { addItem, remainingFor } = useCart();
  const router = useRouter();
  const options = offeredVariants(product);
  const [variant, setVariant] = useState<ProductVariant>(options[0] ?? "laminated");
  const [quantity, setQuantity] = useState(1);
  const [dealGroup, setDealGroup] = useState<"large" | "small" | "laminated" | null>(null);
  const price = priceForVariant(product, variant) ?? 0;
  const remaining = remainingFor(product.id, variant, stockForVariant(product, variant));
  const canAdd = price > 0 && remaining > 0;
  const canAddAnother = remaining > 0;

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="mb-2 font-medium">בחרו גרסה</legend>
        {options.map((option) => {
          const optionStock = remainingFor(product.id, option, stockForVariant(product, option));
          return (
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
                <strong>{variantLabel(option, product)}</strong>
                {optionStock <= 0 ? (
                  <span className="mt-1 block text-sm text-[var(--muted)]">אזל מהמלאי</span>
                ) : null}
              </span>
              <span className="ms-auto text-sm">
                <SalePrice agorot={priceForVariant(product, option) ?? 0} align="end" />
              </span>
            </label>
          );
        })}
      </fieldset>
      <label className="block space-y-1">
        <span>כמות</span>
        <input
          type="number"
          min={1}
          max={99}
          value={quantity}
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
          const added = Math.min(quantity, remaining);
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              variant,
              variantLabel: variantLabel(variant, product),
              unitPriceAgorot: price,
              stockQuantity: stockForVariant(product, variant),
            },
            added,
          );
          const group = DEAL_GROUP[variant];
          if (added === 1 && group) {
            setDealGroup(group);
            return;
          }
          router.push("/cart");
        }}
      >
        {canAdd ? "הוספה לסל" : "אזל מהמלאי"}
      </button>
      {dealGroup ? (
        <DealPopup
          group={dealGroup}
          canAddAnother={canAddAnother}
          onAddAnother={() => {
            addItem(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: product.imageUrl,
                variant,
                variantLabel: variantLabel(variant, product),
                unitPriceAgorot: price,
                stockQuantity: stockForVariant(product, variant),
              },
              1,
            );
            router.push("/cart");
          }}
          onGoCart={() => router.push("/cart")}
          onKeepShopping={() => router.push("/catalog")}
        />
      ) : null}
    </div>
  );
}
