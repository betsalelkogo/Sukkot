import Link from "next/link";
import { CartLink } from "./CartLink";

export function Header({ logo }: { logo: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.jpg" alt={logo} className="h-14 w-auto sm:h-16" />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/catalog" className="hover:text-[var(--teal)]">
            קטלוג
          </Link>
          <Link href="/terms" className="hover:text-[var(--teal)]">
            תקנון
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
