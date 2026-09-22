"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_CONTENT } from "@/lib/defaults";

export function SeasonForm({ defaultValues }: { defaultValues: typeof DEFAULT_CONTENT }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [topImage, setTopImage] = useState(defaultValues.closed_top_image);
  const [bottomImage, setBottomImage] = useState(defaultValues.closed_bottom_image);
  const [ordersOpen, setOrdersOpen] = useState(defaultValues.orders_open === "true");

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

  async function onImage(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setUploading(true);
    setError("");
    try {
      setter(await uploadFile(file));
    } catch {
      setError("לא ניתן להעלות את התמונה. נסו JPEG, PNG, WebP או GIF עד 4MB.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      orders_open: ordersOpen ? "true" : "false",
      closed_title: String(form.get("closed_title") ?? ""),
      closed_intro: String(form.get("closed_intro") ?? ""),
      closed_points: String(form.get("closed_points") ?? ""),
      closed_outro: String(form.get("closed_outro") ?? ""),
      closed_top_image: topImage,
      closed_bottom_image: bottomImage,
    };
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("לא ניתן לשמור את ההגדרות.");
      setPending(false);
      return;
    }
    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-6">
      <label className="flex items-center gap-3 rounded-md bg-[var(--paper)] px-4 py-3">
        <input
          type="checkbox"
          checked={ordersOpen}
          onChange={(event) => setOrdersOpen(event.target.checked)}
        />
        <span>
          <strong>ההזמנות פתוחות</strong>
          <span className="mt-1 block text-sm text-[var(--muted)]">
            כשזה מסומן, הקטלוג והתשלום חוזרים. כשזה לא מסומן, הלקוחות רואים את ההודעה למטה.
          </span>
        </span>
      </label>
      <label className="block space-y-1">
        <span>כותרת</span>
        <input
          name="closed_title"
          defaultValue={defaultValues.closed_title}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="block space-y-1">
        <span>טקסט עליון</span>
        <textarea
          name="closed_intro"
          defaultValue={defaultValues.closed_intro}
          rows={4}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="block space-y-1">
        <span>נקודות מכירה</span>
        <textarea
          name="closed_points"
          defaultValue={defaultValues.closed_points}
          rows={8}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2 font-mono text-sm leading-7"
        />
        <span className="block text-sm text-[var(--muted)]">
          שורה לכל נקודה, בפורמט: מקום | איש קשר | טלפון | כתובת
        </span>
      </label>
      <label className="block space-y-1">
        <span>טקסט תחתון</span>
        <textarea
          name="closed_outro"
          defaultValue={defaultValues.closed_outro}
          rows={4}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <ImageField
        label="תמונה עליונה"
        value={topImage}
        onChange={(event) => onImage(event, setTopImage)}
        onClear={() => setTopImage("")}
      />
      <ImageField
        label="תמונה תחתונה"
        value={bottomImage}
        onChange={(event) => onImage(event, setBottomImage)}
        onClear={() => setBottomImage("")}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending || uploading}>
        {uploading ? "מעלה תמונה..." : "שמירת הודעת סיום עונה"}
      </button>
    </form>
  );
}

function ImageField({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <span>{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="max-h-40 rounded-md border border-[var(--line)]" />
      ) : (
        <p className="text-sm text-[var(--muted)]">אין תמונה</p>
      )}
      <div className="flex flex-wrap gap-3">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onChange} />
        {value ? (
          <button type="button" className="text-sm text-red-700" onClick={onClear}>
            הסרת תמונה
          </button>
        ) : null}
      </div>
    </div>
  );
}
