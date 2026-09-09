"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_CONTENT, HOME_CONTENT_KEYS } from "@/lib/defaults";

export function ContentForm({ defaultValues }: { defaultValues: typeof DEFAULT_CONTENT }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      HOME_CONTENT_KEYS.map((key) => [key, String(form.get(key) ?? "")]),
    );
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("לא ניתן לשמור את התוכן.");
      setPending(false);
      return;
    }
    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-6">
      <Field name="logo_text" label="לוגו" defaultValue={defaultValues.logo_text} />
      <Field name="hero_title" label="כותרת ראשית" defaultValue={defaultValues.hero_title} />
      <Field name="catalog_cta" label="כפתור לקטלוג" defaultValue={defaultValues.catalog_cta} />
      <Field name="about_title" label="כותרת אודות" defaultValue={defaultValues.about_title} />
      <label className="block space-y-1">
        <span>טקסט אודות</span>
        <textarea
          name="about_body"
          defaultValue={defaultValues.about_body}
          rows={8}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <Field name="footer_text" label="טקסט תחתון" defaultValue={defaultValues.footer_text} />
      <Field
        name="thankyou_title"
        label="כותרת עמוד התודה לאחר תשלום"
        defaultValue={defaultValues.thankyou_title}
      />
      <label className="block space-y-1">
        <span>טקסט עמוד התודה לאחר תשלום</span>
        <textarea
          name="thankyou_body"
          defaultValue={defaultValues.thankyou_body}
          rows={6}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        שמירת תוכן
      </button>
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block space-y-1">
      <span>{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-[var(--line)] px-3 py-2"
      />
    </label>
  );
}
