"use client";

import { useCallback, useEffect, useState } from "react";
import { getPercentages } from "@/lib/percentages";
import type { PollWithVotes } from "@/lib/types";
import {
  getVotedChoices,
  getVotedPollIds,
  type VoteChoice,
} from "@/lib/voted-polls";

type ArchiveOptionProps = {
  imageUrl: string;
  label: string;
  percentage: number;
  chosen: boolean;
};

function ArchiveImage({ imageUrl, label, chosen }: Omit<ArchiveOptionProps, "percentage">) {
  return (
    <div
      className={`relative h-24 min-w-0 flex-1 overflow-hidden rounded-lg ${
        chosen ? "ring-2 ring-brand-accent" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={label}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {chosen ? (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          Your pick
        </span>
      ) : null}
    </div>
  );
}

function ArchiveBar({ label, percentage, chosen }: Omit<ArchiveOptionProps, "imageUrl">) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 truncate text-xs text-white/70">
        {label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${
            chosen ? "bg-brand-accent" : "bg-white/30"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`w-9 shrink-0 text-right text-xs font-semibold ${
          chosen ? "text-brand-accent" : "text-white/70"
        }`}
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

  return (
    <li className="rounded-2xl border border-white/10 bg-brand-surface p-3">
      <p className="truncate text-sm font-semibold text-white">{poll.title}</p>

      <div className="mt-2 flex gap-2">
        <ArchiveImage
          imageUrl={poll.option_a_image}
          label={labelA}
          chosen={choice === "a"}
        />
        <ArchiveImage
          imageUrl={poll.option_b_image}
          label={labelB}
          chosen={choice === "b"}
        />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <ArchiveBar
          label={labelA}
          percentage={percentages.a}
          chosen={choice === "a"}
        />
        <ArchiveBar
          label={labelB}
          percentage={percentages.b}
          chosen={choice === "b"}
        />
      </div>
    </li>
  );
}

export function VoteArchive() {
  const [votedPolls, setVotedPolls] = useState<PollWithVotes[] | null>(null);
  const [choices, setChoices] = useState<Record<string, VoteChoice>>({});
  const [error, setError] = useState(false);

  const loadArchive = useCallback(async () => {
    setError(false);
    setVotedPolls(null);

    const votedIds = getVotedPollIds();

    if (votedIds.length === 0) {
      setVotedPolls([]);
      return;
    }

    try {
      const response = await fetch("/api/polls");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load polls");
      }

      const polls = data.polls as PollWithVotes[];
      const order = new Map(votedIds.map((id, index) => [id, index]));
      const voted = polls
        .filter((poll) => order.has(poll.id))
        // Most recently voted first.
        .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0));

      setChoices(getVotedChoices());
      setVotedPolls(voted);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }, []);

  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  if (error) {
    return (
      <section className="px-4 pb-10 text-center">
        <p className="text-sm text-white/60">
          Couldn&apos;t load your voting history.
        </p>
        <button
          type="button"
          onClick={loadArchive}
          className="mt-2 inline-flex min-h-[44px] items-center px-4 text-sm font-semibold text-brand-accent"
        >
          Try again
        </button>
      </section>
    );
  }

  if (votedPolls === null) {
    return (
      <section className="px-4 pb-10">
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-4 flex flex-col gap-3">
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-brand-surface" />
          <div className="h-44 animate-pulse rounded-2xl border border-white/10 bg-brand-surface" />
        </div>
      </section>
    );
  }

  if (votedPolls.length === 0) {
    return null;
  }

  return (
    <section className="px-4 pb-10">
      <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
        Your votes
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {votedPolls.map((poll) => (
          <ArchiveCard key={poll.id} poll={poll} choice={choices[poll.id]} />
        ))}
      </ul>
    </section>
  );
}
