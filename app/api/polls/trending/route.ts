import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// The 4 polls with the most votes in the last 24 hours. PostgREST can't run a
// raw GROUP BY, so we read the recent votes and aggregate in JS — equivalent to
// SELECT poll_id, COUNT(*) ... WHERE created_at > now() - interval '24 hours'.
export async function GET() {
  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("poll_id")
      .gt("created_at", since);
    if (votesError) throw votesError;

    const counts = new Map<string, number>();
    for (const vote of votes ?? []) {
      counts.set(vote.poll_id, (counts.get(vote.poll_id) ?? 0) + 1);
    }

    if (counts.size === 0) {
      return NextResponse.json({ polls: [] });
    }

    const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

    const { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select(
        "id, title, option_a_image, option_b_image, option_a_label, option_b_label, category, status, created_at",
      )
      .in(
        "id",
        ranked.map(([id]) => id),
      )
      .eq("status", "active");
    if (pollsError) throw pollsError;

    const pollById = new Map((polls ?? []).map((poll) => [poll.id, poll]));

    const trending = [];
    for (const [pollId, votesToday] of ranked) {
      const poll = pollById.get(pollId);
      if (poll) {
        trending.push({ ...poll, votes_today: votesToday });
      }
      if (trending.length >= 4) break;
    }

    return NextResponse.json({ polls: trending });
  } catch (error) {
    console.error("Failed to fetch trending polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending polls" },
      { status: 500 },
    );
  }
}
