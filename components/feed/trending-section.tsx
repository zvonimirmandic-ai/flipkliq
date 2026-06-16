"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CATEGORY_COLORS,
  type CategoryFilter,
} from "@/components/feed/category-tabs";

type TrendingPoll = {
  id: string;
  title: string;
  option_a_image: string;
  category: string | null;
  votes_today: number;
};

export function TrendingSection() {
  const [polls, setPolls] = useState<TrendingPoll[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/polls/trending")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPolls((data.polls as TrendingPoll[]) ?? []);
      })
      .catch(() => {
        // Trending is non-essential; stay hidden on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (polls.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-16 w-full max-w-md px-4 md:max-w-4xl">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
          🔥 Trending Now
        </h2>
        <span className="text-xs text-gray-400">Last 24 hours</span>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {polls.map((poll) => {
          const category = poll.category ?? "Other";
          const accent =
            CATEGORY_COLORS[category as CategoryFilter] ?? "#E94560";

          return (
            <Link
              key={poll.id}
              href={`/poll/${poll.id}`}
              className="block w-[calc(50%_-_8px)] shrink-0 transition-transform duration-200 hover:scale-105 sm:w-[calc(33.333%_-_10.667px)] md:w-[calc(25%_-_12px)]"
            >
              <div className="relative aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poll.option_a_image}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-sm font-bold text-white">
                    {poll.title}
                  </p>
                  <p
                    className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: accent }}
                  >
                    {category}
                  </p>
                  <p className="text-[10px] text-white/60">
                    🔥 {poll.votes_today} votes today
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
