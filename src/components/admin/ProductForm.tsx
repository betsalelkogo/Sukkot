"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductInput } from "@/lib/validations";

type Props = {
  productId?: string;
  defaultValues?: Partial<ProductInput>;
};

export function ProductForm({ productId, defaultValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      description: String(form.get("description") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? ""),
      fabricShape: String(form.get("fabricShape") ?? "standard"),
      priceLargeShekels: Number(form.get("priceLargeShekels") || 0),
      priceSmallShekels: Number(form.get("priceSmallShekels") || 0),
      priceSquareShekels: Number(form.get("priceSquareShekels") || 0),
      laminatedA3Price: Number(form.get("laminatedA3Price")),
      inStock: form.get("inStock") === "on",
      featured: form.get("featured") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };

    const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("לא ניתן לשמור. בדקו את השדות.");
      setPending(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (!productId || !confirm("למחוק את המוצר?")) {
      return;
    }
    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-6">
      <Field name="name" label="שם" defaultValue={defaultValues?.name} required />
      <Field name="slug" label="כתובת (באנגלית)" defaultValue={defaultValues?.slug} required />
      <label className="block space-y-1">
        <span>תיאור</span>
        <textarea
          name="description"
          defaultValue={defaultValues?.description}
          required
          rows={4}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <Field name="imageUrl" label="כתובת תמונה או נתיב /images/..." defaultValue={defaultValues?.imageUrl} required />
      <label className="block space-y-1">
        <span>צורת בד</span>
        <select
          name="fabricShape"
          defaultValue={defaultValues?.fabricShape ?? "standard"}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        >
          <option value="standard">רגיל (גדול/קטן)</option>
          <option value="square">מרובע 50×50</option>
        </select>
      </label>
      <Field name="priceLargeShekels" label="מחיר בד גדול 50×70 (0 אם אין)" type="number" defaultValue={defaultValues?.priceLargeShekels ?? 0} />
      <Field name="priceSmallShekels" label="מחיר בד קטן 35×50 (0 אם אין)" type="number" defaultValue={defaultValues?.priceSmallShekels ?? 0} />
      <Field name="priceSquareShekels" label="מחיר בד 50×50 (0 אם אין)" type="number" defaultValue={defaultValues?.priceSquareShekels ?? 0} />
      <Field name="laminatedA3Price" label="מחיר מנויילן A3" type="number" defaultValue={defaultValues?.laminatedA3Price} required />
      <Field name="sortOrder" label="סדר תצוגה" type="number" defaultValue={defaultValues?.sortOrder ?? 0} />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="inStock" defaultChecked={defaultValues?.inStock ?? true} />
        במלאי
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured ?? false} />
        מוצג בולט
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          שמירה
        </button>
        {productId ? (
          <button type="button" onClick={onDelete} className="text-red-700">
            מחיקה
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "1" : undefined}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-[var(--line)] px-3 py-2"
      />
    </label>
  );
}
