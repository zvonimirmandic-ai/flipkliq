"use client";

import { useEffect, useState } from "react";
import { getFlagEmoji } from "@/lib/country";

type CountryStat = {
  country_code: string;
  country_name: string;
  votes: number;
};

type Stats = {
  totalPolls: number;
  totalVotes: number;
  totalCountries: number;
  topCountries: CountryStat[];
};

const ROTATE_MS = 3000;
const FADE_MS = 300;

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-4xl font-black text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-gray-400">
        {label}
      </p>
    </div>
  );
}

export function FlipkliqNumbers() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStats(data as Stats);
      })
      .catch(() => {
        // Non-essential; stay hidden on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topCountries = stats?.topCountries ?? [];

  useEffect(() => {
    if (topCountries.length < 2) {
      return;
    }
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % topCountries.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [topCountries.length]);

  if (!stats) {
    return null;
  }

  const current = topCountries[index % Math.max(topCountries.length, 1)];

  return (
    <section className="mx-auto mt-16 w-full max-w-md px-4 md:max-w-4xl">
      <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">
        By the numbers
      </h2>

      <div className="mt-6 flex items-stretch">
        <StatBlock value={stats.totalPolls} label="Polls" />
        <div className="w-px self-stretch bg-white/10" />
        <StatBlock value={stats.totalVotes} label="Total votes" />
        <div className="w-px self-stretch bg-white/10" />
        <StatBlock value={stats.totalCountries} label="Countries 🌍" />
      </div>

      {current ? (
        <p
          className={`mt-6 text-center text-sm text-white/70 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {getFlagEmoji(current.country_code)} {current.country_name} ·{" "}
          {current.votes.toLocaleString()} votes
        </p>
      ) : null}
    </section>
  );
}
