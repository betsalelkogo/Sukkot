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
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(defaultValues?.galleryUrls ?? []);

  async function uploadFile(file: File) {
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) {
      throw new Error("upload failed");
    }
    const data = (await res.json()) as { url?: string };
    if (!data.url) {
      throw new Error("upload failed");
    }
    return data.url;
  }

  async function onMainImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setUploading(true);
    setError("");
    try {
      setImageUrl(await uploadFile(file));
    } catch {
      setError("לא ניתן להעלות את התמונה. נסו JPEG, PNG, WebP או GIF עד 4MB.");
    } finally {
      setUploading(false);
    }
  }

  async function onGalleryImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) {
      return;
    }
    if (galleryUrls.length + files.length > 8) {
      setError("אפשר עד 8 תמונות נוספות.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadFile(file));
      }
      setGalleryUrls((current) => [...current, ...uploaded]);
    } catch {
      setError("לא ניתן להעלות את התמונות. נסו JPEG, PNG, WebP או GIF עד 4MB.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl) {
      setError("יש להעלות תמונה ראשית או להזין כתובת.");
      return;
    }
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      description: String(form.get("description") ?? ""),
      imageUrl,
      galleryUrls,
      fabricShape: String(form.get("fabricShape") ?? "standard"),
      priceLargeShekels: Number(form.get("priceLargeShekels") || 0),
      priceSmallShekels: Number(form.get("priceSmallShekels") || 0),
      priceSquareShekels: Number(form.get("priceSquareShekels") || 0),
      laminatedA3Price: Number(form.get("laminatedA3Price")),
      stockQuantity: Number(form.get("stockQuantity") || 0),
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

      <div className="space-y-3 rounded-md border border-[var(--line)] p-4">
        <p className="font-medium">תמונה ראשית</p>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-48 w-full rounded-md object-contain bg-[var(--paper)]" />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-md bg-[var(--paper)] text-sm text-[var(--muted)]">
            אין תמונה עדיין
          </div>
        )}
        <label className="block space-y-1">
          <span>העלאה או החלפה</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onMainImage}
            disabled={uploading}
            className="w-full text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span>או כתובת קיימת</span>
          <input
            type="text"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="/images/products/... או https://"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2"
          />
        </label>
      </div>

      <div className="space-y-3 rounded-md border border-[var(--line)] p-4">
        <p className="font-medium">תמונות נוספות</p>
        {galleryUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {galleryUrls.map((url) => (
              <div key={url} className="space-y-2">
                <img src={url} alt="" className="h-28 w-full rounded-md object-contain bg-[var(--paper)]" />
                <button
                  type="button"
                  className="text-sm text-red-700"
                  onClick={() => setGalleryUrls((current) => current.filter((item) => item !== url))}
                >
                  הסרה
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">אפשר להוסיף עוד זוויות או תמונות אווירה.</p>
        )}
        <label className="block space-y-1">
          <span>הוספת תמונות</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={onGalleryImages}
            disabled={uploading || galleryUrls.length >= 8}
            className="w-full text-sm"
          />
        </label>
      </div>

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
      <Field
        name="stockQuantity"
        label="כמות במלאי"
        type="number"
        defaultValue={defaultValues?.stockQuantity ?? 10}
        required
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured ?? false} />
        מוצג בולט
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {uploading ? <p className="text-sm text-[var(--muted)]">מעלה תמונה…</p> : null}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={pending || uploading}>
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
