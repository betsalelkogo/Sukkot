"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS } from "@/lib/business";
import { useCart } from "./CartProvider";
import type { PickupPointRecord } from "@/lib/queries";

export function CheckoutForm({ pickupPoints }: { pickupPoints: PickupPointRecord[] }) {
  const { items, clear } = useCart();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pickupPointId, setPickupPointId] = useState("");
  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupOpen, setPickupOpen] = useState(false);
  const [pickupHighlight, setPickupHighlight] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const query = pickupQuery.trim();
  const visiblePickupPoints = query
    ? pickupPoints.filter((point) => `${point.name} ${point.details} ${point.hours ?? ""}`.includes(query))
    : [];
  const selectedPickup = pickupPoints.find((point) => point.id === pickupPointId);

  function choosePickup(point: PickupPointRecord) {
    setPickupPointId(point.id);
    setPickupQuery(point.name);
    setPickupOpen(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!pickupPointId) {
      setError("יש לבחור נקודת איסוף.");
      return;
    }
    if (!acceptedTerms) {
      setError("יש לאשר את התקנון כדי להמשיך לתשלום.");
      return;
    }
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      country: String(form.get("country") ?? ""),
      pickupPointId,
      notes: String(form.get("notes") ?? ""),
      acceptedTerms: true,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="firstName" label="שם פרטי" required />
        <Field name="lastName" label="שם משפחה" required />
      </div>
      <Field name="customerEmail" label="כתובת מייל" type="email" required />
      <Field name="customerPhone" label="טלפון ללא קידומת" required placeholder="542307195" />
      <Field name="country" label="מדינה" required defaultValue={BUSINESS.country} />
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">נקודת איסוף</legend>
        {pickupPoints.length === 0 ? (
          <p className="rounded-md bg-[var(--paper)] p-3 text-sm text-[var(--muted)]">
            עדיין לא הוגדרו נקודות איסוף. אפשר להוסיף אותן באזור הניהול.
          </p>
        ) : (
          <div className="relative">
            <input
              type="search"
              value={pickupQuery}
              autoComplete="off"
              placeholder="הקלידו שם יישוב או נקודה"
              className="w-full rounded-md border border-[var(--line)] px-3 py-2"
              onChange={(event) => {
                setPickupQuery(event.target.value);
                setPickupPointId("");
                setPickupHighlight(0);
                setPickupOpen(true);
              }}
              onFocus={() => {
                if (query) {
                  setPickupOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && visiblePickupPoints.length) {
                  event.preventDefault();
                  setPickupOpen(true);
                  setPickupHighlight((index) => Math.min(index + 1, visiblePickupPoints.length - 1));
                }
                if (event.key === "ArrowUp" && visiblePickupPoints.length) {
                  event.preventDefault();
                  setPickupHighlight((index) => Math.max(index - 1, 0));
                }
                if (event.key === "Enter" && pickupOpen && visiblePickupPoints[pickupHighlight]) {
                  event.preventDefault();
                  choosePickup(visiblePickupPoints[pickupHighlight]);
                }
                if (event.key === "Escape") {
                  setPickupOpen(false);
                }
              }}
            />
            {pickupOpen && query && visiblePickupPoints.length > 0 ? (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-[var(--line)] bg-white shadow-md">
                {visiblePickupPoints.slice(0, 12).map((point, index) => (
                  <li key={point.id}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-right ${
                        index === pickupHighlight ? "bg-[var(--paper)]" : ""
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choosePickup(point)}
                    >
                      <strong className="block">{point.name}</strong>
                      {point.details ? (
                        <span className="block text-sm text-[var(--muted)]">{point.details}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {pickupOpen && query && visiblePickupPoints.length === 0 ? (
              <p className="mt-2 rounded-md bg-[var(--paper)] p-3 text-sm text-[var(--muted)]">
                לא נמצאה נקודה מתאימה. נסו שם אחר.
              </p>
            ) : null}
            <select
              value={pickupPointId}
              onChange={(event) => {
                const point = pickupPoints.find((item) => item.id === event.target.value);
                if (point) {
                  choosePickup(point);
                } else {
                  setPickupPointId("");
                }
              }}
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
            >
              <option value="">כל נקודות האיסוף</option>
              {pickupPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
            </select>
            {selectedPickup ? (
              <p className="mt-2 rounded-md bg-[var(--paper)] p-3 text-sm text-[var(--muted)]">
                {selectedPickup.details ? <span className="block">{selectedPickup.details}</span> : null}
                {selectedPickup.hours ? <span className="block">{selectedPickup.hours}</span> : null}
              </p>
            ) : null}
          </div>
        )}
      </fieldset>
      <label className="block space-y-1">
        <span className="text-sm font-medium">הערות להזמנה</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={400}
          placeholder="אפשר לכתוב כאן כל דבר שחשוב לנו לדעת על ההזמנה"
          className="w-full rounded-md border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex items-start gap-3 rounded-md border border-[var(--line)] p-3">
        <input
          type="checkbox"
          name="acceptedTerms"
          required
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
        />
        <span className="text-sm">
          קראתי ואני מאשר/ת את{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-[var(--teal)] underline">
            התקנון
          </Link>
        </span>
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
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-[var(--line)] px-3 py-2"
      />
    </label>
  );
}
