/**
 * Seeds the database with FIFA 2026 World Cup match polls.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-wc2026.ts
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

const flag = (iso2: string) => `https://flagcdn.com/w640/${iso2}.png`;

const CATEGORY = "FIFA 2026";

type SeedPoll = {
  title: string;
  category: string;
  option_a_label: string;
  option_b_label: string;
  option_a_image: string;
  option_b_image: string;
  status: "active";
};

const match = (
  title: string,
  teamA: { name: string; iso2: string },
  teamB: { name: string; iso2: string },
): SeedPoll => ({
  title,
  category: CATEGORY,
  option_a_label: teamA.name,
  option_b_label: teamB.name,
  option_a_image: flag(teamA.iso2),
  option_b_image: flag(teamB.iso2),
  status: "active",
});

const POLLS: SeedPoll[] = [
  // June 11 — Group A
  match(
    "Tko prolazi grupu A?",
    { name: "Mexico", iso2: "mx" },
    { name: "South Africa", iso2: "za" },
  ),
  match(
    "Iznenađenje grupe A?",
    { name: "South Korea", iso2: "kr" },
    { name: "Czech Republic", iso2: "cz" },
  ),

  // June 12 — Group B & D
  match(
    "Domaćin ili autsajder?",
    { name: "Canada", iso2: "ca" },
    { name: "Bosnia and Herzegovina", iso2: "ba" },
  ),
  match(
    "SAD ili Paraguay?",
    { name: "United States", iso2: "us" },
    { name: "Paraguay", iso2: "py" },
  ),

  // June 13 — Group C
  match(
    "Brazil ili Maroko?",
    { name: "Brazil", iso2: "br" },
    { name: "Morocco", iso2: "ma" },
  ),

  // June 14 — Group E & F
  match(
    "Njemačka ili Obala Bjelokosti?",
    { name: "Germany", iso2: "de" },
    { name: "Ivory Coast", iso2: "ci" },
  ),
  match(
    "Tulipani ili Sunce Istoka?",
    { name: "Netherlands", iso2: "nl" },
    { name: "Japan", iso2: "jp" },
  ),

  // June 15 — Group H
  match(
    "Španjolska ili Uruguay?",
    { name: "Spain", iso2: "es" },
    { name: "Uruguay", iso2: "uy" },
  ),

  // June 16 — Group J
  match(
    "Argentina ili Alžir?",
    { name: "Argentina", iso2: "ar" },
    { name: "Algeria", iso2: "dz" },
  ),

  // June 17 — Group L
  match(
    "Engleska ili Hrvatska?",
    { name: "England", iso2: "gb-eng" },
    { name: "Croatia", iso2: "hr" },
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
    .select("id, title");

  if (error) {
    throw error;
  }

  console.log(`Inserted ${data?.length ?? 0} FIFA 2026 poll(s):`);
  for (const poll of data ?? []) {
    console.log(`  ${poll.title} (${poll.id})`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
