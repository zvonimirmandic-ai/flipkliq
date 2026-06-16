"use client";

import { useEffect } from "react";
import { PollResults } from "@/components/feed/poll-results";
import type { PollWithVotes } from "@/lib/types";
import type { VoteChoice } from "@/lib/voted-polls";

type ArchiveStatsModalProps = {
  poll: PollWithVotes;
  choice: VoteChoice | undefined;
  onClose: () => void;
};

// Full poll results (comment, votes by country, country battle) in a modal,
// reusing the same PollResults layout as the flip card. Closes on the X
// button, an outside click, or Escape.
export function ArchiveStatsModal({
  poll,
  choice,
  onClose,
}: ArchiveStatsModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-brand-bg p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>

        <PollResults poll={poll} votedChoice={choice} />
      </div>
    </div>
  );
}
