/**
 * One-time migration: sets the `group` column on existing FIFA 2026 polls
 * by looking up which group each team belongs to.
 * Does NOT delete or re-insert polls — existing votes are preserved.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/migrate-fifa-groups.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Team → group mapping (FIFA 2026 — official draw)
const TEAM_GROUP: Record<string, string> = {
  // Group A
  "Mexico": "A", "South Africa": "A", "South Korea": "A", "Czechia": "A",
  // Group B
  "Canada": "B", "Bosnia and Herzegovina": "B", "Qatar": "B", "Switzerland": "B",
  // Group C
  "Brazil": "C", "Morocco": "C", "Haiti": "C", "Scotland": "C",
  // Group D
  "United States": "D", "Paraguay": "D", "Australia": "D", "Türkiye": "D",
  // Group E
  "Germany": "E", "Curaçao": "E", "Ivory Coast": "E", "Ecuador": "E",
  // Group F
  "Netherlands": "F", "Japan": "F", "Sweden": "F", "Tunisia": "F",
  // Group G
  "Belgium": "G", "Egypt": "G", "Iran": "G", "New Zealand": "G",
  // Group H
  "Spain": "H", "Cape Verde": "H", "Saudi Arabia": "H", "Uruguay": "H",
  // Group I
  "France": "I", "Senegal": "I", "Iraq": "I", "Norway": "I",
  // Group J
  "Argentina": "J", "Algeria": "J", "Austria": "J", "Jordan": "J",
  // Group K
  "Portugal": "K", "DR Congo": "K", "Uzbekistan": "K", "Colombia": "K",
  // Group L
  "England": "L", "Croatia": "L", "Ghana": "L", "Panama": "L",
};

async function main() {
  console.log("Fetching all FIFA 2026 polls...");

  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, option_a_label, option_b_label, group")
    .eq("category", "FIFA 2026");

  if (error) {
    console.error("Failed to fetch polls:", error.message);
    process.exit(1);
  }

  console.log(`Found ${polls.length} FIFA 2026 polls.\n`);

  let updated = 0;
  let skipped = 0;
  let knockout = 0;

  for (const poll of polls) {
    const teamA = poll.option_a_label;
    const teamB = poll.option_b_label;

    if (!teamA || !teamB) {
      skipped++;
      continue;
    }

    const groupA = TEAM_GROUP[teamA];
    const groupB = TEAM_GROUP[teamB];

    // Both teams in same group → group stage match
    if (!groupA || !groupB || groupA !== groupB) {
      console.log(`  - Knockout/unknown: ${teamA} vs ${teamB}`);
      knockout++;
      continue;
    }

    const group = groupA;

    if (poll.group === group) {
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("polls")
      .update({ group })
      .eq("id", poll.id);

    if (updateError) {
      console.error(`  ✗ ${teamA} vs ${teamB}: ${updateError.message}`);
    } else {
      console.log(`  ✓ Group ${group}: ${teamA} vs ${teamB}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Already set: ${skipped}, Knockout/unknown: ${knockout}`);
}

main();
