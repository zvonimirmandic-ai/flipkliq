import { createAdminClient } from "@/lib/supabase/admin";
import type { CountryStat } from "@/lib/types";

export type VoteCounts = {
  votes_a: number;
  votes_b: number;
};

// Top countries (by total votes) for each poll. Returns {} if the country_code
// column does not exist yet (i.e. before the migration has been run).
export async function getTopCountriesByPoll(
  pollIds: string[],
): Promise<Record<string, CountryStat[]>> {
  if (pollIds.length === 0) {
    return {};
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("votes")
    .select("poll_id, choice, country_code")
    .in("poll_id", pollIds);

  if (error || !data) {
    // Column missing (pre-migration) or other read error: degrade gracefully.
    return {};
  }

  const byPoll: Record<string, Record<string, { a: number; b: number }>> = {};
  for (const vote of data) {
    const code = (vote.country_code as string | null) || null;
    if (!code) continue;

    const polls = (byPoll[vote.poll_id] ??= {});
    const country = (polls[code] ??= { a: 0, b: 0 });
    if (vote.choice === "a") country.a += 1;
    else if (vote.choice === "b") country.b += 1;
  }

  const result: Record<string, CountryStat[]> = {};
  for (const [pollId, countries] of Object.entries(byPoll)) {
    result[pollId] = Object.entries(countries)
      .map(([country_code, c]) => ({
        country_code,
        votes_a: c.a,
        votes_b: c.b,
        total: c.a + c.b,
        preferred:
          c.a > c.b ? ("a" as const) : c.b > c.a ? ("b" as const) : ("tie" as const),
      }))
      .sort((x, y) => y.total - x.total)
      .slice(0, 5);
  }

  return result;
}

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
