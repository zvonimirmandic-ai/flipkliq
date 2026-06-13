import { createPublicClient } from "@/lib/supabase/public";
import type { PollWithVotes } from "@/lib/types";
import { getTopCountriesByPoll, getVoteCountsForPoll } from "@/lib/votes";

export async function getActivePollsWithVoteCounts(): Promise<PollWithVotes[]> {
  const supabase = createPublicClient();

  // RLS already restricts anon reads to status = 'active'; avoid redundant
  // .eq() on the poll_status enum which can fail with publishable keys.
  const { data: polls, error } = await supabase
    .from("polls")
    .select(
      "id, title, option_a_image, option_b_image, option_a_label, option_b_label, category, status, created_at, comment",
    )
    .order("created_at", { ascending: false });

  console.log("[GET /api/polls] Raw Supabase response:", { error, polls });

  if (error) {
    throw error;
  }

  const topCountries = await getTopCountriesByPoll(
    (polls ?? []).map((poll) => poll.id),
  );

  const pollsWithVotes = await Promise.all(
    (polls ?? []).map(async (poll) => {
      const counts = await getVoteCountsForPoll(poll.id);
      return {
        ...poll,
        ...counts,
        top_countries: topCountries[poll.id] ?? [],
      };
    }),
  );

  return pollsWithVotes;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getActivePollWithVotes(
  pollId: string,
): Promise<PollWithVotes | null> {
  // Guard against non-UUID path params, which would make Postgres error
  // instead of returning an empty result.
  if (!UUID_PATTERN.test(pollId)) {
    return null;
  }

  const supabase = createPublicClient();

  const { data: poll, error } = await supabase
    .from("polls")
    .select(
      "id, title, option_a_image, option_b_image, option_a_label, option_b_label, category, status, created_at, comment",
    )
    .eq("id", pollId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!poll) {
    return null;
  }

  const counts = await getVoteCountsForPoll(poll.id);
  const topCountries = await getTopCountriesByPoll([poll.id]);
  return { ...poll, ...counts, top_countries: topCountries[poll.id] ?? [] };
}
