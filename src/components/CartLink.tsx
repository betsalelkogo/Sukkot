"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative inline-flex items-center" aria-label="עגלת קניות">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 7h15l-1.4 8.2A2 2 0 0 1 17.6 17H9.2a2 2 0 0 1-2-1.6L5.2 5H3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.3" fill="currentColor" />
        <circle cx="17" cy="20" r="1.3" fill="currentColor" />
      </svg>
      {count > 0 ? (
        <span className="absolute -start-2 -top-2 min-w-5 rounded-full bg-[var(--teal)] px-1 text-center text-[11px] text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
