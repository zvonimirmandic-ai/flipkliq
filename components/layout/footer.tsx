import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-transparent px-4 py-6">
      <p className="py-8 text-center text-sm italic text-gray-400">
        &ldquo;The goal isn&apos;t just to collect votes. The goal is to make
        them interesting.&rdquo;
      </p>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-xs text-white/60 sm:flex-row sm:justify-between">
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
