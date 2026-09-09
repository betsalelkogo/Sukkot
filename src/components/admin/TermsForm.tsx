"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TermsForm({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        terms_title: String(form.get("terms_title") ?? ""),
        terms_body: String(form.get("terms_body") ?? ""),
      }),
    });
    if (!res.ok) {
      setError("לא ניתן לשמור את התקנון.");
      setPending(false);
      return;
    }
    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-6">
      <label className="block space-y-1">
        <span>כותרת העמוד</span>
        <input
          name="terms_title"
          defaultValue={title}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="block space-y-1">
        <span>תוכן התקנון</span>
        <textarea
          name="terms_body"
          defaultValue={body}
          rows={28}
          className="w-full rounded-md border border-[var(--line)] px-3 py-2 font-mono text-sm leading-7"
        />
      </label>
      <p className="text-sm text-[var(--muted)]">
        שורת כותרת מתחילה ב־## ואחריה שם הסעיף. פסקה חדשה נוצרת אחרי שורת רווח.
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        שמירת תקנון
      </button>
    </form>
  );
}
