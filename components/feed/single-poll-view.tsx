"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PollCard } from "@/components/feed/poll-card";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import { getVotedPollIds, markPollVoted } from "@/lib/voted-polls";

type SinglePollViewProps = {
  poll: PollWithVotes;
};

export function SinglePollView({ poll }: SinglePollViewProps) {
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCounts | null>(null);
  const [voting, setVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getDeviceFingerprint().then(setFingerprint);
  }, []);

  useEffect(() => {
    if (getVotedPollIds().includes(poll.id)) {
      setShowResults(true);
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
      setShowResults(true);
    } catch (error) {
      console.error(error);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-brand-bg">
      <div className="min-h-0 flex-1">
        <PollCard
          poll={poll}
          showResults={showResults}
          voteCounts={voteCounts}
          voting={voting}
          onVote={handleVote}
        />
      </div>

      <footer className="flex shrink-0 justify-center pb-2">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center px-4 text-sm font-medium text-white/60 underline-offset-4 hover:text-white hover:underline"
        >
          Vote on more polls →
        </Link>
      </footer>
    </div>
  );
}
