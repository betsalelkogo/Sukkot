"use client";

import { useEffect, useState } from "react";

type Props = {
  orderId: string;
  packed: boolean;
  shipped: boolean;
};

export function OrderFulfillmentChecks({ orderId, packed, shipped }: Props) {
  const [values, setValues] = useState({ packed, shipped });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValues({ packed, shipped });
  }, [packed, shipped]);

  async function save(next: { packed: boolean; shipped: boolean }) {
    const previous = values;
    setValues(next);
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      setValues(previous);
      setError("לא נשמר");
    }
    setPending(false);
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values.packed}
          disabled={pending}
          onChange={(event) => save({ ...values, packed: event.target.checked })}
        />
        נארז
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values.shipped}
          disabled={pending}
          onChange={(event) => save({ ...values, shipped: event.target.checked })}
        />
        נשלח
      </label>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
