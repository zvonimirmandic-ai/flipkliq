import { SiteShell } from "@/components/layout/site-shell";
import { VotingFeed } from "@/components/feed/voting-feed";

export default function Home() {
  return (
    <SiteShell>
      <VotingFeed />
    </SiteShell>
  );
}
