import { NextResponse } from "next/server";
import { getActivePollsWithVoteCounts } from "@/lib/active-polls";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const excludeCategory = searchParams.get("exclude_category");
    const limit = searchParams.get("limit");

    let polls = await getActivePollsWithVoteCounts();

    if (category) {
      polls = polls.filter((poll) => poll.category === category);
    }

    if (excludeCategory) {
      polls = polls.filter((poll) => poll.category !== excludeCategory);
    }

    // For social posting: only return polls not yet posted (or posted longest ago)
    const unposted = polls.filter((p) => !p.last_posted_at);
    const sorted = [
      ...unposted,
      ...polls.filter((p) => p.last_posted_at).sort(
        (a, b) => new Date(a.last_posted_at!).getTime() - new Date(b.last_posted_at!).getTime()
      ),
    ];
    polls = sorted;

    if (limit) {
      polls = polls.slice(0, parseInt(limit, 10));
    }

    const pollsWithDisplayTitle = polls.map((poll) => ({
      ...poll,
      display_title:
        poll.group && !poll.title.startsWith("Group ")
          ? `Group ${poll.group}: ${poll.title}`
          : poll.title,
    }));

    return NextResponse.json({ polls: pollsWithDisplayTitle });
  } catch (error) {
    console.error("Failed to fetch active polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 },
    );
  }
}
