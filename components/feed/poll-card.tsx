"use client";

import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import { OptionCard } from "@/components/feed/option-card";
import { ShareButton } from "@/components/feed/share-button";

type PollCardProps = {
  poll: PollWithVotes;
  showResults: boolean;
  voteCounts: VoteCounts | null;
  voting: boolean;
  onVote: (choice: "a" | "b") => void;
};

function getPercentages(counts: VoteCounts) {
  const total = counts.votes_a + counts.votes_b;

  if (total === 0) {
    return { a: 50, b: 50 };
  }

  return {
    a: Math.round((counts.votes_a / total) * 100),
    b: Math.round((counts.votes_b / total) * 100),
  };
}

export function PollCard({
  poll,
  showResults,
  voteCounts,
  voting,
  onVote,
}: PollCardProps) {
  const counts = voteCounts ?? {
    votes_a: poll.votes_a,
    votes_b: poll.votes_b,
  };
  const percentages = getPercentages(counts);

  return (
    <div className="relative flex h-full min-h-0 flex-col px-4 pb-4 pt-6">
      <header className="mb-4 shrink-0 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-accent">
          {poll.category ?? "Poll"}
        </p>
        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
          {poll.title}
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:gap-4">
        <OptionCard
          imageUrl={poll.option_a_image}
          label={poll.option_a_label}
          fallbackLabel="Option A"
          percentage={percentages.a}
          showResults={showResults}
          disabled={showResults || voting}
          onVote={() => onVote("a")}
        />
        <OptionCard
          imageUrl={poll.option_b_image}
          label={poll.option_b_label}
          fallbackLabel="Option B"
          percentage={percentages.b}
          showResults={showResults}
          disabled={showResults || voting}
          onVote={() => onVote("b")}
        />
      </div>

      {showResults ? (
        <div className="mt-3 flex shrink-0 justify-center">
          <ShareButton pollId={poll.id} title={poll.title} />
        </div>
      ) : null}

      {voting ? (
        <div
          aria-live="polite"
          aria-label="Submitting vote"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-brand-accent" />
        </div>
      ) : null}
    </div>
  );
}
