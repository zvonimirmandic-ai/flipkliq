const VOTED_POLLS_KEY = "flipkliq_voted_polls";

export function getVotedPollIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(VOTED_POLLS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markPollVoted(pollId: string) {
  const voted = getVotedPollIds();

  if (voted.includes(pollId)) {
    return;
  }

  localStorage.setItem(VOTED_POLLS_KEY, JSON.stringify([...voted, pollId]));
}

export function filterUnvotedPollIds<T extends { id: string }>(
  polls: T[],
  votedIds: string[],
): T[] {
  const votedSet = new Set(votedIds);
  return polls.filter((poll) => !votedSet.has(poll.id));
}
