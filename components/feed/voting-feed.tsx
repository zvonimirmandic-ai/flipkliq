"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CATEGORY_COLORS,
  CategoryTabs,
  type CategoryFilter,
} from "@/components/feed/category-tabs";
import { EndScreen } from "@/components/feed/end-screen";
import { ErrorScreen } from "@/components/feed/error-screen";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { PollCard } from "@/components/feed/poll-card";
import { VoteArchive } from "@/components/feed/vote-archive";
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
  // Kept in sync with localStorage so the unvoted pool updates as votes land.
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCounts | null>(null);
  // The just-voted poll stays pinned while its results are displayed, even
  // though it is already excluded from the unvoted pool.
  const [resultPoll, setResultPoll] = useState<PollWithVotes | null>(null);
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

      setPolls(data.polls as PollWithVotes[]);
      setVotedIds(getVotedPollIds());
      setShowResults(false);
      setVoteCounts(null);
      setResultPoll(null);
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

  // Vote check before showing: voted polls are filtered out reactively, so
  // they can never reappear after a category switch.
  const unvotedPolls = useMemo(
    () => filterUnvotedPollIds(polls, votedIds),
    [polls, votedIds],
  );

  // Polls without a category are grouped under "Other".
  const filteredPolls = useMemo(
    () =>
      category === "All"
        ? unvotedPolls
        : unvotedPolls.filter(
            (poll) => (poll.category ?? "Other") === category,
          ),
    [unvotedPolls, category],
  );

  const advancePoll = useCallback(() => {
    setShowResults(false);
    setVoteCounts(null);
    setResultPoll(null);
  }, []);

  const handleSelectCategory = useCallback((nextCategory: CategoryFilter) => {
    setCategory(nextCategory);
    setShowResults(false);
    setVoteCounts(null);
    setResultPoll(null);
    setVoteError(false);
  }, []);

  useEffect(() => {
    if (!showResults) {
      return;
    }

    const timer = window.setTimeout(advancePoll, RESULTS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [showResults, advancePoll]);

  const currentPoll = resultPoll ?? filteredPolls[0];

  async function handleVote(choice: "a" | "b") {
    const poll = currentPoll;
    if (
      !poll ||
      showResults ||
      voting ||
      !fingerprint ||
      votedIds.includes(poll.id)
    ) {
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

      // Vote check after casting: record it immediately so the poll leaves
      // the unvoted pool; resultPoll keeps it on screen for the results.
      markPollVoted(poll.id, choice);
      setVotedIds((ids) => (ids.includes(poll.id) ? ids : [...ids, poll.id]));
      setResultPoll(poll);
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

  return (
    <div
      className="feed-bg flex h-[100dvh] flex-col overflow-hidden"
      style={
        // 1F = ~12% alpha appended to the category hex.
        {
          "--feed-glow": `${CATEGORY_COLORS[category]}1F`,
        } as React.CSSProperties
      }
    >
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
        ) : category === "All" ? (
          <div className="h-full overflow-y-auto">
            <div className="h-[70%]">
              <EndScreen
                title="All caught up!"
                message="You've voted on every active poll. Check back soon for more A/B matchups."
              />
            </div>
            <VoteArchive />
          </div>
        ) : (
          <EndScreen
            title={`No ${category} polls yet`}
            message={EMPTY_MESSAGES[category]}
          />
        )}
      </div>
    </div>
  );
}
