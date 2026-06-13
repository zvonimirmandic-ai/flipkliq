import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import {
  getVoteCountsForPoll,
  hasExistingVote,
} from "@/lib/votes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pollId = String(body.poll_id ?? "");
    const choice = String(body.choice ?? "");
    const deviceFingerprint = String(body.device_fingerprint ?? "");

    if (!pollId || !deviceFingerprint) {
      return NextResponse.json(
        { error: "poll_id and device_fingerprint are required" },
        { status: 400 },
      );
    }

    if (choice !== "a" && choice !== "b") {
      return NextResponse.json(
        { error: "choice must be 'a' or 'b'" },
        { status: 400 },
      );
    }

    const alreadyVoted = await hasExistingVote(pollId, deviceFingerprint);
    if (alreadyVoted) {
      const counts = await getVoteCountsForPoll(pollId);
      return NextResponse.json(
        { error: "Already voted on this poll", ...counts },
        { status: 409 },
      );
    }

    // Country comes from Vercel's geo headers in production. On localhost they
    // are absent, so fall back to HR (Croatia) to keep the feature testable.
    const isLocal = process.env.NODE_ENV !== "production";
    const country_code =
      request.headers.get("x-vercel-ip-country") || (isLocal ? "HR" : "XX");
    const country_name =
      request.headers.get("x-vercel-ip-country-region") ||
      (isLocal ? "Croatia" : "Unknown");

    const supabase = createPublicClient();
    const baseVote = {
      poll_id: pollId,
      choice,
      device_fingerprint: deviceFingerprint,
    };

    let { error } = await supabase
      .from("votes")
      .insert({ ...baseVote, country_code, country_name });

    // If the country columns don't exist yet (migration not run), still record
    // the vote without them so voting never breaks.
    if (error && /country_code|country_name|42703|PGRST204/i.test(error.message)) {
      ({ error } = await supabase.from("votes").insert(baseVote));
    }

    if (error) {
      console.error("Failed to cast vote:", error);
      return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
    }

    const counts = await getVoteCountsForPoll(pollId);
    return NextResponse.json(counts);
  } catch (error) {
    console.error("Failed to cast vote:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
