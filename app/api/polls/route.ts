import { NextResponse } from "next/server";
import { getActivePollsWithVoteCounts } from "@/lib/active-polls";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const polls = await getActivePollsWithVoteCounts();
    return NextResponse.json({ polls });
  } catch (error) {
    console.error("Failed to fetch active polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 },
    );
  }
}
