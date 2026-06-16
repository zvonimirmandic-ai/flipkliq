import { NextResponse } from "next/server";
import { getCountryName } from "@/lib/country";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Aggregate stats for the "By the numbers" section: total polls, total votes,
// distinct countries, and the top 5 countries by vote count.
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count: totalPolls } = await supabase
      .from("polls")
      .select("*", { count: "exact", head: true });

    const { count: totalVotes } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true });

    // Country grouping must happen in JS (PostgREST has no COUNT/GROUP BY).
    const { data: votes, error } = await supabase
      .from("votes")
      .select("country_code");
    if (error) throw error;

    const counts = new Map<string, number>();
    for (const vote of votes ?? []) {
      const code = vote.country_code as string | null;
      if (!code) continue;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }

    const topCountries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country_code, votes]) => ({
        country_code,
        country_name: getCountryName(country_code),
        votes,
      }));

    return NextResponse.json({
      totalPolls: totalPolls ?? 0,
      totalVotes: totalVotes ?? 0,
      totalCountries: counts.size,
      topCountries,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
