"use client";

import { POLL_CATEGORIES } from "@/lib/types";

export type CategoryFilter = "All" | (typeof POLL_CATEGORIES)[number];

export const CATEGORY_FILTERS: CategoryFilter[] = ["All", ...POLL_CATEGORIES];

export const CATEGORY_COLORS: Record<CategoryFilter, string> = {
  All: "#E94560",
  Fashion: "#FF4D6D",
  Tech: "#00B4D8",
  Design: "#7B2FBE",
  Food: "#FF6B35",
  Travel: "#0CB89F",
  Other: "#6B7280",
};

type CategoryTabsProps = {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
};

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <nav
      aria-label="Poll categories"
      className="shrink-0 overflow-x-auto scroll-smooth px-4 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max gap-2">
        {CATEGORY_FILTERS.map((category) => {
          const active = category === selected;

          return (
            <button
              key={category}
              type="button"
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
              className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-300 ${
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
