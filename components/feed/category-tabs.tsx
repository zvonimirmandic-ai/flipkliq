"use client";

import { useEffect, useState } from "react";
import { POLL_CATEGORIES } from "@/lib/types";

export type CategoryFilter = "All" | (typeof POLL_CATEGORIES)[number];

export const CATEGORY_FILTERS: CategoryFilter[] = ["All", ...POLL_CATEGORIES];

export const CATEGORY_COLORS: Record<CategoryFilter, string> = {
  All: "#E94560",
  Fashion: "#FF6B9D",
  Tech: "#00B4D8",
  Design: "#7B2FBE",
  Food: "#FF6B35",
  Travel: "#0CB89F",
  "FIFA 2026": "#1DB954",
  Other: "#6B7280",
};

const BASE_TAB =
  "inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold";

// Split-flap timing for the FIFA 2026 tab.
const FIFA_VISIBLE_MS = 2500;
const HOT_VISIBLE_MS = 3500;

type CategoryTabsProps = {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
};

// The FIFA 2026 tab: a static green tab whose label vertically scrolls
// (split-flap) between "FIFA 2026" and "🔥 HOT". The button has a fixed height
// and overflow-hidden so only one row shows; a fixed min-w keeps the width
// stable. While "🔥 HOT" is visible the 🔥 emoji wiggles 3 times.
function FifaTab({
  active,
  onSelect,
}: {
  active: boolean;
  onSelect: (category: CategoryFilter) => void;
}) {
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      return;
    }

    // Re-runs on each flip, scheduling the next with the matching dwell time.
    const id = window.setTimeout(
      () => setHot((h) => !h),
      hot ? HOT_VISIBLE_MS : FIFA_VISIBLE_MS,
    );
    return () => window.clearTimeout(id);
  }, [hot]);

  return (
    <button
      type="button"
      data-category="FIFA 2026"
      aria-pressed={active}
      aria-label="FIFA 2026"
      onClick={(event) => {
        event.currentTarget.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
        onSelect("FIFA 2026");
      }}
      style={{ backgroundColor: CATEGORY_COLORS["FIFA 2026"] }}
      className={`relative inline-flex h-11 min-w-[7rem] shrink-0 overflow-hidden whitespace-nowrap rounded-full px-4 text-sm font-semibold text-white ${
        active ? "ring-2 ring-white/80" : ""
      }`}
    >
      {/* Track is two stacked rows (each = button height); translateY(-100%)
          scrolls the second into view. */}
      <span
        className="absolute inset-0 flex flex-col transition-transform duration-[400ms] ease-in-out"
        style={{ transform: hot ? "translateY(-100%)" : "translateY(0)" }}
        aria-hidden="true"
      >
        <span className="flex h-11 shrink-0 items-center justify-center">
          FIFA 2026
        </span>
        <span className="flex h-11 shrink-0 items-center justify-center gap-1">
          <span className={`inline-block ${hot ? "animate-fire-wiggle" : ""}`}>
            🔥
          </span>
          HOT
        </span>
      </span>
    </button>
  );
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <nav
      aria-label="Poll categories"
      className="w-full overflow-x-auto scroll-smooth px-4 pb-1 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex w-max gap-2">
        {CATEGORY_FILTERS.map((category) => {
          const active = category === selected;

          if (category === "FIFA 2026") {
            return (
              <FifaTab key={category} active={active} onSelect={onSelect} />
            );
          }

          return (
            <button
              key={category}
              type="button"
              data-category={category}
              aria-pressed={active}
              onClick={(event) => {
                event.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                  block: "nearest",
                });
                onSelect(category);
              }}
              style={
                active
                  ? { backgroundColor: CATEGORY_COLORS[category] }
                  : undefined
              }
              className={`${BASE_TAB} transition-colors duration-300 ${
                active
                  ? "text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
