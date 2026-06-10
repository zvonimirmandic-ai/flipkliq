import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SinglePollView } from "@/components/feed/single-poll-view";
import { getActivePollWithVotes } from "@/lib/active-polls";
import { getPollUrl, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type PollPageProps = {
  params: { pollId: string };
};

const getPoll = cache(getActivePollWithVotes);

export async function generateMetadata({
  params,
}: PollPageProps): Promise<Metadata> {
  const poll = await getPoll(params.pollId);

  if (!poll) {
    return {
      title: "Poll not found",
    };
  }

  const title = `${poll.title} | FLIPKLIQ`;
  const description = `${poll.option_a_label ?? "Option A"} vs ${
    poll.option_b_label ?? "Option B"
  } — cast your vote on FLIPKLIQ.`;
  const url = getPollUrl(poll.id);
  const ogImageUrl = `${SITE_URL}/api/og/${poll.id}`;

  return {
    // The layout template appends "| FLIPKLIQ" to the document title.
    title: poll.title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "FLIPKLIQ",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: poll.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PollPage({ params }: PollPageProps) {
  const poll = await getPoll(params.pollId);

  if (!poll) {
    notFound();
  }

  return <SinglePollView poll={poll} />;
}
