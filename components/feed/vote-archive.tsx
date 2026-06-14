"use client";

import {
  CATEGORY_COLORS,
  type CategoryFilter,
} from "@/components/feed/category-tabs";
import { CountryBreakdown } from "@/components/feed/country-breakdown";
import { formatPollDate } from "@/lib/format-date";
import { getPercentages } from "@/lib/percentages";
import type { PollWithVotes } from "@/lib/types";
import type { VoteChoice } from "@/lib/voted-polls";

const DEFAULT_ACCENT = "#E94560";

type ArchiveOptionProps = {
  imageUrl: string;
  label: string;
  percentage: number;
  chosen: boolean;
  accent: string;
};

function ArchiveImage({
  imageUrl,
  label,
  chosen,
  accent,
}: Omit<ArchiveOptionProps, "percentage">) {
  return (
    <div className="group relative aspect-square min-w-0 flex-1 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={label}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-in-out md:group-hover:scale-110"
      />
      {chosen ? (
        <span
          className="absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-white"
          style={{ backgroundColor: accent }}
        >
          Your pick
        </span>
      ) : null}
    </div>
  );
}

function ArchiveBar({
  label,
  percentage,
  chosen,
  accent,
}: Omit<ArchiveOptionProps, "imageUrl">) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 truncate text-xs text-white/70">
        {label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            chosen ? "" : "bg-white/30"
          }`}
          style={{
            width: `${percentage}%`,
            ...(chosen ? { backgroundColor: accent } : {}),
          }}
        />
      </div>
      <span
        className={`w-9 shrink-0 text-right text-xs font-semibold ${
          chosen ? "" : "text-white/70"
        }`}
        style={chosen ? { color: accent } : undefined}
      >
        {percentage}%
      </span>
    </div>
  );
}

function ArchiveCard({
  poll,
  choice,
}: {
  poll: PollWithVotes;
  choice: VoteChoice | undefined;
}) {
  const percentages = getPercentages(poll.votes_a, poll.votes_b);
  const labelA = poll.option_a_label || "Option A";
  const labelB = poll.option_b_label || "Option B";
  const category = poll.category ?? "Other";
  const accent =
    CATEGORY_COLORS[category as CategoryFilter] ?? DEFAULT_ACCENT;

  return (
    <li className="archive-card-enter flex h-full w-full flex-col rounded-2xl border border-white/10 bg-brand-surface p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p
          className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide"
          style={{ color: accent }}
        >
          {category}
        </p>
        <span className="shrink-0 text-[10px] tracking-wide text-gray-400">
          {formatPollDate(poll.created_at)}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-white">
        {poll.title}
      </p>

      <div className="mt-2 flex gap-2">
        <ArchiveImage
          imageUrl={poll.option_a_image}
          label={labelA}
          chosen={choice === "a"}
          accent={accent}
        />
        <ArchiveImage
          imageUrl={poll.option_b_image}
          label={labelB}
          chosen={choice === "b"}
          accent={accent}
        />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <ArchiveBar
          label={labelA}
          percentage={percentages.a}
          chosen={choice === "a"}
          accent={accent}
        />
        <ArchiveBar
          label={labelB}
          percentage={percentages.b}
          chosen={choice === "b"}
          accent={accent}
        />
        <p className="text-center text-xs text-gray-400">
          {(poll.votes_a + poll.votes_b).toLocaleString()} total votes
        </p>
        <CountryBreakdown
          countries={poll.top_countries}
          accent={accent}
          limit={3}
          showEmpty
        />
      </div>
    </li>
  );
}

type VoteArchiveProps = {
  /** Voted polls to display, already ordered (most recently voted first). */
  polls: PollWithVotes[];
  choices: Record<string, VoteChoice>;
};

export function VoteArchive({ polls, choices }: VoteArchiveProps) {
  if (polls.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 pb-10 md:max-w-4xl">
      <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
        Your votes
      </h2>
      <ul className="mt-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {polls.map((poll) => (
          <ArchiveCard key={poll.id} poll={poll} choice={choices[poll.id]} />
        ))}
      </ul>
    </section>
  );
}
