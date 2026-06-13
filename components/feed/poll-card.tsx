"use client";

import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import {
  CATEGORY_COLORS,
  type CategoryFilter,
} from "@/components/feed/category-tabs";
import { OptionCard } from "@/components/feed/option-card";
import { ShareButton } from "@/components/feed/share-button";
import { getCountryName, getFlagEmoji } from "@/lib/country";
import { formatPollDate } from "@/lib/format-date";
import { getPercentages } from "@/lib/percentages";
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

function ResultImage({
  imageUrl,
  label,
  chosen,
  accent,
}: {
  imageUrl: string;
  label: string;
  chosen: boolean;
  accent: string;
}) {
  return (
    <div
      className="relative h-28 min-w-0 flex-1 overflow-hidden sm:h-36"
      style={chosen ? { boxShadow: `0 0 0 3px ${accent}` } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={label}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgba(0,0,0,0.7))] px-2 py-1.5">
        <span className="text-xs font-semibold text-white drop-shadow">
          {label}
        </span>
      </div>
    </div>
  );
}

function ResultBar({
  label,
  percentage,
  chosen,
  accent,
}: {
  label: string;
  percentage: number;
  chosen: boolean;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-sm text-white/80">
        {label}
      </span>
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${chosen ? "" : "bg-white/30"}`}
          style={{
            width: `${percentage}%`,
            ...(chosen ? { backgroundColor: accent } : {}),
          }}
        />
      </div>
      <span
        className={`w-10 shrink-0 text-right text-sm font-bold ${
          chosen ? "" : "text-white/80"
        }`}
        style={chosen ? { color: accent } : undefined}
      >
        {percentage}%
      </span>
    </div>
  );
}

export function PollCard({
  poll,
  showResults,
  voteCounts,
  voting,
  votedChoice,
  onVote,
  onNext,
}: PollCardProps) {
  const counts = voteCounts ?? {
    votes_a: poll.votes_a,
    votes_b: poll.votes_b,
  };
  const percentages = getPercentages(counts.votes_a, counts.votes_b);
  const totalVotes = counts.votes_a + counts.votes_b;
  const category = poll.category ?? "Other";
  const categoryColor =
    CATEGORY_COLORS[category as CategoryFilter] ?? "#E94560";
  const labelA = poll.option_a_label || "Option A";
  const labelB = poll.option_b_label || "Option B";
  const cta = ctaForPoll(poll.id);

  // Contextual result message based on the user's choice vs. the outcome.
  // Tie/majority/minority are read from raw vote counts (not rounded %) so
  // near-even splits are classified correctly.
  let resultMessage = "The results are in!";
  if (counts.votes_a === counts.votes_b) {
    resultMessage = "It's a tie! 🤝";
  } else if (votedChoice) {
    const userVotes = votedChoice === "a" ? counts.votes_a : counts.votes_b;
    const otherVotes = votedChoice === "a" ? counts.votes_b : counts.votes_a;
    resultMessage =
      userVotes > otherVotes
        ? "You're with the majority! 🎯"
        : "You're in the minority! 🔥";
  }

  const categoryRow = (
    <div className="flex items-baseline justify-between gap-2">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: categoryColor }}
      >
        {category}
      </p>
      <span className="shrink-0 text-xs tracking-wide text-gray-400">
        {formatPollDate(poll.created_at)}
      </span>
    </div>
  );

  return (
    <div className="relative">
      <div className="[perspective:1400px]">
        <div
          className="relative w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
          style={{ transform: showResults ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* FRONT — question + voting images (defines the card height) */}
          <div
            className="[backface-visibility:hidden] [transform:rotateY(0deg)]"
            aria-hidden={showResults}
          >
            {categoryRow}
            <h2 className="mt-2 text-left text-4xl font-black leading-tight text-white sm:text-5xl">
              {poll.title}
            </h2>

            <p className="mt-3 mb-5 text-center text-sm italic text-gray-400">
              {cta}
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
                  disabled={showResults || voting}
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
                  disabled={showResults || voting}
                  onVote={() => onVote("b")}
                />
              </div>
            </div>
          </div>

          {/* BACK — results (same box, pre-rotated so it reads correctly) */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            aria-hidden={!showResults}
          >
            <div className="flex h-full flex-col overflow-y-auto">
              {categoryRow}
              <h2 className="mt-2 text-left text-2xl font-black leading-tight text-white sm:text-3xl">
                {poll.title}
              </h2>

              <div className="flex flex-1 flex-col justify-center gap-5 py-6">
                <div className="flex gap-3">
                  <ResultImage
                    imageUrl={poll.option_a_image}
                    label={labelA}
                    chosen={votedChoice === "a"}
                    accent={categoryColor}
                  />
                  <ResultImage
                    imageUrl={poll.option_b_image}
                    label={labelB}
                    chosen={votedChoice === "b"}
                    accent={categoryColor}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <ResultBar
                    label={labelA}
                    percentage={percentages.a}
                    chosen={votedChoice === "a"}
                    accent={categoryColor}
                  />
                  <ResultBar
                    label={labelB}
                    percentage={percentages.b}
                    chosen={votedChoice === "b"}
                    accent={categoryColor}
                  />
                </div>

                <p className="text-center text-sm text-gray-400">
                  {totalVotes.toLocaleString()} total votes
                </p>

                <p className="text-center text-xl font-bold text-white sm:text-2xl">
                  {resultMessage}
                </p>

                {poll.top_countries && poll.top_countries.length > 0 ? (
                  <div>
                    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Around the world
                    </p>
                    <ul className="flex flex-col gap-2">
                      {poll.top_countries.map((country) => {
                        const split = getPercentages(
                          country.votes_a,
                          country.votes_b,
                        );
                        return (
                          <li
                            key={country.country_code}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-base leading-none">
                              {getFlagEmoji(country.country_code)}
                            </span>
                            <span className="w-20 shrink-0 truncate text-white/80">
                              {getCountryName(country.country_code)}
                            </span>
                            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/15">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${split.a}%`,
                                  backgroundColor: categoryColor,
                                }}
                              />
                            </div>
                            <span className="w-6 shrink-0 text-right text-xs text-white/60">
                              {country.total}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-center gap-3">
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
