import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "FLIPKLIQ is TikTok meets Tinder for visual taste. Two images. One winner. Your call.",
};

const PILLARS = [
  {
    name: "FLIP",
    text: "Swipe-driven energy. Fast, instinctive, addictive — like flipping through visual choices.",
  },
  {
    name: "KLIQ",
    text: "Community click. The moment a crowd chooses a winner. Social by design.",
  },
  {
    name: "REACT",
    text: "Pure visual reaction. No text wars. Just images, gut feeling, and live results.",
  },
];

const WHY = [
  {
    name: "Zero friction",
    text: "No account. No text debates. Tap A or B and see the world's verdict instantly.",
  },
  {
    name: "Visual-first",
    text: "Images do the talking. Every poll is a design or culture moment worth having an opinion on.",
  },
  {
    name: "Built to share",
    text: "Every result becomes a shareable card. The share IS the product.",
  },
];

const AUDIENCES = [
  "Design enthusiasts (22–35)",
  "Fashion & culture fans (18–30)",
  "Curious casuals (25–45)",
];

export default function AboutPage() {
  return (
    <SiteShell>
      <main className="flex-1 bg-brand-bg">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
          {/* Hero */}
          <section className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-6xl">
              Which side are you on?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
              FLIPKLIQ is TikTok meets Tinder for visual taste. Two images. One
              winner. Your call.
            </p>
          </section>

          {/* What is FLIPKLIQ? */}
          <section className="mt-20">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
              What is FLIPKLIQ?
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PILLARS.map((pillar) => (
                <div
                  key={pillar.name}
                  className="rounded-2xl border border-white/10 bg-brand-surface p-6"
                >
                  <h3 className="text-2xl font-bold text-brand-accent">
                    {pillar.name}
                  </h3>
                  <p className="mt-3 text-white/70">{pillar.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why FLIPKLIQ? */}
          <section className="mt-20">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
              Why FLIPKLIQ?
            </h2>
            <div className="mt-8 flex flex-col gap-6">
              {WHY.map((point) => (
                <div key={point.name} className="flex gap-4">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-accent" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {point.name}
                    </h3>
                    <p className="mt-1 text-white/70">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who's it for? */}
          <section className="mt-20 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
              Who&apos;s it for?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {AUDIENCES.map((audience) => (
                <span
                  key={audience}
                  className="rounded-full border border-white/15 bg-brand-surface px-5 py-2.5 text-sm font-medium text-white/80"
                >
                  {audience}
                </span>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-24 text-center">
            <p className="text-3xl font-bold text-white sm:text-4xl">
              The crowd never lies.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-brand-accent px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90"
            >
              Start voting
            </Link>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
