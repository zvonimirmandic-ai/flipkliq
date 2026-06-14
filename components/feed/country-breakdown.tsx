"use client";

import { getCountryName, getFlagEmoji } from "@/lib/country";
import { getPercentages } from "@/lib/percentages";
import type { CountryStat } from "@/lib/types";

type CountryBreakdownProps = {
  countries: CountryStat[] | undefined;
  accent: string;
  limit?: number;
  // When true, always render the section (with an empty state) even if there's
  // no country data yet — used for consistent archive card layout.
  showEmpty?: boolean;
};

// "Votes by country" — flag, country name, A/B split bar, and total per
// country. Hidden when empty unless `showEmpty` is set.
export function CountryBreakdown({
  countries,
  accent,
  limit = 5,
  showEmpty = false,
}: CountryBreakdownProps) {
  const list = countries ?? [];

  if (list.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
        Votes by country
      </p>
      {list.length === 0 ? (
        <p className="text-center text-xs italic text-white/40">
          No country data yet
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.slice(0, limit).map((country) => {
          const split = getPercentages(country.votes_a, country.votes_b);
          return (
            <li
              key={country.country_code}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-base leading-none">
                {getFlagEmoji(country.country_code)}
              </span>
              <span className="w-20 shrink-0 truncate text-white/80">
                {getCountryName(country.country_code)}
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${split.a}%`, backgroundColor: accent }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-white/60">
                {country.total}
              </span>
            </li>
          );
        })}
        </ul>
      )}
    </div>
  );
}
