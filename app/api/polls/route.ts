import { NextResponse } from "next/server";
import { getActivePollsWithVoteCounts } from "@/lib/active-polls";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    let polls = await getActivePollsWithVoteCounts();

    if (category) {
      polls = polls.filter((poll) => poll.category === category);
    }

    if (limit) {
      polls = polls.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json({ polls });
  } catch (error) {
    console.error("Failed to fetch active polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 },
    );
  }
}
