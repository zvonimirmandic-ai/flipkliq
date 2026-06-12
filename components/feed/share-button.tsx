"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { getPollUrl } from "@/lib/site";

type ShareButtonProps = {
  pollId: string;
  title: string;
};

export function ShareButton({ pollId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  async function handleShare() {
    const url = getPollUrl(pollId);

    trackEvent("share_clicked", { poll_id: pollId });

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `FLIPKLIQ: ${title}`, url });
      } catch {
        // User dismissed the share sheet; nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy poll link:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
