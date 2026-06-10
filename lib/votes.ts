import { createAdminClient } from "@/lib/supabase/admin";

export type VoteCounts = {
  votes_a: number;
  votes_b: number;
};

export async function getVoteCountsForPoll(pollId: string): Promise<VoteCounts> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("votes")
    .select("choice")
    .eq("poll_id", pollId);

  if (error) {
    throw error;
  }

  let votes_a = 0;
  let votes_b = 0;

  for (const vote of data ?? []) {
    if (vote.choice === "a") {
      votes_a += 1;
    } else if (vote.choice === "b") {
      votes_b += 1;
    }
  }

  return { votes_a, votes_b };
}

export async function hasExistingVote(
  pollId: string,
  deviceFingerprint: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("device_fingerprint", deviceFingerprint)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}
