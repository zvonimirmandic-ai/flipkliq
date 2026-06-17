"use client";

import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import {
  CATEGORY_COLORS,
  type CategoryFilter,
} from "@/components/feed/category-tabs";
import { OptionCard } from "@/components/feed/option-card";
import { PollResults } from "@/components/feed/poll-results";
import { ShareButton } from "@/components/feed/share-button";
import { formatPollDate } from "@/lib/format-date";
import type { VoteChoice } from "@/lib/voted-polls";

const POLL_CTAS = [
  "Pick a side. See the verdict.",
  "Find out if you're in the majority.",
  "See how the internet voted.",
  "Compare your choice with everyone else's.",
  "Discover what the crowd prefers.",
  "Cast your vote and see who wins.",
  "Vote and see where you stand.",
  "See if you're part of the winning side.",
  "Find out how many agree with you.",
  "Discover your side of the internet.",
  "See who stands with you.",
  "Vote to reveal the internet's choice.",
  "Find out what the internet prefers.",
  "One vote away from the answer.",
  "Put your opinion to the test.",
  "See if your instinct was right.",
];

// Stable per-poll CTA: seed from the first 8 hex chars of the poll's UUID.
function ctaForPoll(pollId: string): string {
  const seed = parseInt(pollId.replace(/-/g, "").slice(0, 8), 16);
  return POLL_CTAS[seed % POLL_CTAS.length];
}

type PollCardProps = {
  poll: PollWithVotes;
  showResults: boolean;
  voteCounts: VoteCounts | null;
  voting: boolean;
  votedChoice?: VoteChoice | null;
  onVote: (choice: VoteChoice) => void;
  onNext?: () => void;
};

export function PollCard({
  poll,
  showResults,
  voteCounts,
  voting,
  votedChoice,
  onVote,
  onNext,
}: PollCardProps) {
  const category = poll.category ?? "Other";
  const categoryColor =
    CATEGORY_COLORS[category as CategoryFilter] ?? "#E94560";
  const cta = ctaForPoll(poll.id);

  const isClosed = !!(poll.closes_at && new Date(poll.closes_at) < new Date());
  const effectiveShowResults = showResults || isClosed;

  return (
    <div className="relative">
      <div className="[perspective:1400px]">
        <div
          className="relative w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
          style={{ transform: effectiveShowResults ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* FRONT — question + voting images (defines the card height) */}
          <div
            className="[backface-visibility:hidden] [transform:rotateY(0deg)]"
            aria-hidden={effectiveShowResults}
          >
            <p className="mb-4 text-right text-xs text-gray-400">
              {formatPollDate(poll.created_at)}
            </p>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: categoryColor }}
            >
              {category}
            </p>
            <h2 className="mt-2 text-left text-4xl font-black leading-tight text-white sm:text-5xl">
              {poll.title}
            </h2>

            <p className="mb-5 mt-3 text-center text-sm italic text-gray-400">
              {isClosed ? "Match ended" : cta}
            </p>

            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full min-w-0 md:w-1/2">
                <OptionCard
                  imageUrl={poll.option_a_image}
                  label={poll.option_a_label}
                  fallbackLabel="Option A"
                  percentage={null}
                  showResults={false}
                  isWinner={false}
                  disabled={effectiveShowResults || voting}
                  onVote={() => onVote("a")}
                />
              </div>
              <div className="w-full min-w-0 md:w-1/2">
                <OptionCard
                  imageUrl={poll.option_b_image}
                  label={poll.option_b_label}
                  fallbackLabel="Option B"
                  percentage={null}
                  showResults={false}
                  isWinner={false}
                  disabled={effectiveShowResults || voting}
                  onVote={() => onVote("b")}
                />
              </div>
            </div>
          </div>

          {/* BACK — results (same box, pre-rotated so it reads correctly) */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            aria-hidden={!effectiveShowResults}
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
              {isClosed ? (
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Match ended
                  </span>
                </div>
              ) : null}
              <PollResults
                poll={poll}
                voteCounts={voteCounts}
                votedChoice={votedChoice}
              />

              <div className="mt-6 flex items-center justify-center gap-4 pb-6">
                <ShareButton pollId={poll.id} title={poll.title} />
                {onNext ? (
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex min-h-[44px] items-center rounded-full bg-brand-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90"
                  >
                    Next →
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {voting ? (
        <div
          aria-live="polite"
          aria-label="Submitting vote"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/30"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-brand-accent" />
        </div>
      ) : null}
    </div>
  );
}
