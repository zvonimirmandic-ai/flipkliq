"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CategoryTabs,
  type CategoryFilter,
} from "@/components/feed/category-tabs";
import { EndScreen } from "@/components/feed/end-screen";
import { ErrorScreen } from "@/components/feed/error-screen";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { PollCard } from "@/components/feed/poll-card";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { PollWithVotes } from "@/lib/types";
import type { VoteCounts } from "@/lib/votes";
import {
  filterUnvotedPollIds,
  getVotedPollIds,
  markPollVoted,
} from "@/lib/voted-polls";

// Long enough to read the results and reach the Share button before advancing.
const RESULTS_DELAY_MS = 7000;

const EMPTY_MESSAGES: Record<Exclude<CategoryFilter, "All">, string> = {
  Fashion: "The runway is clear for now. Fresh fits are on the way!",
  Tech: "No gadget battles at the moment. New matchups are charging up!",
  Design: "No design face-offs right now. New pixels are being pushed!",
  Food: "The kitchen is quiet for now. Tasty matchups are cooking!",
  Travel: "No destination duels right now. New trips are boarding soon!",
  Other: "The wildcard pile is empty for now. Check back soon!",
};

export function VotingFeed() {
  const [polls, setPolls] = useState<PollWithVotes[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCounts | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getDeviceFingerprint().then(setFingerprint);
  }, []);

  const loadPolls = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const response = await fetch("/api/polls");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load polls");
      }

      const votedIds = getVotedPollIds();
      const unvotedPolls = filterUnvotedPollIds(
        data.polls as PollWithVotes[],
        votedIds,
      );

      setPolls(unvotedPolls);
      setCurrentIndex(0);
      setShowResults(false);
      setVoteCounts(null);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  // Polls without a category are grouped under "Other".
  const filteredPolls = useMemo(
    () =>
      category === "All"
        ? polls
        : polls.filter((poll) => (poll.category ?? "Other") === category),
    [polls, category],
  );

  const advancePoll = useCallback(() => {
    setShowResults(false);
    setVoteCounts(null);
    setCurrentIndex((index) => index + 1);
  }, []);

  const handleSelectCategory = useCallback((nextCategory: CategoryFilter) => {
    setCategory(nextCategory);
    setCurrentIndex(0);
    setShowResults(false);
    setVoteCounts(null);
    setVoteError(false);
  }, []);

  useEffect(() => {
    if (!showResults) {
      return;
    }

    const timer = window.setTimeout(advancePoll, RESULTS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [showResults, advancePoll]);

  async function handleVote(choice: "a" | "b") {
    const poll = filteredPolls[currentIndex];
    if (!poll || showResults || voting || !fingerprint) {
      return;
    }

    setVoting(true);
    setVoteError(false);

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

      markPollVoted(poll.id);
      setVoteCounts({
        votes_a: data.votes_a ?? poll.votes_a,
        votes_b: data.votes_b ?? poll.votes_b,
      });
      setShowResults(true);
    } catch (error) {
      console.error(error);
      setVoteError(true);
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return <FeedSkeleton />;
  }

  if (loadError) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-brand-bg">
        <ErrorScreen onRetry={loadPolls} />
      </div>
    );
  }

  const currentPoll = filteredPolls[currentIndex];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-brand-bg">
      <CategoryTabs selected={category} onSelect={handleSelectCategory} />

      {voteError ? (
        <div className="shrink-0 px-4 pt-3">
          <p
            role="alert"
            className="rounded-xl bg-brand-accent/15 px-4 py-2.5 text-center text-sm font-medium text-brand-accent"
          >
            Couldn&apos;t submit your vote. Tap an option to try again.
          </p>
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        {currentPoll ? (
          <PollCard
            poll={currentPoll}
            showResults={showResults}
            voteCounts={voteCounts}
            voting={voting}
            onVote={handleVote}
          />
        ) : (
          <EndScreen
            title={
              category === "All" ? "All caught up!" : `No ${category} polls yet`
            }
            message={
              category === "All"
                ? "You've voted on every active poll. Check back soon for more A/B matchups."
                : EMPTY_MESSAGES[category]
            }
          />
        )}
      </div>
    </div>
  );
}
