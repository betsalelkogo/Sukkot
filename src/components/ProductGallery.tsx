"use client";

import { useState } from "react";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const unique = images.filter((url, index) => url && images.indexOf(url) === index);
  const [current, setCurrent] = useState(0);
  const active = unique[current] ?? unique[0];

  if (!active) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg bg-[var(--paper)]">
        <img src={active} alt={name} className="w-full object-contain" />
      </div>
      {unique.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {unique.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setCurrent(index)}
              className={`overflow-hidden rounded-md border bg-[var(--paper)] ${
                index === current ? "border-[var(--teal)]" : "border-transparent"
              }`}
            >
              <img src={url} alt="" className="h-20 w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
