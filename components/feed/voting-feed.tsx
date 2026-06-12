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
import { VoteArchive } from "@/components/feed/vote-archive";
import { trackEvent } from "@/lib/analytics";
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
  // The just-voted poll stays pinned while its results display; it only
  // "drops" into the archive once the results delay elapses.
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
  const inCategory = useCallback(
    (poll: PollWithVotes) =>
      category === "All" || (poll.category ?? "Other") === category,
    [category],
  );

  const filteredPolls = useMemo(
    () => unvotedPolls.filter(inCategory),
    [unvotedPolls, inCategory],
  );

  // Archive follows the active category; most recently voted first. The poll
  // currently showing results is held back until it drops in after the delay.
  const archivePolls = useMemo(() => {
    const order = new Map(votedIds.map((id, index) => [id, index]));
    return polls
      .filter(
        (poll) =>
          order.has(poll.id) &&
          poll.id !== resultPoll?.id &&
          inCategory(poll),
      )
      .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0));
  }, [polls, votedIds, resultPoll, inCategory]);

  const advancePoll = useCallback(() => {
    setShowResults(false);
    setVoteCounts(null);
    setResultPoll(null);
  }, []);

  const handleSelectCategory = useCallback((nextCategory: CategoryFilter) => {
    trackEvent("category_changed", { category: nextCategory });
    setCategory(nextCategory);
    setShowResults(false);
    setVoteCounts(null);
    setResultPoll(null);
    setVoteError(false);
  }, []);

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
      // the unvoted pool; resultPoll keeps it on screen for the results.
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

      trackEvent("vote_cast", {
        poll_id: poll.id,
        category: poll.category ?? "Other",
        option: choice,
      });
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
      <main className="flex-1 bg-brand-bg">
        <ErrorScreen onRetry={loadPolls} />
      </main>
    );
  }

  return (
    <main className="flex-1 bg-brand-bg">
      <CategoryTabs selected={category} onSelect={handleSelectCategory} />

      {voteError ? (
        <div className="px-4 pt-3">
          <p
            role="alert"
            className="mx-auto max-w-md rounded-xl bg-brand-accent/15 px-4 py-2.5 text-center text-sm font-medium text-brand-accent"
          >
            Couldn&apos;t submit your vote. Tap an option to try again.
          </p>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-5 md:max-w-4xl">
        {currentPoll ? (
          <PollCard
            poll={currentPoll}
            showResults={showResults}
            voteCounts={voteCounts}
            voting={voting}
            votedChoice={choices[currentPoll.id] ?? null}
            onVote={handleVote}
            onNext={advancePoll}
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

      <VoteArchive polls={archivePolls} choices={choices} />
    </main>
  );
}
