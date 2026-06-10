/**
 * Seeds the database with dummy active polls (2-3 per category).
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-polls.ts
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local and inserts with the service role key, bypassing RLS.
 * Safe to re-run: polls whose title already exists are skipped.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  // Run from the project root; resolves .env.local next to package.json.
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

type SeedPoll = {
  title: string;
  category: string;
  option_a_label: string;
  option_b_label: string;
  option_a_image: string;
  option_b_image: string;
  status: "active";
};

const seed = (
  category: string,
  title: string,
  optionA: { label: string; photoId: string },
  optionB: { label: string; photoId: string },
): SeedPoll => ({
  title,
  category,
  option_a_label: optionA.label,
  option_b_label: optionB.label,
  option_a_image: img(optionA.photoId),
  option_b_image: img(optionB.photoId),
  status: "active",
});

const POLLS: SeedPoll[] = [
  // Fashion
  seed(
    "Fashion",
    "Sneaker face-off: which pair wins?",
    { label: "Bold red", photoId: "1542291026-7eec264c27ff" },
    { label: "Clean white", photoId: "1549298916-b41d501d3772" },
  ),
  seed(
    "Fashion",
    "Street style or window-shop chic?",
    { label: "Street style", photoId: "1483985988355-763728e1935b" },
    { label: "Boutique chic", photoId: "1490481651871-ab68de25d43d" },
  ),
  seed(
    "Fashion",
    "Wardrobe staple: tee or leather?",
    { label: "Plain tees", photoId: "1521572163474-6864f9cf17ab" },
    { label: "Leather jacket", photoId: "1551028719-00167b16eac5" },
  ),

  // Tech
  seed(
    "Tech",
    "Dream setup: laptop or battlestation?",
    { label: "Laptop life", photoId: "1496181133206-80ce9b88a853" },
    { label: "Desk setup", photoId: "1547082299-de196ea013d6" },
  ),
  seed(
    "Tech",
    "Daily carry: watch or headphones?",
    { label: "Smartwatch", photoId: "1523275335684-37898b6baf30" },
    { label: "Headphones", photoId: "1505740420928-5e560c06d30e" },
  ),
  seed(
    "Tech",
    "Hardware or software?",
    { label: "Circuits", photoId: "1518770660439-4636190af475" },
    { label: "Code", photoId: "1461749280684-dccba630e2f6" },
  ),

  // Design
  seed(
    "Design",
    "Where do ideas start: sketch or screen?",
    { label: "Whiteboard", photoId: "1545235617-9465d2a55698" },
    { label: "Desk tools", photoId: "1561070791-2526d30994b5" },
  ),
  seed(
    "Design",
    "Design kit: tablet or notebook?",
    { label: "Digital", photoId: "1581291518857-4e27b48ff24e" },
    { label: "Pen & paper", photoId: "1517842645767-c639042777db" },
  ),

  // Food
  seed(
    "Food",
    "The eternal question: pizza or burger?",
    { label: "Pizza", photoId: "1565299624946-b28f40a0ae38" },
    { label: "Burger", photoId: "1568901346375-23c9450c58cd" },
  ),
  seed(
    "Food",
    "Breakfast mood: sweet or savory?",
    { label: "Pancakes", photoId: "1567620905732-2d1ec7ab7445" },
    { label: "Avo toast", photoId: "1525351484163-7529414344d8" },
  ),
  seed(
    "Food",
    "Lunch pick: salad bowl or ramen?",
    { label: "Salad bowl", photoId: "1540189549336-e6e99c3679fe" },
    { label: "Ramen", photoId: "1569718212165-3a8278d5f624" },
  ),

  // Travel
  seed(
    "Travel",
    "Next trip: beach or mountains?",
    { label: "Beach", photoId: "1507525428034-b723cf961d3e" },
    { label: "Mountains", photoId: "1519681393784-d120267933ba" },
  ),
  seed(
    "Travel",
    "City break: Paris or Tokyo?",
    { label: "Paris", photoId: "1502602898657-3e91760cbb34" },
    { label: "Tokyo", photoId: "1540959733332-eab4deabeeaf" },
  ),

  // Other
  seed(
    "Other",
    "Settle it forever: cats or dogs?",
    { label: "Cats", photoId: "1514888286974-6c03e2ca1dba" },
    { label: "Dogs", photoId: "1543466835-00a7907e9de1" },
  ),
  seed(
    "Other",
    "Weekend escape: forest or lakeside?",
    { label: "Forest", photoId: "1441974231531-c6227db76b6e" },
    { label: "Lakeside", photoId: "1439066615861-d1af74d74000" },
  ),
];

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: existingError } = await supabase
    .from("polls")
    .select("title");

  if (existingError) {
    throw existingError;
  }

  const existingTitles = new Set((existing ?? []).map((poll) => poll.title));
  const toInsert = POLLS.filter((poll) => !existingTitles.has(poll.title));
  const skipped = POLLS.length - toInsert.length;

  if (skipped > 0) {
    console.log(`Skipping ${skipped} poll(s) that already exist.`);
  }

  if (toInsert.length === 0) {
    console.log("Nothing to insert. Done.");
    return;
  }

  const { data, error } = await supabase
    .from("polls")
    .insert(toInsert)
    .select("id, title, category");

  if (error) {
    throw error;
  }

  console.log(`Inserted ${data?.length ?? 0} poll(s):`);
  for (const poll of data ?? []) {
    console.log(`  [${poll.category}] ${poll.title} (${poll.id})`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
