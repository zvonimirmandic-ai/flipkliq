import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0A0A0A] px-4 py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-xs text-white/50 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="inline-flex min-h-[44px] items-center transition-colors hover:text-white"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-[44px] items-center transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
        </div>
        <p>© 2026 FLIPKLIQ</p>
      </div>
    </footer>
  );
}
