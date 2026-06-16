import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "FlipKliq turns choices into something bigger: a live snapshot of what the world prefers.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-xs uppercase tracking-widest text-[#E94560]">
      {children}
    </p>
  );
}

const CHOICES = [
  "A favourite team",
  "A better design",
  "A stronger brand",
  "A trend worth following",
];

const FEATURES = [
  {
    icon: "📊",
    title: "Live Results",
    description: "See the split the moment you vote.",
  },
  {
    icon: "🌍",
    title: "Votes by Country",
    description: "Discover where each side wins.",
  },
  {
    icon: "⚔️",
    title: "Country Battles",
    description: "See how nations divide on every topic.",
  },
  {
    icon: "🔥",
    title: "Trending Polls",
    description: "What the world is voting on right now.",
  },
];

const AUDIENCES = [
  {
    icon: "🏆",
    title: "Sports fans",
    description: "Who really owns the debate?",
  },
  {
    icon: "🎨",
    title: "Design lovers",
    description: "Which visual choice wins?",
  },
  {
    icon: "🔍",
    title: "Trend hunters",
    description: "What's catching attention now?",
  },
  {
    icon: "🧠",
    title: "Curious minds",
    description: "What would the rest of the world choose?",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <main className="flex-1 bg-brand-bg">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-32 text-center">
          <h1 className="text-6xl font-black text-white md:text-8xl">
            Which side are you on?
          </h1>
          <p className="mt-6 text-xl italic text-gray-400">
            Every day, people make choices.
          </p>

          <div className="mx-auto mt-10 flex max-w-none flex-wrap justify-center gap-3">
            {CHOICES.map((choice) => (
              <span
                key={choice}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-gray-300"
              >
                {choice}
              </span>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-xl text-white">
            FlipKliq turns those choices into something bigger: a live snapshot
            of what the world prefers.
          </p>
        </section>

        {/* What is FlipKliq — full-width dark card */}
        <section className="mt-20 bg-[#242444] py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <SectionLabel>What is FlipKliq</SectionLabel>
                <p className="text-lg text-white/80">
                  FlipKliq is a visual opinion platform where people vote on
                  sports, culture, brands, design, lifestyle and trends.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-4xl font-black text-white">Two options.</p>
                <p className="text-4xl font-black text-[#E94560]">One choice.</p>
                <p className="text-4xl font-black text-white">
                  Instant results.
                </p>
              </div>
            </div>

            <p className="mx-auto mt-12 max-w-2xl text-center italic text-gray-400">
              Vote and instantly discover how your opinion compares with
              everyone else&apos;s.
            </p>
          </div>
        </section>

        {/* Beyond the vote — unchanged 2x2 grid */}
        <section className="mx-auto my-20 max-w-4xl px-6">
          <div className="text-center">
            <SectionLabel>Beyond the vote</SectionLabel>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-[#242444] p-6">
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why people use FlipKliq — centered */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <SectionLabel>Why people use FlipKliq</SectionLabel>

          <span className="block text-8xl font-black leading-none text-[#E94560]">
            &ldquo;
          </span>
          <p className="mx-auto max-w-3xl text-center text-2xl font-bold leading-relaxed text-white md:text-3xl">
            Some vote to see who wins. Others vote to see how the world thinks.
            The most interesting result isn&apos;t always the winner — it&apos;s
            the story behind the numbers.
          </p>

          <p className="mx-auto mt-8 max-w-xl text-center text-base text-gray-400">
            See the majority, spot the split, compare countries, and discover
            the story behind every choice.
          </p>
        </section>

        {/* Built for curious people — 2x2 card grid */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <SectionLabel>Built for curious people</SectionLabel>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="min-h-[160px] border-l-4 border-[#E94560] bg-[#242444] p-8"
              >
                <span className="mb-4 block text-4xl">{audience.icon}</span>
                <h3 className="mt-2 text-xl font-black text-white">
                  {audience.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-6 py-32 text-center">
          <p className="text-5xl font-black text-white md:text-7xl">
            The crowd never lies.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex items-center bg-[#E94560] px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-[#E94560]/90"
          >
            Start voting →
          </Link>
        </section>
      </main>
    </SiteShell>
  );
}
