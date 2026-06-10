import { createAdminClient } from "@/lib/supabase/admin";
import type { PollWithVotes } from "@/lib/types";

export async function getPollsWithVoteCounts(): Promise<PollWithVotes[]> {
  const supabase = createAdminClient();

  const { data: polls, error: pollsError } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  if (pollsError) {
    throw pollsError;
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("poll_id, choice");

  if (votesError) {
    throw votesError;
  }

  const countsByPoll: Record<string, { a: number; b: number }> = {};

  for (const vote of votes ?? []) {
    if (!countsByPoll[vote.poll_id]) {
      countsByPoll[vote.poll_id] = { a: 0, b: 0 };
    }

    if (vote.choice === "a") {
      countsByPoll[vote.poll_id].a += 1;
    } else if (vote.choice === "b") {
      countsByPoll[vote.poll_id].b += 1;
    }
  }

  return (polls ?? []).map((poll) => ({
    ...poll,
    votes_a: countsByPoll[poll.id]?.a ?? 0,
    votes_b: countsByPoll[poll.id]?.b ?? 0,
  }));
}
