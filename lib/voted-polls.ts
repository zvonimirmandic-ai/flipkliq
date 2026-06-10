const VOTED_POLLS_KEY = "flipkliq_voted_polls";
const VOTED_CHOICES_KEY = "flipkliq_voted_choices";

export type VoteChoice = "a" | "b";

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

// Polls voted before choices were tracked won't have an entry here.
export function getVotedChoices(): Record<string, VoteChoice> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(VOTED_CHOICES_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export function markPollVoted(pollId: string, choice?: VoteChoice) {
  if (choice) {
    const choices = getVotedChoices();

    if (!choices[pollId]) {
      localStorage.setItem(
        VOTED_CHOICES_KEY,
        JSON.stringify({ ...choices, [pollId]: choice }),
      );
    }
  }

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
