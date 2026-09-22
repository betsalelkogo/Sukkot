"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type NavOrder = {
  id: string;
  name: string;
  meta: string;
};

export function OrderNavList({
  orders,
  currentId,
  pickup,
}: {
  orders: NavOrder[];
  currentId: string;
  pickup?: string;
}) {
  const currentRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  return (
    <nav className="max-h-[16rem] overflow-auto lg:max-h-[calc(100vh-10rem)]" aria-label="רשימת הזמנות">
      {orders.map((order) => {
        const current = order.id === currentId;
        const href = pickup ? `/admin/orders/${order.id}?pickup=${encodeURIComponent(pickup)}` : `/admin/orders/${order.id}`;
        return (
          <Link
            key={order.id}
            ref={current ? currentRef : undefined}
            href={href}
            className={`block border-b border-[var(--line)] px-3 py-2 text-sm hover:bg-[var(--paper)] ${
              current ? "bg-[var(--paper)] font-semibold text-[var(--teal)]" : ""
            }`}
          >
            <p>{order.name}</p>
            <p className="text-xs font-normal text-[var(--muted)]">{order.meta}</p>
          </Link>
        );
      })}
    </nav>
  );
}
