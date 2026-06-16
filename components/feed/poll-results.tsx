"use client";

import {
  CATEGORY_COLORS,
  type CategoryFilter,
} from "@/components/feed/category-tabs";
import { CountryBattle } from "@/components/feed/country-battle";
import { CountryBreakdown } from "@/components/feed/country-breakdown";
import { formatPollDate } from "@/lib/format-date";
import { getPercentages } from "@/lib/percentages";
import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import type { VoteChoice } from "@/lib/voted-polls";

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
      <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
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

type PollResultsProps = {
  poll: PollWithVotes;
  voteCounts?: VoteCounts | null;
  votedChoice?: VoteChoice | null;
};

// Full results layout shared by the flip-card back and the archive stats modal:
// category + date, question, images, bars, total votes, contextual message,
// comment, "Votes by country", and "Country Battle".
export function PollResults({
  poll,
  voteCounts = null,
  votedChoice,
}: PollResultsProps) {
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

  // Tie/majority/minority from raw counts (not rounded %).
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

  return (
    <>
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
      <h2 className="mb-3 mt-2 text-left text-2xl font-black leading-tight text-white sm:text-3xl">
        {poll.title}
      </h2>

      <div className="flex flex-col gap-6">
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

        {poll.comment ? (
          <p
            className="my-4 border-l-[3px] py-1 pl-3 text-sm italic text-gray-300"
            style={{ borderColor: categoryColor }}
          >
            {poll.comment}
          </p>
        ) : null}

        <CountryBreakdown
          countries={poll.top_countries}
          accent={categoryColor}
          limit={5}
        />

        <CountryBattle
          countries={poll.top_countries}
          labelA={labelA}
          labelB={labelB}
          accent={categoryColor}
        />
      </div>
    </>
  );
}
