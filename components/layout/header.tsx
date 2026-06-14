"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MENU_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      {/* Transparent header with a subtle top-down fade so poll content stays
          legible behind the logo as it scrolls underneath. */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-brand-bg via-brand-bg/80 to-transparent">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" aria-label="FLIPKLIQ home" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="FLIPKLIQ" className="h-5 w-auto" />
          </Link>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-[#0A0A0A]/95 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex h-14 items-center justify-end px-4">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-6 w-6"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Site menu"
            className="flex flex-1 flex-col items-center justify-center gap-8"
            onClick={(event) => event.stopPropagation()}
          >
            {MENU_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-bold text-white transition-colors hover:text-brand-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
