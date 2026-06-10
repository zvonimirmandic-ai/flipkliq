"use client";

import { POLL_CATEGORIES } from "@/lib/types";

export type CategoryFilter = "All" | (typeof POLL_CATEGORIES)[number];

export const CATEGORY_FILTERS: CategoryFilter[] = ["All", ...POLL_CATEGORIES];

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
              className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-accent text-white"
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
