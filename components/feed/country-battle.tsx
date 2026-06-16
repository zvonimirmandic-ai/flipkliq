"use client";

import { getCountryName, getFlagEmoji } from "@/lib/country";
import { getPercentages } from "@/lib/percentages";
import type { CountryStat } from "@/lib/types";

type CountryBattleProps = {
  countries: CountryStat[] | undefined;
  labelA: string;
  labelB: string;
  accent: string;
};

// Per-country A-vs-B battle bars. Only countries with 2+ votes are shown
// (a single vote at 100% is misleading), and the whole section is hidden
// unless at least two such countries exist. Most votes first.
export function CountryBattle({
  countries,
  labelA,
  labelB,
  accent,
}: CountryBattleProps) {
  const eligible = (countries ?? [])
    .filter((c) => c.total >= 2)
    .sort((a, b) => b.total - a.total);

  if (eligible.length < 2) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
        Country Battle
      </p>
      <ul className="flex flex-col gap-4">
        {eligible.map((country) => {
          const split = getPercentages(country.votes_a, country.votes_b);
          return (
            <li key={country.country_code}>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="text-sm leading-none">
                  {getFlagEmoji(country.country_code)}
                </span>
                <span className="text-white/80">
                  {getCountryName(country.country_code)}
                </span>
                <span>({country.total} votes)</span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="w-16 shrink-0 truncate text-right text-xs text-white/70">
                  {labelA}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    <div
                      style={{ width: `${split.a}%`, backgroundColor: accent }}
                    />
                    <div
                      className="bg-white/15"
                      style={{ width: `${split.b}%` }}
                    />
                  </div>
                  <div className="mt-0.5 flex justify-between text-[10px] text-white/50">
                    <span>{split.a}%</span>
                    <span>{split.b}%</span>
                  </div>
                </div>
                <span className="w-16 shrink-0 truncate text-xs text-white/70">
                  {labelB}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
