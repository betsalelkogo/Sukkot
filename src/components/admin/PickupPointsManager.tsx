"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PickupPointRecord } from "@/lib/queries";

type Props = {
  points: PickupPointRecord[];
};

export function PickupPointsManager({ points }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const editing = points.find((point) => point.id === editingId);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      details: String(data.get("details") ?? ""),
      hours: String(data.get("hours") ?? ""),
      sortOrder: Number(data.get("sortOrder") || 0),
      active: data.get("active") === "on",
    };
    const res = await fetch(editingId ? `/api/admin/pickup-points/${editingId}` : "/api/admin/pickup-points", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("לא ניתן לשמור את נקודת האיסוף.");
      setPending(false);
      return;
    }
    form.reset();
    setEditingId(null);
    setPending(false);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("למחוק את נקודת האיסוף?")) {
      return;
    }
    const res = await fetch(`/api/admin/pickup-points/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) {
        setEditingId(null);
      }
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-6">
        <h2 className="text-xl font-semibold">{editingId ? "עריכת נקודת איסוף" : "נקודת איסוף חדשה"}</h2>
        <label className="block space-y-1">
          <span>שם</span>
          <input
            key={`${editingId}-name`}
            name="name"
            required
            defaultValue={editing?.name ?? ""}
            className="w-full rounded-md border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1">
          <span>כתובת או תיאור</span>
          <input
            key={`${editingId}-details`}
            name="details"
            defaultValue={editing?.details ?? ""}
            placeholder="רחוב, שכונה, הוראות הגעה"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1">
          <span>שעות איסוף</span>
          <input
            key={`${editingId}-hours`}
            name="hours"
            defaultValue={editing?.hours ?? ""}
            placeholder="למשל א׳–ה׳ 16:00–20:00"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="block space-y-1">
          <span>סדר תצוגה</span>
          <input
            key={`${editingId}-sort`}
            name="sortOrder"
            type="number"
            defaultValue={editing?.sortOrder ?? 0}
            className="w-full rounded-md border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2">
          <input key={`${editingId}-active`} type="checkbox" name="active" defaultChecked={editing?.active ?? true} />
          פעילה ובחירה בקופה
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={pending}>
            שמירה
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-sm text-[var(--muted)]"
            >
              ביטול עריכה
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-[var(--paper)]">
            <tr>
              <th className="p-3">שם</th>
              <th className="p-3">פרטים</th>
              <th className="p-3">שעות</th>
              <th className="p-3">סטטוס</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {points.length === 0 ? (
              <tr>
                <td className="p-6 text-[var(--muted)]" colSpan={5}>
                  עדיין אין נקודות איסוף.
                </td>
              </tr>
            ) : (
              points.map((point) => (
                <tr key={point.id} className="border-t border-[var(--line)]">
                  <td className="p-3 font-medium">{point.name}</td>
                  <td className="p-3">{point.details || "-"}</td>
                  <td className="p-3">{point.hours || "-"}</td>
                  <td className="p-3">{point.active ? "פעילה" : "מוסתרת"}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button type="button" className="text-[var(--teal)]" onClick={() => setEditingId(point.id)}>
                        עריכה
                      </button>
                      <button type="button" className="text-red-700" onClick={() => onDelete(point.id)}>
                        מחיקה
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
