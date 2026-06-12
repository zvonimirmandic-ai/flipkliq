"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PollCard } from "@/components/feed/poll-card";
import { trackEvent } from "@/lib/analytics";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import {
  getVotedChoices,
  getVotedPollIds,
  markPollVoted,
  type VoteChoice,
} from "@/lib/voted-polls";

type SinglePollViewProps = {
  poll: PollWithVotes;
};

export function SinglePollView({ poll }: SinglePollViewProps) {
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCounts | null>(null);
  const [votedChoice, setVotedChoice] = useState<VoteChoice | null>(null);
  const [voting, setVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getDeviceFingerprint().then(setFingerprint);
  }, []);

  useEffect(() => {
    if (getVotedPollIds().includes(poll.id)) {
      setShowResults(true);
      setVotedChoice(getVotedChoices()[poll.id] ?? null);
    }
  }, [poll.id]);

  async function handleVote(choice: "a" | "b") {
    if (showResults || voting || !fingerprint) {
      return;
    }

    setVoting(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poll_id: poll.id,
          choice,
          device_fingerprint: fingerprint,
        }),
      });

      const data = await response.json();

      if (!response.ok && response.status !== 409) {
        throw new Error(data.error ?? "Failed to cast vote");
      }

      markPollVoted(poll.id, choice);
      setVoteCounts({
        votes_a: data.votes_a ?? poll.votes_a,
        votes_b: data.votes_b ?? poll.votes_b,
      });
      setVotedChoice(choice);
      setShowResults(true);

      trackEvent("vote_cast", {
        poll_id: poll.id,
        category: poll.category ?? "Other",
        option: choice,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setVoting(false);
    }
  }

  return (
    <main className="flex-1 bg-brand-bg">
      <div className="mx-auto w-full max-w-md px-4 pb-6 pt-5 md:max-w-4xl">
        <PollCard
          poll={poll}
          showResults={showResults}
          voteCounts={voteCounts}
          voting={voting}
          votedChoice={votedChoice}
          onVote={handleVote}
        />

        <div className="mt-2 flex justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center px-4 text-sm font-medium text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Vote on more polls →
          </Link>
        </div>
      </div>
    </main>
  );
}
