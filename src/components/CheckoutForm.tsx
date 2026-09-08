"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export function CheckoutForm() {
  const { items, clear } = useCart();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      notes: String(form.get("notes") ?? ""),
      items: items.map((item) => ({
        productId: item.productId,
        variant: item.variant,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "לא ניתן להשלים את ההזמנה כרגע.");
        return;
      }
      clear();
      window.location.assign(data.url);
    } catch {
      setError("לא ניתן להשלים את ההזמנה כרגע.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field name="customerName" label="שם מלא" required />
      <Field name="customerEmail" label="אימייל" type="email" required />
      <Field name="customerPhone" label="טלפון" required placeholder="0501234567" />
      <Field name="city" label="עיר" required />
      <Field name="address" label="כתובת למשלוח" required />
      <label className="block space-y-1">
        <span className="text-sm">הערות</span>
        <textarea name="notes" rows={3} className="w-full rounded-md border border-[var(--line)] px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending || items.length === 0}>
        {pending ? "מעבירים לתשלום..." : "המשך לתשלום מאובטח"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        התשלום מתבצע בטופס מאובטח של Morning / חשבונית ירוקה. פרטי האשראי לא נשמרים באתר.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--line)] px-3 py-2"
      />
    </label>
  );
}
