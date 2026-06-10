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
  getVotedChoices,
  getVotedPollIds,
  markPollVoted,
  type VoteChoice,
} from "@/lib/voted-polls";

// Long enough to read the results and reach the Share button before advancing.
const RESULTS_DELAY_MS = 7000;

const EMPTY_MESSAGES: Record<Exclude<CategoryFilter, "All">, string> = {
  Fashion: "The runway is clear for now. Fresh fits are on the way!",
  Tech: "No gadget battles at the moment. New matchups are charging up!",
  Design: "No design face-offs right now. New pixels are being pushed!",
  Food: "The kitchen is quiet for now. Tasty matchups are cooking!",
  Travel: "No destination duels right now. New trips are boarding soon!",
  "FIFA 2026": "No matches on the pitch right now. Kickoff is coming soon!",
  Other: "The wildcard pile is empty for now. Check back soon!",
};

export function VotingFeed() {
  const [polls, setPolls] = useState<PollWithVotes[]>([]);
  // Kept in sync with localStorage so the unvoted pool updates as votes land.
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, VoteChoice>>({});
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCounts | null>(null);
  // The just-voted poll stays pinned fullscreen while its results display;
  // it only "drops" into the archive once the results delay elapses.
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
      setChoices(getVotedChoices());
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

  // Most recently voted first; the poll currently showing results is held
  // back until it drops in after the delay.
  const archivePolls = useMemo(() => {
    const order = new Map(votedIds.map((id, index) => [id, index]));
    return polls
      .filter((poll) => order.has(poll.id) && poll.id !== resultPoll?.id)
      .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0));
  }, [polls, votedIds, resultPoll]);

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

      const counts = {
        votes_a: data.votes_a ?? poll.votes_a,
        votes_b: data.votes_b ?? poll.votes_b,
      };

      // Vote check after casting: record it immediately so the poll leaves
      // the unvoted pool; resultPoll keeps it fullscreen for the results.
      markPollVoted(poll.id, choice);
      setVotedIds((ids) => (ids.includes(poll.id) ? ids : [...ids, poll.id]));
      setChoices((prev) => ({ ...prev, [poll.id]: choice }));
      // Refresh the poll's counts so its archive card shows live results.
      setPolls((prev) =>
        prev.map((p) => (p.id === poll.id ? { ...p, ...counts } : p)),
      );
      setResultPoll({ ...poll, ...counts });
      setVoteCounts(counts);
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
      className="feed-bg h-[100dvh] overflow-hidden"
      style={
        // 1F = ~12% alpha appended to the category hex.
        {
          "--feed-glow": `${CATEGORY_COLORS[category]}1F`,
        } as React.CSSProperties
      }
    >
      <div className="h-full overflow-y-auto overscroll-contain">
        <div
          className={`flex flex-col ${
            currentPoll ? "h-[100dvh]" : "min-h-[55dvh]"
          }`}
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
              <EndScreen
                title="All caught up!"
                message="You've voted on every active poll. Check back soon for more A/B matchups."
              />
            ) : (
              <EndScreen
                title={`No ${category} polls yet`}
                message={EMPTY_MESSAGES[category]}
              />
            )}
          </div>
        </div>

        <VoteArchive polls={archivePolls} choices={choices} />
      </div>
    </div>
  );
}
